import { useEffect, useState } from "react";
import QRCode from "qrcode";
import PageBanner from "../../components/PageBanner/PageBanner";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { useToast } from "../../context/ToastContext";
import {
  changePasswordRequest,
  disableMfaRequest,
  enableMfaRequest,
  getMfaStatusRequest,
  setupMfaRequest,
} from "../../services/securityService";

const cardClass = "rounded-2xl bg-panel p-6 sm:p-8";
const inputClass = "w-full rounded-xl bg-ground px-4 py-3 text-paper";
const primaryButton =
  "rounded-full bg-accent px-6 py-3 text-sm font-bold text-paper hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60";

const MfaCard = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState(null);
  const [setup, setSetup] = useState(null);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState(null);
  const [disabling, setDisabling] = useState(false);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    try {
      setStatus(await getMfaStatusRequest());
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const run = async (action) => {
    setError("");
    setBusy(true);

    try {
      await action();
    } catch (err) {
      setError(err.message || "Algo salió mal.");
    } finally {
      setBusy(false);
    }
  };

  const startSetup = () =>
    run(async () => {
      const data = await setupMfaRequest();
      setQr(
        await QRCode.toDataURL(data.otpAuthUri, {
          width: 220,
          margin: 1,
          color: { dark: "#0b0b0c", light: "#fafafa" },
        }),
      );
      setSetup(data);
    });

  const confirmEnable = (event) => {
    event.preventDefault();
    run(async () => {
      const data = await enableMfaRequest(code);
      setRecoveryCodes(data.recoveryCodes);
      setSetup(null);
      setCode("");
      toast("Verificación en dos pasos activada");
      await refresh();
    });
  };

  const confirmDisable = (event) => {
    event.preventDefault();
    run(async () => {
      await disableMfaRequest({ password, code });
      setDisabling(false);
      setPassword("");
      setCode("");
      toast("Verificación en dos pasos desactivada");
      await refresh();
    });
  };

  const downloadCodes = () => {
    const blob = new Blob(
      [`Códigos de recuperación de YumeTrack\n\n${recoveryCodes.join("\n")}\n`],
      { type: "text/plain" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "yumetrack-codigos-de-recuperacion.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={cardClass}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl text-paper">Verificación en dos pasos</h2>
          <p className="mt-2 max-w-xl text-sm text-zinc-300">
            Es opcional. Si la activás, además de la contraseña te pedimos un
            código de 6 dígitos de una app como Google Authenticator, Authy o
            1Password.
          </p>
        </div>

        {status && (
          <span
            className={`rounded-full px-4 py-1.5 text-sm font-bold ${
              status.enabled
                ? "bg-accent text-paper"
                : "bg-panel-2 text-zinc-300"
            }`}
          >
            {status.enabled ? "Activada" : "Desactivada"}
          </span>
        )}
      </div>

      {error && (
        <div className="mt-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {recoveryCodes && (
        <div className="mt-6 rounded-2xl bg-ground p-5">
          <p className="font-bold text-paper">
            Guardá tus códigos de recuperación
          </p>
          <p className="mt-1 text-sm text-zinc-300">
            Si perdés el teléfono, cada código sirve una sola vez para entrar.
            No los vamos a mostrar de nuevo.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 font-mono text-sm text-paper sm:grid-cols-5">
            {recoveryCodes.map((item) => (
              <li key={item} className="rounded-lg bg-panel-2 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={downloadCodes}
              className={primaryButton}
            >
              Descargar
            </button>
            <button
              type="button"
              onClick={() => setRecoveryCodes(null)}
              className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper"
            >
              Ya los guardé
            </button>
          </div>
        </div>
      )}

      {status && !status.enabled && !setup && !recoveryCodes && (
        <button
          type="button"
          onClick={startSetup}
          disabled={busy}
          className={`${primaryButton} mt-6`}
        >
          Activar verificación en dos pasos
        </button>
      )}

      {setup && (
        <form
          onSubmit={confirmEnable}
          className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]"
        >
          <img
            src={qr}
            alt="Código QR para tu app de autenticación"
            width="220"
            height="220"
            className="rounded-2xl"
          />

          <div className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm text-zinc-300">
              <li>Abrí tu app de autenticación y escaneá el código QR.</li>
              <li>Escribí acá el código de 6 dígitos que te muestra.</li>
            </ol>

            <p className="text-[13px] text-zinc-400">
              ¿No podés escanear? Ingresá esta clave a mano:{" "}
              <span className="select-all font-mono text-paper">
                {setup.secret}
              </span>
            </p>

            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              aria-label="Código de 6 dígitos"
              className={`${inputClass} max-w-[12rem] text-center font-mono text-xl tracking-[0.3em]`}
            />

            <div className="flex gap-3">
              <button type="submit" disabled={busy} className={primaryButton}>
                Confirmar y activar
              </button>
              <button
                type="button"
                onClick={() => setSetup(null)}
                className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      )}

      {status?.enabled && !recoveryCodes && (
        <div className="mt-6">
          <p className="text-sm text-zinc-300">
            Te quedan {status.recoveryCodesLeft} códigos de recuperación.
          </p>

          {!disabling ? (
            <button
              type="button"
              onClick={() => setDisabling(true)}
              className="mt-4 rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper hover:bg-white/10"
            >
              Desactivar
            </button>
          ) : (
            <form onSubmit={confirmDisable} className="mt-4 max-w-sm space-y-3">
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tu contraseña"
                aria-label="Tu contraseña"
                className={inputClass}
              />
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="Código de la app o de recuperación"
                aria-label="Código de verificación"
                className={inputClass}
              />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className={primaryButton}>
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setDisabling(false)}
                  className="rounded-full bg-panel-2 px-6 py-3 text-sm font-bold text-paper"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
};

const PasswordCard = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (event) =>
    setForm((prev) => ({ ...prev, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.next !== form.confirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    try {
      setBusy(true);
      await changePasswordRequest({
        currentPassword: form.current,
        newPassword: form.next,
      });
      setForm({ current: "", next: "", confirm: "" });
      toast("Contraseña actualizada");
    } catch (err) {
      setError(err.message || "No se pudo cambiar la contraseña.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cardClass}>
      <h2 className="text-2xl text-paper">Cambiar contraseña</h2>
      <p className="mt-2 text-sm text-zinc-300">
        Mínimo 8 caracteres, con letras y números.
      </p>

      <form onSubmit={submit} className="mt-6 max-w-sm space-y-3">
        <input
          type="password"
          autoComplete="current-password"
          value={form.current}
          onChange={update("current")}
          placeholder="Contraseña actual"
          aria-label="Contraseña actual"
          className={inputClass}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={form.next}
          onChange={update("next")}
          placeholder="Contraseña nueva"
          aria-label="Contraseña nueva"
          className={inputClass}
        />
        <input
          type="password"
          autoComplete="new-password"
          value={form.confirm}
          onChange={update("confirm")}
          placeholder="Repetí la nueva"
          aria-label="Repetí la contraseña nueva"
          className={inputClass}
        />

        {error && (
          <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button type="submit" disabled={busy} className={primaryButton}>
          Guardar
        </button>
      </form>
    </section>
  );
};

const SecuritySettings = () => {
  useDocumentTitle("Seguridad");

  return (
    <main className="mx-auto min-h-dvh max-w-4xl px-4 py-8 text-paper sm:px-6">
      <PageBanner
        title="Seguridad"
        subtitle="Protegé tu cuenta con una verificación extra y mantené tu contraseña al día."
        kanji="守"
        image="/art/red-fuji.jpg"
      />

      <div className="space-y-6">
        <MfaCard />
        <PasswordCard />
      </div>
    </main>
  );
};

export default SecuritySettings;
