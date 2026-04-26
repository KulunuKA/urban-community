import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import {
  Loader2,
  PieChart as PieChartIcon,
  BarChart3,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ChartCard,
  SimpleDonutChart,
  HorizontalBarChart,
} from "@/components/charts";

const ISSUE_CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "waste", label: "Waste" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "environment", label: "Environment" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

const CATEGORY_FILL = {
  infrastructure: "#8b5cf6",
  waste: "#22c55e",
  water: "#3b82f6",
  electricity: "#eab308",
  environment: "#14b8a6",
  safety: "#f97316",
  other: "#64748b",
};

const STATUS_ORDER = ["Pending", "InProgress", "Resolved", "Rejected"];

const STATUS_META = {
  Pending: { label: "Pending", fill: "#f59e0b" },
  InProgress: { label: "In progress", fill: "#3b82f6" },
  Resolved: { label: "Resolved", fill: "#10b981" },
  Rejected: { label: "Rejected", fill: "#ef4444" },
};

function categoryLabel(key) {
  if (!key || key === "unknown") return "Unknown";
  return (
    ISSUE_CATEGORIES.find((c) => c.value === key)?.label || String(key)
  );
}

function buildStatusChartData(byStatus) {
  if (!byStatus || typeof byStatus !== "object") return [];
  return STATUS_ORDER.map((key) => ({
    name: STATUS_META[key].label,
    value: Number(byStatus[key]) || 0,
    fill: STATUS_META[key].fill,
  })).filter((d) => d.value > 0);
}

function buildCategoryChartData(byCategory) {
  if (!byCategory || typeof byCategory !== "object") return [];
  return Object.entries(byCategory)
    .map(([key, value]) => ({
      name: categoryLabel(key === "unknown" || key == null ? "unknown" : key),
      value: Number(value) || 0,
      fill: CATEGORY_FILL[key] || "#6366f1",
    }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);
}

/**
 * Issue analytics overview for admin Issue Management (GET /api/issues/analytics/summary).
 */
export function IssueReportingOverview() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await adminService.getIssueAnalytics();
        if (!cancelled) setData(res.data?.data ?? null);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          message.error(
            err.response?.data?.message || "Could not load issue analytics.",
          );
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const statusChartData = useMemo(
    () => buildStatusChartData(data?.byStatus),
    [data?.byStatus],
  );

  const categoryChartData = useMemo(
    () => buildCategoryChartData(data?.byCategory),
    [data?.byCategory],
  );

  const total = data?.totalIssues ?? 0;
  const resolvedPct = data?.resolvedPercentage ?? "0%";

  return (
    <section className="mb-10" aria-labelledby="issue-overview-heading">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="min-w-0">
          <h2
            id="issue-overview-heading"
            className="font-serif text-xl font-bold text-white"
          >
            Issue reporting overview
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            Aggregated from all civic issue reports in the system.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="issue-overview-panel"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-indigo-500/35 bg-indigo-500/15 px-4 py-2.5 text-sm font-semibold text-indigo-200 transition hover:border-indigo-400/50 hover:bg-indigo-500/25"
        >
          {expanded ? (
            <>
              Hide overview
              <ChevronUp className="h-4 w-4" aria-hidden />
            </>
          ) : (
            <>
              Show overview
              <ChevronDown className="h-4 w-4" aria-hidden />
            </>
          )}
        </button>
      </div>

      {expanded && (
        <div id="issue-overview-panel">
          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02] py-16">
              <Loader2
                className="h-9 w-9 animate-spin text-indigo-400"
                aria-hidden
              />
              <span className="sr-only">Loading analytics</span>
            </div>
          ) : !data ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-8 text-center text-sm text-slate-500">
              Analytics could not be loaded.
            </p>
          ) : (
            <>
              <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-300/90">
                    <Hash className="h-4 w-4" aria-hidden />
                    Total issues
                  </div>
                  <p className="mt-2 font-serif text-3xl font-bold tabular-nums text-white">
                    {total}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-300/90">
                    <PieChartIcon className="h-4 w-4" aria-hidden />
                    Resolved rate
                  </div>
                  <p className="mt-2 font-serif text-3xl font-bold tabular-nums text-emerald-200">
                    {resolvedPct}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-500/20 bg-slate-500/10 px-5 py-4 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <BarChart3 className="h-4 w-4" aria-hidden />
                    Open pipeline
                  </div>
                  <p className="mt-2 text-sm text-slate-300">
                    <span className="font-semibold text-amber-200">
                      {(data.byStatus?.Pending ?? 0) +
                        (data.byStatus?.InProgress ?? 0)}
                    </span>{" "}
                    pending or in progress
                  </p>
                </div>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <ChartCard
                  title="Issues by status"
                  description="Share of reports in each workflow state"
                >
                  {statusChartData.length > 0 ? (
                    <SimpleDonutChart data={statusChartData} height={280} />
                  ) : (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No status data yet
                    </p>
                  )}
                </ChartCard>

                <ChartCard
                  title="Issues by category"
                  description="Volume by report category"
                >
                  {categoryChartData.length > 0 ? (
                    <HorizontalBarChart data={categoryChartData} height={320} />
                  ) : (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No category data yet
                    </p>
                  )}
                </ChartCard>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
