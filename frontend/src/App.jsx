import { AlertTriangle, BarChart3, CheckCircle2, CloudSun, RefreshCcw, UploadCloud } from "lucide-react";
import { useState } from "react";
import { predict, trainModel } from "./api";
import { MetricCard } from "./components/MetricCard";
import { Modal } from "./components/Modal";
import { PredictionForm } from "./components/PredictionForm";
import { UploadPanel } from "./components/UploadPanel";
import { getPredictionMessage, metricLabels } from "./labels";

const metrics = [
  [metricLabels.accuracy, "accuracy"],
  [metricLabels.precision, "precision"],
  [metricLabels.recall, "recall"],
  [metricLabels.f1, "f1"],
];

export default function App() {
  const [results, setResults] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrain(file) {
    setLoading(true);
    setError("");
    try {
      setResults(await trainModel(file));
      setPrediction(null);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function handlePredict(values) {
    setLoading(true);
    setError("");
    try {
      setPrediction(await predict(values));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setResults(null);
    setPrediction(null);
    setError("");
  }

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="border-b border-white/10 bg-ink text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <div className="flex items-center gap-3"><CloudSun className="text-coral" size={25} /><span className="font-display text-xl font-bold tracking-tight">WeatherML</span></div>
          <span className="hidden text-sm text-slate-300 sm:block">Laboratorio de arquitectura de software</span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 lg:px-8 lg:py-16">
        {!results ? (
          <section className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-ocean/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ocean"><UploadCloud size={14} /> Predicción meteorológica</p>
              <h1 className="font-display text-5xl font-bold leading-[1.05] text-ink sm:text-6xl">Convierte datos en decisiones.</h1>
              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-600">Entrena un modelo con tus observaciones y explora la probabilidad de lluvia con una interfaz clara y directa.</p>
              <div className="mt-8 flex gap-6 text-sm text-slate-500"><span><strong className="text-ink">01</strong> Carga datos</span><span><strong className="text-ink">02</strong> Entrena</span><span><strong className="text-ink">03</strong> Predice</span></div>
            </div>
            <UploadPanel loading={loading} onTrain={handleTrain} />
          </section>
        ) : (
          <section>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <div><p className="mb-2 text-sm font-bold uppercase tracking-wider text-ocean">Modelo listo</p><h1 className="font-display text-4xl font-bold text-ink sm:text-5xl">Resultados del entrenamiento</h1><p className="mt-3 text-slate-500">El modelo aprendió con {results.rows} registros y {results.features} características.</p></div>
              <button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-ocean hover:text-ocean"><RefreshCcw size={17} /> Nuevo dataset</button>
            </div>

            <div className="mb-8 flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"><CheckCircle2 size={21} /><p className="text-sm">Entrenamiento completado. Ya puedes probar el formulario de predicción.</p></div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([name, kind]) => <MetricCard key={kind} name={name} kind={kind} value={results.metrics[kind]} />)}</div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <PredictionForm schema={results.feature_schema} loading={loading} onPredict={handlePredict} />
              <aside className="rounded-3xl bg-ink p-6 text-white shadow-soft sm:p-8"><div className="flex items-center gap-3"><BarChart3 className="text-coral" /><h2 className="font-display text-2xl font-bold">Lectura rápida</h2></div><dl className="mt-8 space-y-5">{[["Registros", results.rows], ["Características", results.features], ["Objetivo", "Lluvia"]].map(([label, value]) => <div key={label} className="flex items-center justify-between border-b border-white/10 pb-4"><dt className="text-sm text-slate-300">{label}</dt><dd className="font-display text-xl font-bold">{value}</dd></div>)}</dl><p className="mt-8 text-sm leading-6 text-slate-300">La predicción usa el mismo preprocesamiento aplicado durante el entrenamiento.</p></aside>
            </div>
          </section>
        )}
      </main>

      {error && <div className="fixed bottom-5 left-5 z-40 flex max-w-md items-start gap-3 rounded-2xl border border-red-200 bg-white p-4 text-sm text-red-700 shadow-soft"><AlertTriangle size={19} className="mt-0.5 shrink-0" /><span>{error}</span><button type="button" onClick={() => setError("")} className="ml-auto font-bold" aria-label="Cerrar error">×</button></div>}
      <Modal open={Boolean(prediction)} title="Resultado de la predicción" onClose={() => setPrediction(null)}>{prediction && <div className="text-center"><div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-coral/10 text-4xl">{prediction.label === "Yes" ? "☂" : "☀"}</div><p className="mt-5 text-sm uppercase tracking-wider text-slate-500">Pronóstico del modelo</p><p className="mt-1 font-display text-3xl font-bold text-ink">{getPredictionMessage(prediction.label)}</p>{prediction.probability !== null && <p className="mt-3 text-slate-600">Confianza aproximada: <strong>{prediction.probability}%</strong></p>}<button type="button" onClick={() => setPrediction(null)} className="mt-7 w-full rounded-xl bg-ink px-5 py-3 font-semibold text-white transition hover:bg-ocean">Cerrar resultado</button></div>}</Modal>
      <footer className="border-t border-slate-200 px-5 py-6 text-center text-sm text-slate-500">WeatherML · Predicción de lluvia con aprendizaje automático</footer>
    </div>
  );
}