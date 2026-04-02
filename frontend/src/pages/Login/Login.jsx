import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { loginRequest } from "../../services/authService";

const Login = () => {
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

      console.log("REGISTER RESPONSE:", data);

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
        src="/characters/gojo.png"
        alt="gojo"
        className="pointer-events-none hidden xl:block absolute left-0 top-1/2 -translate-y-1/2 h-[420px] opacity-80 animate-float"
      />

      {/* PERSONAJE DERECHA */}
      <img
        src="/characters/itachi.png"
        alt="itachi"
        className="pointer-events-none hidden xl:block absolute right-0 top-1/2 -translate-y-1/2 h-[420px] opacity-80 animate-float"
      />

      {/* FORM (NO TOCADO) */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl shadow-violet-900/20 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Iniciar sesión</h1>

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
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
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
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
            />
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 px-4 py-3 font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
