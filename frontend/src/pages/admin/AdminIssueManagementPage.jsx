import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import { ROUTES } from "@/constants/routes";
import { IssueReportingOverview } from "@/components/issues/IssueReportingOverview";
import {
  AlertTriangle,
  Loader2,
  MapPin,
  Search,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  CircleDot,
} from "lucide-react";

/** Must match server issue model / IssueReportingPage */
const ISSUE_CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "waste", label: "Waste" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "environment", label: "Environment" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = ["Pending", "InProgress", "Resolved", "Rejected"];

const STATUS_CONFIG = {
  Pending: {
    icon: Clock,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.25)",
    label: "Pending",
  },
  InProgress: {
    icon: CircleDot,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.12)",
    border: "rgba(59,130,246,0.25)",
    label: "In progress",
  },
  Resolved: {
    icon: CheckCircle2,
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
    border: "rgba(16,185,129,0.25)",
    label: "Resolved",
  },
  Rejected: {
    icon: XCircle,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.25)",
    label: "Rejected",
  },
};

function categoryLabel(value) {
  return (
    ISSUE_CATEGORIES.find((c) => c.value === value)?.label || value || "—"
  );
}

export default function AdminIssueManagementPage() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const loadIssues = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.getIssues({
        page,
        limit,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        search: debouncedSearch || undefined,
      });
      const body = res.data;
      const tp = Math.max(1, body.totalPages ?? 1);
      setTotal(body.total ?? 0);
      setTotalPages(tp);
      if (page > tp) {
        setIssues([]);
        setPage(tp);
        return;
      }
      setIssues(body.data || []);
    } catch (err) {
      console.error("Failed to load issues:", err);
      message.error(
        err.response?.data?.message || "Failed to load issues",
      );
      setIssues([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          Issue Management
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Review civic issues reported by citizens
        </p>
      </header>

      <IssueReportingOverview />

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center lg:justify-between">
        <div className="relative min-w-[200px] flex-1 lg:max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Search title, description, or location…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none ring-indigo-500/40 transition focus:border-indigo-500/40 focus:ring-2"
            aria-label="Search issues"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-300 outline-none transition hover:border-white/15"
              aria-label="Filter by status"
            >
              <option value="">All statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_CONFIG[s]?.label || s}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="cursor-pointer appearance-none rounded-xl border border-white/10 bg-white/5 py-2.5 pl-3 pr-10 text-sm font-semibold text-slate-300 outline-none transition hover:border-white/15"
              aria-label="Filter by category"
            >
              <option value="">All categories</option>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
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
      </div>

      {!loading && (
        <p className="mb-4 text-sm font-medium text-slate-500">
          {total === 0
            ? "No issues match your filters"
            : `Showing ${from}–${to} of ${total}`}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] py-16">
          <Loader2
            className="h-8 w-8 animate-spin text-indigo-400"
            aria-hidden
          />
          <p className="mt-3 text-sm text-slate-500">Loading issues…</p>
        </div>
      ) : issues.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] py-16">
          <AlertTriangle className="h-10 w-10 text-slate-600" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-slate-500">
            No issues found
          </p>
          <p className="mt-1 max-w-sm text-center text-xs text-slate-600">
            Try adjusting search or filters, or check back when new reports are
            submitted.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {issues.map((issue) => {
            const st = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Pending;
            const StatusIcon = st.icon;
            const citizen = issue.citizen;

            return (
              <li key={issue._id} className="list-none">
                <Link
                  to={ROUTES.adminIssueDetail(issue._id)}
                  className="block rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 text-left no-underline backdrop-blur-sm transition hover:border-indigo-500/30 hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-start gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-300">
                        <FileText className="h-3.5 w-3.5" aria-hidden />
                        {categoryLabel(issue.category)}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold"
                        style={{
                          borderColor: st.border,
                          background: st.bg,
                          color: st.color,
                        }}
                      >
                        <StatusIcon className="h-3.5 w-3.5" aria-hidden />
                        {st.label}
                      </span>
                    </div>

                    <h2 className="text-base font-bold leading-snug text-slate-100">
                      {issue.title}
                    </h2>

                    <p className="line-clamp-3 text-sm leading-relaxed text-slate-400">
                      {issue.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {issue.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {issue.createdAt
                          ? new Date(issue.createdAt).toLocaleString(undefined, {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
                          : "—"}
                      </span>
                    </div>

                    {citizen && (
                      <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                        <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        <span>
                          {citizen.name || "Citizen"}{" "}
                          {citizen.email ? (
                            <span className="text-slate-600">
                              ({citizen.email})
                            </span>
                          ) : null}
                        </span>
                      </div>
                    )}

                    {issue.adminResponse && (
                      <div className="rounded-xl border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-200/90">
                        <span className="font-semibold text-emerald-400/90">
                          Admin response:{" "}
                        </span>
                        {issue.adminResponse}
                      </div>
                    )}

                    {issue.image && (
                      <div className="pt-1">
                        <img
                          src={issue.image}
                          alt=""
                          className="max-h-48 w-full max-w-md rounded-xl border border-white/10 object-cover"
                        />
                      </div>
                    )}
                </div>
                </Link>
              </li>
            );
          })}
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
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
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
              className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
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
