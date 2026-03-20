import React from "react";

const Register = () => {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-6xl items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/70 p-8 shadow-2xl shadow-pink-900/20 backdrop-blur">
        <h1 className="text-3xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Registrate y empezá a trackear títulos.
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm text-zinc-300">Usuario</label>
            <input
              type="text"
              placeholder="danilo"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">Correo</label>
            <input
              type="email"
              placeholder="tuemail@gmail.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-300">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-pink-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-pink-600 to-violet-600 px-4 py-3 font-semibold text-white transition hover:scale-[1.01]"
          >
            Registrarme
          </button>
        </form>
      </div>
    </main>
  );
};

export default Register;
