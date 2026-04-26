/**
 * Dark-theme panel wrapper for charts (reusable across dashboards).
 */
export function ChartCard({ title, description, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm ${className}`}
    >
      <h3 className="text-sm font-semibold tracking-tight text-slate-200">
        {title}
      </h3>
      {description ? (
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      ) : null}
      <div className="mt-4 min-h-[120px]">{children}</div>
    </div>
  );
}
