import React from "react";

const Home = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="mb-3 inline-block rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1 text-sm text-violet-300">
            Seguimiento de anime
          </p>

          <h1 className="text-5xl font-black leading-tight">
            Organizá tu anime y manga con{" "}
            <span className="bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              YumeTrack
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-lg text-zinc-400">
            Buscá títulos, guardalos en tu lista, marcá favoritos y seguí tu
            progreso de forma simple y visual.
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-violet-900/20">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 p-4">
              <p className="text-sm text-zinc-400">Por ver</p>
              <p className="mt-2 text-2xl font-bold text-white">127 títulos</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-sky-500/20 to-cyan-500/20 p-4">
              <p className="text-sm text-zinc-400">Favoritos</p>
              <p className="mt-2 text-2xl font-bold text-white">18</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/20 p-4">
              <p className="text-sm text-zinc-400">En curso</p>
              <p className="mt-2 text-2xl font-bold text-white">9</p>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-rose-500/20 p-4">
              <p className="text-sm text-zinc-400">Completados</p>
              <p className="mt-2 text-2xl font-bold text-white">54</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
