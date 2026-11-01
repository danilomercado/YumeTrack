import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { loginMfaRequest, loginRequest } from "../../services/authService";
import AuthShell from "../../components/AuthShell/AuthShell";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Login = () => {
  useDocumentTitle("Iniciar sesión");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mfaToken, setMfaToken] = useState(null);
  const [mfaCode, setMfaCode] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!form.email.trim() || !form.password.trim()) {
      setErrorMessage("Completa correo y contraseña");
      return;
    }

    try {
      setIsLoading(true);

      const data = await loginRequest({
        email: form.email,
        password: form.password,
      });

      if (data.mfaRequired) {
        setMfaToken(data.mfaToken);
        return;
      }

      login(data);
      navigate("/");
    } catch (error) {
      const backedMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "No se pudo iniciar sesión";
      setErrorMessage(backedMessage);
    } finally {
      setIsLoading(false);
    }
  };
  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!mfaCode.trim()) {
      setErrorMessage("Ingresá el código.");
      return;
    }

    try {
      setIsLoading(true);
      const data = await loginMfaRequest({ mfaToken, code: mfaCode });
      login(data);
      navigate("/");
    } catch (error) {
      setErrorMessage(error.message || "El código no es correcto.");
    } finally {
      setIsLoading(false);
    }
  };

  if (mfaToken) {
    return (
      <AuthShell
        title="Verificación en dos pasos"
        subtitle="Escribí el código de 6 dígitos de tu app de autenticación, o uno de tus códigos de recuperación."
        tagline="もう一歩！"
        altText="¿No es tu cuenta?"
        altLabel="Volver"
        altTo="/login"
        characters={["/characters/gojo.webp", "/characters/itachi.webp"]}
      >
        <form onSubmit={handleMfaSubmit} className="mt-6 space-y-4">
          <input
            autoFocus
            inputMode="text"
            autoComplete="one-time-code"
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            placeholder="123456"
            aria-label="Código de verificación"
            className="w-full rounded-xl bg-ground px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] text-paper"
          />

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
            {isLoading ? "Verificando..." : "Verificar"}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accedé a tu cuenta para continuar."
      tagline="おかえり！"
      altText="¿Todavía no tenés cuenta?"
      altLabel="Crear cuenta"
      altTo="/register"
      characters={["/characters/gojo.webp", "/characters/itachi.webp"]}
    >
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm text-zinc-300" htmlFor="email">
            Correo
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="tuemail@gmail.com"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper transition"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm text-zinc-300"
            htmlFor="password"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="********"
            className="w-full rounded-xl bg-ground px-4 py-3 text-paper transition"
          />
        </div>
        {errorMessage && (
          <div className="rounded-xl   bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-accent px-4 py-3 font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>
        <p className="text-center text-sm">
          <Link
            to="/forgot-password"
            className="text-zinc-400 transition hover:text-paper"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </form>
    </AuthShell>
  );
};

export default Login;
