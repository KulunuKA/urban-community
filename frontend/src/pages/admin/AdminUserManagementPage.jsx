import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MapPin,
  Search,
  User,
  Mail,
  Phone,
} from "lucide-react";

function SectionPagination({ page, totalPages, total, limit, onPageChange }) {
  if (total === 0) return null;
  return (
    <nav
      className="mt-4 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-4 sm:flex-row"
      aria-label="Pagination"
    >
      <p className="text-sm text-slate-500">
        Page {page} of {totalPages} · {(page - 1) * limit + 1}–
        {Math.min(page * limit, total)} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange((p) => (p < totalPages ? p + 1 : p))}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

export default function AdminUserManagementPage() {
  const [activeTab, setActiveTab] = useState("civilians");

  const [civilians, setCivilians] = useState([]);
  const [civLoading, setCivLoading] = useState(true);
  const [civPage, setCivPage] = useState(1);
  const [civTotal, setCivTotal] = useState(0);
  const [civTotalPages, setCivTotalPages] = useState(1);
  const [civSearchInput, setCivSearchInput] = useState("");
  const [civDebouncedSearch, setCivDebouncedSearch] = useState("");

  const [orgs, setOrgs] = useState([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgPage, setOrgPage] = useState(1);
  const [orgTotal, setOrgTotal] = useState(0);
  const [orgTotalPages, setOrgTotalPages] = useState(1);
  const [orgSearchInput, setOrgSearchInput] = useState("");
  const [orgDebouncedSearch, setOrgDebouncedSearch] = useState("");

  const limit = 10;

  useEffect(() => {
    const t = setTimeout(() => setCivDebouncedSearch(civSearchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [civSearchInput]);

  useEffect(() => {
    const t = setTimeout(() => setOrgDebouncedSearch(orgSearchInput.trim()), 400);
    return () => clearTimeout(t);
  }, [orgSearchInput]);

  useEffect(() => {
    setCivPage(1);
  }, [civDebouncedSearch]);

  useEffect(() => {
    setOrgPage(1);
  }, [orgDebouncedSearch]);

  const loadCivilians = useCallback(async () => {
    setCivLoading(true);
    try {
      const res = await adminService.getCivilians({
        page: civPage,
        limit,
        search: civDebouncedSearch || undefined,
      });
      const body = res.data;
      const tp = Math.max(1, body.totalPages ?? 1);
      setCivTotal(body.total ?? 0);
      setCivTotalPages(tp);
      if (civPage > tp) {
        setCivilians([]);
        setCivPage(tp);
        return;
      }
      setCivilians(body.data || []);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Failed to load civilians",
      );
      setCivilians([]);
      setCivTotal(0);
      setCivTotalPages(1);
    } finally {
      setCivLoading(false);
    }
  }, [civPage, civDebouncedSearch]);

  const loadOrganizations = useCallback(async () => {
    setOrgLoading(true);
    try {
      const res = await adminService.getOrganizations({
        page: orgPage,
        limit,
        search: orgDebouncedSearch || undefined,
      });
      const body = res.data;
      const tp = Math.max(1, body.totalPages ?? 1);
      setOrgTotal(body.total ?? 0);
      setOrgTotalPages(tp);
      if (orgPage > tp) {
        setOrgs([]);
        setOrgPage(tp);
        return;
      }
      setOrgs(body.data || []);
    } catch (err) {
      console.error(err);
      message.error(
        err.response?.data?.message || "Failed to load organizations",
      );
      setOrgs([]);
      setOrgTotal(0);
      setOrgTotalPages(1);
    } finally {
      setOrgLoading(false);
    }
  }, [orgPage, orgDebouncedSearch]);

  useEffect(() => {
    if (activeTab !== "civilians") return;
    loadCivilians();
  }, [loadCivilians, activeTab]);

  useEffect(() => {
    if (activeTab !== "organizations") return;
    loadOrganizations();
  }, [loadOrganizations, activeTab]);

  const formatLocation = (loc) => {
    if (!loc || typeof loc !== "object") return "—";
    const parts = [loc.city, loc.district, loc.province].filter(Boolean);
    return parts.length ? parts.join(", ") : "—";
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-white">
          User Management
        </h1>
        <p className="mt-1 text-sm font-medium text-slate-500">
          Browse registered civilians and organizations
        </p>
      </header>

      <div
        className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1"
        role="tablist"
        aria-label="User type"
      >
        <button
          type="button"
          role="tab"
          id="tab-civilians"
          aria-selected={activeTab === "civilians"}
          aria-controls="panel-civilians"
          onClick={() => setActiveTab("civilians")}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition",
            activeTab === "civilians"
              ? "bg-indigo-500/20 text-indigo-200 shadow-inner shadow-indigo-500/10"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
          ].join(" ")}
        >
          <User className="h-4 w-4 shrink-0" aria-hidden />
          Civilians
          <span className="tabular-nums text-xs font-medium opacity-70">
            ({civTotal})
          </span>
        </button>
        <button
          type="button"
          role="tab"
          id="tab-organizations"
          aria-selected={activeTab === "organizations"}
          aria-controls="panel-organizations"
          onClick={() => setActiveTab("organizations")}
          className={[
            "flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold transition",
            activeTab === "organizations"
              ? "bg-violet-500/20 text-violet-200 shadow-inner shadow-violet-500/10"
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
          ].join(" ")}
        >
          <Building2 className="h-4 w-4 shrink-0" aria-hidden />
          Organizations
          <span className="tabular-nums text-xs font-medium opacity-70">
            ({orgTotal})
          </span>
        </button>
      </div>

      {/* Civilians panel */}
      {activeTab === "civilians" ? (
      <section
        id="panel-civilians"
        role="tabpanel"
        aria-labelledby="tab-civilians"
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300">
              <User className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Civilians</h2>
              <p className="text-xs text-slate-500">
                Citizen accounts ({civTotal} total)
              </p>
            </div>
          </div>
          <div className="relative min-w-[200px] flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search name, email, phone, location…"
              value={civSearchInput}
              onChange={(e) => setCivSearchInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none ring-indigo-500/40 transition focus:border-indigo-500/40 focus:ring-2"
              aria-label="Search civilians"
            />
          </div>
        </div>

        {civLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2
              className="h-8 w-8 animate-spin text-indigo-400"
              aria-hidden
            />
            <p className="mt-3 text-sm text-slate-500">Loading civilians…</p>
          </div>
        ) : civilians.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No civilians match your search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Location</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {civilians.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="py-3 pr-4 font-medium text-slate-100">
                      {row.name || "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Mail className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {row.email || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Phone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {row.phone || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-start gap-1.5 text-slate-400">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
                        {formatLocation(row.location)}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <SectionPagination
          page={civPage}
          totalPages={civTotalPages}
          total={civTotal}
          limit={limit}
          onPageChange={setCivPage}
        />
      </section>
      ) : (
      <section
        id="panel-organizations"
        role="tabpanel"
        aria-labelledby="tab-organizations"
        className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm"
      >
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-300">
              <Building2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                Organizations
              </h2>
              <p className="text-xs text-slate-500">
                Organization accounts ({orgTotal} total)
              </p>
            </div>
          </div>
          <div className="relative min-w-[200px] flex-1 sm:max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Search name, email, phone, address…"
              value={orgSearchInput}
              onChange={(e) => setOrgSearchInput(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 outline-none ring-violet-500/40 transition focus:border-violet-500/40 focus:ring-2"
              aria-label="Search organizations"
            />
          </div>
        </div>

        {orgLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2
              className="h-8 w-8 animate-spin text-violet-400"
              aria-hidden
            />
            <p className="mt-3 text-sm text-slate-500">
              Loading organizations…
            </p>
          </div>
        ) : orgs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No organizations match your search.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="pb-3 pr-4">Name</th>
                  <th className="pb-3 pr-4">Email</th>
                  <th className="pb-3 pr-4">Phone</th>
                  <th className="pb-3 pr-4">Address</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {orgs.map((row) => (
                  <tr
                    key={row._id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.03]"
                  >
                    <td className="max-w-[200px] py-3 pr-4 font-medium text-slate-100">
                      <div className="truncate" title={row.name}>
                        {row.name || "—"}
                      </div>
                      {row.description ? (
                        <div
                          className="mt-0.5 line-clamp-2 text-xs font-normal text-slate-500"
                          title={row.description}
                        >
                          {row.description}
                        </div>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Mail className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {row.email || "—"}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400">
                        <Phone className="h-3.5 w-3.5 shrink-0 opacity-60" />
                        {row.phone || "—"}
                      </span>
                    </td>
                    <td className="max-w-[220px] py-3 pr-4">
                      <span className="line-clamp-2 text-slate-400">
                        {row.address || "—"}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <SectionPagination
          page={orgPage}
          totalPages={orgTotalPages}
          total={orgTotal}
          limit={limit}
          onPageChange={setOrgPage}
        />
      </section>
      )}
    </div>
  );
}
