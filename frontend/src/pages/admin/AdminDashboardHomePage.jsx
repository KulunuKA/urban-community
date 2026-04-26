import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { adminService } from "@/services/admin.service";
import { ROUTES } from "@/constants/routes";
import {
  Building2,
  Truck,
  Users,
  Building,
  CalendarDays,
  ClipboardList,
  Loader2,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ISSUE_CATEGORY_LABELS = {
  infrastructure: "Infrastructure",
  waste: "Waste",
  water: "Water",
  electricity: "Electricity",
  environment: "Environment",
  safety: "Safety",
  other: "Other",
};

const ISSUE_STATUS_LABELS = {
  Pending: "Pending",
  InProgress: "In progress",
  Resolved: "Resolved",
  Rejected: "Rejected",
};

const PICKUP_COLORS = {
  Pending: "#f59e0b",
  Accepted: "#3b82f6",
  Collected: "#10b981",
  Rejected: "#ef4444",
};

const ISSUE_STATUS_COLORS = {
  Pending: "#f59e0b",
  InProgress: "#3b82f6",
  Resolved: "#10b981",
  Rejected: "#ef4444",
};

const CATEGORY_CHART_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
  "#94a3b8",
];

const tooltipStyles = {
  contentStyle: {
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 12,
    fontSize: 12,
  },
  labelStyle: { color: "#e2e8f0" },
  itemStyle: { color: "#e2e8f0" },
};

function ChartCard({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm ${className}`}
    >
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-100">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to, accent }) {
  const inner = (
    <div
      className={[
        "group relative overflow-hidden rounded-2xl border p-5 transition",
        "border-white/[0.08] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-xl border"
          style={{
            borderColor: `${accent}40`,
            background: `${accent}18`,
            color: accent,
          }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        {to ? (
          <ArrowUpRight
            className="h-4 w-4 shrink-0 text-slate-600 opacity-0 transition group-hover:opacity-100"
            aria-hidden
          />
        ) : null}
      </div>
      <p className="mt-4 font-serif text-3xl font-bold tabular-nums text-white">
        {value}
      </p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block no-underline">
        {inner}
      </Link>
    );
  }
  return inner;
}

export default function AdminDashboardHomePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    centers: 0,
    pickups: [],
    civiliansTotal: 0,
    orgsTotal: 0,
    eventsTotal: 0,
    issueAnalytics: null,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const settled = await Promise.allSettled([
        adminService.getAllCenters(),
        adminService.getAllPickupRequests(),
        adminService.getIssueAnalytics(),
        adminService.getCivilians({ page: 1, limit: 1 }),
        adminService.getOrganizations({ page: 1, limit: 1 }),
        adminService.getEvents({ page: 1, limit: 1 }),
      ]);

      if (cancelled) return;

      const [centersR, pickupsR, analyticsR, civR, orgR, eventsR] = settled;

      const centers =
        centersR.status === "fulfilled" ? centersR.value.data || [] : [];
      const pickups =
        pickupsR.status === "fulfilled" ? pickupsR.value.data || [] : [];
      const issueData =
        analyticsR.status === "fulfilled"
          ? analyticsR.value.data?.data ?? null
          : null;
      const civiliansTotal =
        civR.status === "fulfilled" ? civR.value.data?.total ?? 0 : 0;
      const orgsTotal =
        orgR.status === "fulfilled" ? orgR.value.data?.total ?? 0 : 0;
      const eventsTotal =
        eventsR.status === "fulfilled" ? eventsR.value.data?.total ?? 0 : 0;

      setStats({
        centers: Array.isArray(centers) ? centers.length : 0,
        pickups: Array.isArray(pickups) ? pickups : [],
        civiliansTotal,
        orgsTotal,
        eventsTotal,
        issueAnalytics: issueData,
      });
      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const pickupChartData = useMemo(() => {
    const counts = { Pending: 0, Accepted: 0, Collected: 0, Rejected: 0 };
    for (const p of stats.pickups) {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: PICKUP_COLORS[name] || "#64748b",
    }));
  }, [stats.pickups]);

  const issueStatusChartData = useMemo(() => {
    const by = stats.issueAnalytics?.byStatus || {};
    return ["Pending", "InProgress", "Resolved", "Rejected"].map((key) => ({
      name: ISSUE_STATUS_LABELS[key] || key,
      key,
      count: by[key] ?? 0,
      fill: ISSUE_STATUS_COLORS[key] || "#64748b",
    }));
  }, [stats.issueAnalytics]);

  const issueCategoryChartData = useMemo(() => {
    const by = stats.issueAnalytics?.byCategory || {};
    const entries = Object.entries(by).filter(([, v]) => v > 0);
    return entries.map(([key, count], i) => ({
      name: ISSUE_CATEGORY_LABELS[key] || key || "Unknown",
      count,
      fill: CATEGORY_CHART_COLORS[i % CATEGORY_CHART_COLORS.length],
    }));
  }, [stats.issueAnalytics]);

  const userSplitData = useMemo(
    () => [
      {
        name: "Civilians",
        value: stats.civiliansTotal,
        fill: "#6366f1",
      },
      {
        name: "Organizations",
        value: stats.orgsTotal,
        fill: "#a855f7",
      },
    ],
    [stats.civiliansTotal, stats.orgsTotal],
  );

  const totalIssues = stats.issueAnalytics?.totalIssues ?? 0;
  const resolvedPct = stats.issueAnalytics?.resolvedPercentage ?? "0%";

  const hasPickupsChart = pickupChartData.some((d) => d.value > 0);
  const hasIssueStatus = issueStatusChartData.some((d) => d.count > 0);
  const hasIssueCategory = issueCategoryChartData.length > 0;
  const hasUsers = stats.civiliansTotal + stats.orgsTotal > 0;

  return (
    <div>
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300">
            <LayoutDashboard className="h-3.5 w-3.5" aria-hidden />
            Overview
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Platform health, recycling operations, civic issues, and community
            activity at a glance
          </p>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
            Syncing data…
          </div>
        ) : null}
      </header>

      {/* KPI grid */}
      <section className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Key metrics
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            icon={Users}
            label="Civilians"
            value={loading ? "—" : stats.civiliansTotal}
            to={ROUTES.ADMIN_USER_MANAGEMENT}
            accent="#6366f1"
          />
          <StatCard
            icon={Building}
            label="Organizations"
            value={loading ? "—" : stats.orgsTotal}
            to={ROUTES.ADMIN_USER_MANAGEMENT}
            accent="#a855f7"
          />
          <StatCard
            icon={CalendarDays}
            label="Events"
            value={loading ? "—" : stats.eventsTotal}
            to={ROUTES.ADMIN_EVENT_MANAGEMENT}
            accent="#ec4899"
          />
          <StatCard
            icon={ClipboardList}
            label="Civic issues"
            value={loading ? "—" : totalIssues}
            to={ROUTES.ADMIN_ISSUE_MANAGEMENT}
            accent="#f59e0b"
          />
          <StatCard
            icon={Building2}
            label="Recycling centers"
            value={loading ? "—" : stats.centers}
            to={ROUTES.ADMIN_RECYCLING_CENTERS}
            accent="#8b5cf6"
          />
          <StatCard
            icon={Truck}
            label="Pickup requests"
            value={loading ? "—" : stats.pickups.length}
            to={ROUTES.ADMIN_PICKUP_REQUESTS}
            accent="#3b82f6"
          />
        </div>
      </section>

      {!loading && totalIssues > 0 && (
        <div className="mb-8 rounded-2xl border border-emerald-500/15 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200/90">
          <span className="font-semibold text-emerald-400">Resolution rate: </span>
          {resolvedPct} of issues are marked resolved.
        </div>
      )}

      {/* Charts row 1 */}
      <section className="mb-6 grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Pickup requests by status"
          subtitle="Distribution across all garbage pickup requests"
        >
          <div className="h-[280px] w-full min-h-[240px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : !hasPickupsChart ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No pickup data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pickupChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={88}
                    paddingAngle={2}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pickupChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="rgba(15,23,42,0.8)" />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Civic issues by status"
          subtitle="Workflow breakdown for reported issues"
        >
          <div className="h-[280px] w-full min-h-[240px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : !hasIssueStatus ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No issue data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={issueStatusChartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                  />
                  <YAxis
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip {...tooltipStyles} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Issues">
                    {issueStatusChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </section>

      {/* Charts row 2 */}
      <section className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="Issues by category"
          subtitle="Volume per issue type"
        >
          <div className="h-[280px] w-full min-h-[240px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : !hasIssueCategory ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No categorized issues yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={issueCategoryChartData}
                  margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                  />
                  <Tooltip {...tooltipStyles} />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Count">
                    {issueCategoryChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Registered accounts"
          subtitle="Civilians vs organizations"
        >
          <div className="h-[280px] w-full min-h-[240px]">
            {loading ? (
              <div className="flex h-full items-center justify-center text-slate-500">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : !hasUsers ? (
              <p className="flex h-full items-center justify-center text-sm text-slate-500">
                No user registrations yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userSplitData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={90}
                    paddingAngle={2}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {userSplitData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} stroke="rgba(15,23,42,0.8)" />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyles} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>
      </section>
    </div>
  );
}
