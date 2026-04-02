// @ts-nocheck
export default function Page() {
  return (
    <main className="min-h-screen bg-black text-white p-10 flex flex-col items-center justify-center">
      <h1 className="text-6xl font-black tracking-tighter mb-4">AUTONOMOUS SAAS FORGE</h1>
      <p className="text-xl opacity-70 mb-8 max-w-2xl text-center">
        Genera SaaS rentables en menos de 30 días con validación real, riesgo controlado y ventas integradas.
      </p>
      <div className="flex gap-4">
        <button className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-opacity-90 transition-all">
          Iniciar Forja
        </button>
        <button className="px-8 py-3 border border-zinc-800 font-bold rounded-full hover:bg-zinc-900 transition-all">
          Ver Documentación
        </button>
      </div>
    </main>
  );
}
