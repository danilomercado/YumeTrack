import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { registerRequest } from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (!form.userName.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage("Completá usuario, correo y contraseña.");
      return;
    }

    try {
      setIsLoading(true);

      const data = await registerRequest({
        userName: form.userName,
        email: form.email,
        password: form.password,
      });

      console.log("REGISTER RESPONSE:", data);

      login(data);
      navigate("/search");
    } catch (error) {
      const backendMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        "No se pudo crear la cuenta.";

      setErrorMessage(backendMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl shadow-pink-900/20 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Registrate y empezá a trackear títulos.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label
              className="mb-2 block text-sm text-zinc-300"
              htmlFor="userName"
            >
              Usuario
            </label>
            <input
              id="userName"
              name="userName"
              type="text"
              value={form.userName}
              onChange={handleChange}
              placeholder="nombre"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
            />
          </div>

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
              placeholder="email@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
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
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
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
            className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 px-4 py-3 font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Register;
