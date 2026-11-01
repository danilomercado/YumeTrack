import { useState } from "react";
import AuthShell from "../../components/AuthShell/AuthShell";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { forgotPasswordRequest } from "../../services/authService";

const ForgotPassword = () => {
  useDocumentTitle("Recuperar contraseña");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!email.trim()) {
      setErrorMessage("Ingresá tu correo.");
      return;
    }

    try {
      setIsLoading(true);
      await forgotPasswordRequest(email.trim());
      setSent(true);
    } catch (error) {
      setErrorMessage(error.message || "No se pudo enviar el pedido.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviamos un enlace para elegir una nueva."
      tagline="大丈夫！"
      altText="¿Te acordaste?"
      altLabel="Volver a ingresar"
      altTo="/login"
      characters={["/characters/itachi.webp", "/characters/gojo.webp"]}
    >
      {sent ? (
        <div className="mt-6 rounded-2xl bg-panel-2 p-5 text-sm leading-relaxed text-zinc-200">
          Si ese correo está registrado, ya te mandamos un enlace. Revisá tu
          bandeja de entrada y la carpeta de spam. El enlace vale 30 minutos.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300" htmlFor="email">
              Correo
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="tuemail@gmail.com"
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
            {isLoading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      )}
    </AuthShell>
  );
};

export default ForgotPassword;
