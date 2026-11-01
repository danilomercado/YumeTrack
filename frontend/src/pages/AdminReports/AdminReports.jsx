import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageBanner from "../../components/PageBanner/PageBanner";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useToast } from "../../context/ToastContext";
import {
  dismissReportRequest,
  getAdminReportsRequest,
  removeReportedContentRequest,
} from "../../services/communityService";
import { formatRelativeTime } from "../../utils/formatRelativeTime";

const TYPE_LABEL = { review: "Reseña", comment: "Comentario", user: "Usuario" };
const REASON_LABEL = {
  spam: "Spam",
  acoso: "Acoso",
  inapropiado: "Inapropiado",
  spoilers: "Spoilers",
  otro: "Otro",
};

const AdminReports = () => {
  useDocumentTitle("Denuncias");
  const { toast } = useToast();
  const [reports, setReports] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminReportsRequest()
      .then(setReports)
      .catch((err) => {
        setReports([]);
        setError(
          err.response?.status === 403
            ? "Tu cuenta no tiene permisos de administración."
            : err.message || "No se pudieron cargar las denuncias.",
        );
      });
  }, []);

  const act = async (report, action) => {
    try {
      if (action === "dismiss") await dismissReportRequest(report.id);
      else await removeReportedContentRequest(report.id);

      // Se cierran todas las denuncias sobre el mismo contenido.
      setReports((list) =>
        list.filter(
          (item) =>
            !(
              item.targetType === report.targetType &&
              item.targetId === report.targetId
            ),
        ),
      );
      toast(
        action === "dismiss" ? "Denuncia descartada" : "Contenido eliminado",
      );
    } catch (err) {
      toast(err.message || "No se pudo completar la acción", "error");
    }
  };

  return (
    <main className="mx-auto min-h-dvh max-w-5xl px-4 py-8 text-paper sm:px-6">
      <PageBanner
        title="Denuncias"
        subtitle="Contenido que la comunidad marcó para revisar, de la más antigua a la más nueva."
        kanji="審"
        image="/art/red-fuji.jpg"
      />

      {error && (
        <div className="mb-6 rounded-2xl bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {reports === null ? (
        <div className="h-40 animate-pulse rounded-2xl bg-panel" />
      ) : reports.length === 0 && !error ? (
        <div className="rounded-2xl bg-panel p-8 text-center text-sm text-zinc-300">
          No hay denuncias pendientes. Todo tranquilo.
        </div>
      ) : (
        <ul className="space-y-4">
          {reports.map((report) => (
            <li key={report.id} className="rounded-2xl bg-panel p-5">
              <div className="flex flex-wrap items-center gap-2 text-[13px]">
                <span className="rounded-full bg-accent px-3 py-1 font-bold text-paper">
                  {TYPE_LABEL[report.targetType] ?? report.targetType}
                </span>
                <span className="rounded-full bg-panel-2 px-3 py-1 text-zinc-200">
                  {REASON_LABEL[report.reason] ?? report.reason}
                </span>
                {report.reportsOnSameTarget > 1 && (
                  <span className="rounded-full bg-paper px-3 py-1 font-bold text-ground">
                    {report.reportsOnSameTarget} denuncias
                  </span>
                )}
                <span className="text-zinc-500">
                  {formatRelativeTime(report.createdAt)} · por{" "}
                  {report.reporterName}
                </span>
              </div>

              <p className="mt-3 text-sm text-zinc-400">
                Autor:{" "}
                {report.ownerName ? (
                  <Link
                    to={`/profile/${report.ownerName}`}
                    className="font-bold text-paper hover:text-accent-soft"
                  >
                    {report.ownerName}
                  </Link>
                ) : (
                  "el contenido ya no existe"
                )}
              </p>

              {report.preview && (
                <p className="mt-2 whitespace-pre-line break-words rounded-xl bg-ground p-3 text-sm text-zinc-200">
                  {report.preview}
                </p>
              )}

              {report.details && (
                <p className="mt-2 text-sm text-zinc-400">
                  Detalle: {report.details}
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => act(report, "dismiss")}
                  className="rounded-full bg-panel-2 px-5 py-2 text-sm font-bold text-paper hover:bg-white/10"
                >
                  Descartar
                </button>
                {report.targetType !== "user" && report.contentExists && (
                  <button
                    type="button"
                    onClick={() => act(report, "remove")}
                    className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-paper hover:bg-accent-hover"
                  >
                    Eliminar contenido
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default AdminReports;
