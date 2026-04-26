import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import { ROUTES } from "@/constants/routes";
import {
  AlertTriangle,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  Building2,
} from "lucide-react";

export default function AdminEventManagementPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getEvents({
        page,
        limit,
        search: debouncedSearch || undefined,
      });
      const body = res.data;
      const tp = Math.max(1, body.totalPages ?? 1);
      setTotal(body.total ?? 0);
      setTotalPages(tp);
      if (page > tp) {
        setEvents([]);
        setPage(tp);
        return;
      }
      setEvents(body.data || []);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Failed to load events",
      );
      setEvents([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          Event Management
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          View community events created by organizations
        </p>
      </header>

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search title, description, location, or host…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none ring-violet-500/40 transition focus:border-violet-500/40 focus:ring-2"
            aria-label="Search events"
          />
        </div>

        <div className="relative">
          <select
            value={String(limit)}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-300 outline-none transition hover:border-white/15"
            aria-label="Rows per page"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
        </div>
      </div>

      {!loading && (
        <p className="mb-4 text-sm font-medium text-slate-500">
          {total === 0
            ? "No events match your search"
            : `Showing ${from}–${to} of ${total}`}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] py-16">
          <Loader2
            className="h-8 w-8 animate-spin text-violet-400"
            aria-hidden
          />
          <p className="mt-3 text-sm text-slate-500">Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] py-16">
          <AlertTriangle className="h-10 w-10 text-slate-600" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            No events found
          </p>
          <p className="mt-1 max-w-sm text-center text-xs text-slate-600">
            Try another search or check back when organizations publish events.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((ev) => (
            <li key={ev._id} className="list-none">
              <Link
                to={ROUTES.adminEventDetail(ev._id)}
                className="block rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-left no-underline backdrop-blur-sm transition hover:border-violet-500/30 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-500"
              >
                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-300">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {ev.date
                        ? new Date(ev.date).toLocaleString(undefined, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "—"}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                      <Building2 className="h-3.5 w-3.5" aria-hidden />
                      {ev.organization || "Organization"}
                    </span>
                  </div>

                  <h2 className="text-base font-bold leading-snug text-slate-100">
                    {ev.title}
                  </h2>

                  <p className="line-clamp-2 text-sm leading-relaxed text-slate-400">
                    {ev.description}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                      {ev.location}
                    </span>
                    {ev.createdAt && (
                      <span>
                        Listed{" "}
                        {new Date(ev.createdAt).toLocaleDateString(undefined, {
                          dateStyle: "medium",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {!loading && total > 0 && (
        <nav
          className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row"
          aria-label="Pagination"
        >
          <p className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((p) => (p < totalPages ? p + 1 : p))
              }
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
