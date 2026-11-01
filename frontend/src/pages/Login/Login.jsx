import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginRequest } from "../../services/authService";
import useDocumentTitle from "../../hooks/useDocumentTitle";

const Login = () => {
  useDocumentTitle("Iniciar sesión");
  const navigate = useNavigate();
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      login(data);
      navigate("/");
    } catch (error) {
      const backedMessage =
        error.response?.data?.message ||
        error.reponse?.data?.title ||
        "No se pudo iniciar sesión";
      setErrorMessage(backedMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-4 py-10 overflow-hidden">
      {/* PERSONAJE IZQUIERDA */}
      <img
        src="/characters/gojo.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none hidden xl:block absolute left-0 top-1/2 -translate-y-1/2 h-[420px]"
      />

      {/* PERSONAJE DERECHA */}
      <img
        src="/characters/itachi.webp"
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className="pointer-events-none hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 h-[420px]"
      />

      {/* FORM (NO TOCADO) */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-panel p-8">
        <h1 className="text-3xl text-paper">Iniciar sesión</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Accedé a tu cuenta para continuar.
        </p>
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
              className="w-full rounded-md bg-ground px-4 py-3 text-paper transition"
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
              className="w-full rounded-md bg-ground px-4 py-3 text-paper transition"
            />
          </div>
          {errorMessage && (
            <div className="rounded-md   bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-accent px-4 py-3 font-semibold text-paper transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
