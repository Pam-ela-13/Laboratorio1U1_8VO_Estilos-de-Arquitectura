import { LoaderCircle, WandSparkles } from "lucide-react";
import { useState } from "react";
import { getFeatureLabel } from "../labels";

export function PredictionForm({ schema, loading, onPredict }) {
  const [values, setValues] = useState({});

  function submit(event) {
    event.preventDefault();
    onPredict(values);
  }

  return (
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <div className="rounded-2xl bg-coral/10 p-3 text-coral"><WandSparkles size={22} /></div>
        <div>
          <h2 className="font-display text-2xl font-bold text-ink">Realiza una predicción</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">Ingresa las condiciones actuales para estimar si lloverá.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {schema.map((field) => (
          <label key={field.name} className="text-sm font-semibold text-slate-600">
            <span className="mb-2 block">{getFeatureLabel(field.name)}</span>
            <input
              required
              type={field.type === "number" ? "number" : "text"}
              step={field.type === "number" ? "any" : undefined}
              value={values[field.name] || ""}
              onChange={(event) => setValues({ ...values, [field.name]: event.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-mist px-4 py-3 font-normal text-ink outline-none transition placeholder:text-slate-400 focus:border-ocean focus:ring-4 focus:ring-ocean/10"
              placeholder={`Ingresa ${getFeatureLabel(field.name).toLowerCase()}`}
            />
          </label>
        ))}
      </div>

      <button type="submit" disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-5 py-3.5 font-semibold text-white transition hover:bg-[#d95748] disabled:cursor-not-allowed disabled:opacity-50">
        {loading && <LoaderCircle size={18} className="animate-spin" />}
        {loading ? "Analizando..." : "Generar predicción"}
      </button>
    </form>
  );
}