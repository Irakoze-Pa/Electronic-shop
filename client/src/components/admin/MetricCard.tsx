export function MetricCard({ label, value, tone = "blue" }: { label: string; value: string | number; tone?: "blue" | "amber" | "red" | "green" }) {
  const colors = { blue: "border-sky-200 bg-sky-50", amber: "border-amber-200 bg-amber-50", red: "border-red-200 bg-red-50", green: "border-emerald-200 bg-emerald-50" };
  return <article className={`rounded-2xl border p-5 ${colors[tone]}`}><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-2xl font-black text-slate-900">{value}</p></article>;
}
