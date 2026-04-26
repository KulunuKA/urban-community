import { Construction } from "lucide-react";

/**
 * Placeholder for admin sections that are not implemented yet.
 * Keeps navigation and routing consistent without affecting other features.
 */
export default function AdminSectionPlaceholderPage({ title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-10 text-center backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
        <Construction size={28} strokeWidth={1.75} aria-hidden />
      </div>
      <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-white">
        {title}
      </h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
        {description ||
          "This section is planned for a future release. Use the sidebar to access available tools."}
      </p>
    </div>
  );
}
