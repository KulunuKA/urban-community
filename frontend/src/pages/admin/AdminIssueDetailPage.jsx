import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import { ROUTES } from "@/constants/routes";
import {
  AlertTriangle,
  ArrowLeft,
  Loader2,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  CircleDot,
  MessageSquare,
  Send,
} from "lucide-react";

const ISSUE_CATEGORIES = [
  { value: "infrastructure", label: "Infrastructure" },
  { value: "waste", label: "Waste" },
  { value: "water", label: "Water" },
  { value: "electricity", label: "Electricity" },
  { value: "environment", label: "Environment" },
  { value: "safety", label: "Safety" },
  { value: "other", label: "Other" },
];

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

export default function AdminIssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [responseDraft, setResponseDraft] = useState("");
  const [savingResponse, setSavingResponse] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!issueId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await adminService.getIssueByIdAdmin(issueId);
        if (!cancelled) {
          setIssue(res.data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setIssue(null);
          message.error(
            err.response?.data?.message || "Could not load this issue.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [issueId]);

  useEffect(() => {
    setResponseDraft(issue?.adminResponse ?? "");
  }, [issueId, issue?._id]);

  const goBack = () => {
    navigate(ROUTES.ADMIN_ISSUE_MANAGEMENT);
  };

  const applyStatusUpdate = async (nextStatus) => {
    if (!issue?._id || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await adminService.updateIssueStatus(issue._id, nextStatus);
      const updated = res.data?.data;
      if (updated) {
        setIssue(updated);
        message.success(
          res.data?.message ||
            `Status updated to ${STATUS_CONFIG[nextStatus]?.label || nextStatus}`,
        );
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Could not update issue status.",
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitAdminResponse = async () => {
    if (issue?.status !== "InProgress") {
      message.warning(
        "Admin responses can only be added while the issue is in progress.",
      );
      return;
    }
    const text = responseDraft.trim();
    if (!text) {
      message.warning("Please enter an admin response.");
      return;
    }
    if (!issue?._id || savingResponse) return;
    setSavingResponse(true);
    try {
      const res = await adminService.addAdminResponse(issue._id, text);
      const updated = res.data?.data;
      if (updated) {
        setIssue(updated);
        setResponseDraft(updated.adminResponse ?? text);
        message.success(
          res.data?.message || "Admin response saved.",
        );
      }
    } catch (err) {
      message.error(
        err.response?.data?.message || "Could not save admin response.",
      );
    } finally {
      setSavingResponse(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2
          className="h-9 w-9 animate-spin text-indigo-400"
          aria-hidden
        />
        <p className="mt-4 text-sm text-slate-500">Loading issue…</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-2xl">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to issues
        </button>
        <p className="text-slate-500">
          Issue not found or you do not have access.
        </p>
      </div>
    );
  }

  const st = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Pending;
  const StatusIcon = st.icon;
  const citizen = issue.citizen;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={goBack}
        className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to issues
      </button>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <AlertTriangle className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
              {issue.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-300">
                <FileText className="h-3.5 w-3.5" aria-hidden />
                {categoryLabel(issue.category)}
              </span>
              {issue.createdAt && (
                <span>
                  Reported{" "}
                  {new Date(issue.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}
              {issue.updatedAt &&
                issue.createdAt &&
                new Date(issue.updatedAt).getTime() !==
                  new Date(issue.createdAt).getTime() && (
                  <span>
                    · Updated{" "}
                    {new Date(issue.updatedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                )}
            </p>
          </div>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border px-3 py-1.5 text-xs font-semibold"
          style={{
            borderColor: st.border,
            background: st.bg,
            color: st.color,
          }}
        >
          <StatusIcon className="h-4 w-4" aria-hidden />
          {st.label}
        </span>
      </header>

      {(issue.status === "Pending" || issue.status === "InProgress") && (
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {issue.status === "Pending" && (
            <>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => applyStatusUpdate("InProgress")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : null}
                Start resolving this issue
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => applyStatusUpdate("Rejected")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rejected
              </button>
            </>
          )}
          {issue.status === "InProgress" && (
            <>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => applyStatusUpdate("Resolved")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-600/90 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                )}
                Resolved
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => applyStatusUpdate("Rejected")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:border-red-400/50 hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Rejected
              </button>
            </>
          )}
        </div>
      )}

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {issue.description}
          </p>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Location
          </h2>
          <p className="inline-flex items-start gap-2 text-sm text-slate-300">
            <MapPin
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
              aria-hidden
            />
            {issue.location}
          </p>
        </section>

        {citizen && (
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reporter
            </h2>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <User className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span>
                {citizen.name || "Citizen"}
                {citizen.email ? (
                  <span className="text-slate-500"> · {citizen.email}</span>
                ) : null}
              </span>
            </div>
          </section>
        )}

        {issue.status === "InProgress" ? (
          <section
            className={[
              "rounded-2xl border p-6",
              issue.adminResponse
                ? "border-emerald-500/25 bg-emerald-950/20"
                : "border-white/[0.06] bg-white/[0.03]",
            ].join(" ")}
          >
            <h2 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MessageSquare
                className="h-4 w-4 text-indigo-400/80"
                aria-hidden
              />
              Admin response
            </h2>
            <p className="mb-4 text-xs text-slate-600">
              Shown to the citizen on their issue. Submit to save; you can edit
              and submit again anytime.
            </p>

            {issue.adminResponse ? (
              <div className="mb-6 rounded-xl border border-emerald-500/35 bg-gradient-to-b from-emerald-950/50 to-emerald-950/20 p-5">
                <h3 className="text-sm font-semibold tracking-tight text-emerald-300">
                  Admin&apos;s response
                </h3>
                <p className="mt-1 text-xs text-emerald-500/80">
                  This is what the reporter sees for this issue.
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-emerald-50/95">
                  {issue.adminResponse}
                </p>
              </div>
            ) : null}

            <label
              htmlFor="admin-issue-response"
              className="mb-2 block text-xs font-medium text-slate-400"
            >
              {issue.adminResponse ? "Update response" : "Write response"}
            </label>
            <textarea
              id="admin-issue-response"
              value={responseDraft}
              onChange={(e) => setResponseDraft(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Write your official response to this issue…"
              disabled={savingResponse}
              className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-600 outline-none ring-indigo-500/30 transition focus:border-indigo-500/40 focus:ring-2 disabled:opacity-60"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                {responseDraft.length} / 2000
              </span>
              <button
                type="button"
                disabled={savingResponse || !responseDraft.trim()}
                onClick={submitAdminResponse}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-600/90 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/15 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingResponse ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="h-4 w-4" aria-hidden />
                )}
                Submit response
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <MessageSquare
                className="h-4 w-4 text-indigo-400/80"
                aria-hidden
              />
              Admin response
            </h2>
            {issue.adminResponse ? (
              <div className="rounded-xl border border-emerald-500/35 bg-gradient-to-b from-emerald-950/50 to-emerald-950/20 p-5">
                <h3 className="text-sm font-semibold tracking-tight text-emerald-300">
                  Admin&apos;s response
                </h3>
                <p className="mt-1 text-xs text-emerald-500/80">
                  Saved while this issue was in progress (read-only).
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-emerald-50/95">
                  {issue.adminResponse}
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-slate-500">
                {issue.status === "Pending"
                  ? "Admin responses can only be added while an issue is in progress. Use “Start resolving this issue” to move it to In progress first."
                  : "Admin responses can only be added while an issue is in progress. No response was saved for this issue before it was closed."}
              </p>
            )}
          </section>
        )}

        {issue.resolvedAt && (
          <p className="text-xs text-slate-500">
            Marked resolved{" "}
            {new Date(issue.resolvedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}

        {issue.image && (
          <section>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Attachment
            </h2>
            <img
              src={issue.image}
              alt=""
              className="max-h-[480px] w-full rounded-2xl border border-white/10 object-contain"
            />
          </section>
        )}
      </div>
    </div>
  );
}
