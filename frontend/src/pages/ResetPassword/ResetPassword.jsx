import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "../../components/AuthShell/AuthShell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { resetPasswordRequest } from "../../services/authService";
import { useToast } from "../../context/ToastContext";

const ResetPassword = () => {
  useDocumentTitle("Nueva contraseña");
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (password !== confirm) {
      setErrorMessage("Las contraseñas no coinciden.");
      return;
    }

    try {
      setIsLoading(true);
      await resetPasswordRequest({ email, token, newPassword: password });
      toast("Contraseña actualizada");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message || "No se pudo cambiar la contraseña.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Nueva contraseña"
      subtitle="Elegí una contraseña de al menos 8 caracteres, con letras y números."
      tagline="新しい始まり"
      altText="¿El enlace venció?"
      altLabel="Pedir otro"
      altTo="/forgot-password"
      characters={["/characters/gojo.webp", "/characters/itachi.webp"]}
    >
      {!email || !token ? (
        <div className="mt-6 rounded-2xl bg-panel-2 p-5 text-sm text-zinc-200">
          Este enlace no es válido.{" "}
          <Link to="/forgot-password" className="font-bold text-accent-soft">
            Pedí uno nuevo
          </Link>
          .
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              className="mb-2 block text-sm text-zinc-300"
              htmlFor="password"
            >
              Contraseña nueva
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl bg-ground px-4 py-3 text-paper"
            />
          </div>

          <div>
            <label
              className="mb-2 block text-sm text-zinc-300"
              htmlFor="confirm"
            >
              Repetila
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              className="w-full rounded-xl bg-ground px-4 py-3 text-paper"
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-full bg-accent px-4 py-3 font-bold text-paper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ResetPassword;
