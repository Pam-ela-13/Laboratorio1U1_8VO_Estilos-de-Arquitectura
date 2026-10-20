import { Activity, Crosshair, Gauge, Target } from "lucide-react";

const icons = { accuracy: Target, precision: Crosshair, recall: Activity, f1: Gauge };

export function MetricCard({ name, value, kind }) {
  const Icon = icons[kind] || Activity;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
        <Icon size={17} className="text-ocean" />
        {name}
      </div>
      <p className="mt-4 font-display text-3xl font-bold text-ink">{value}%</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-ocean transition-all" style={{ width: `${value}%` }} />
      </div>
    </article>
  );
}