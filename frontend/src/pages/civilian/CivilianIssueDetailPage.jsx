import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { message, Modal } from "antd";
import { issueService } from "@/services/issue.service";
import { ROUTES } from "@/constants/routes";
import {
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Trash2,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  Loader,
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
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.25)",
    label: "Pending",
  },
  InProgress: {
    icon: Loader,
    color: "#3b82f6",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.25)",
    label: "In progress",
  },
  Resolved: {
    icon: CheckCircle2,
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.25)",
    label: "Resolved",
  },
  Rejected: {
    icon: XCircle,
    color: "#ef4444",
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.25)",
    label: "Rejected",
  },
};

const accent = "#f97316";
const accentDark = "#ea580c";

export default function CivilianIssueDetailPage() {
  const { issueId } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!issueId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await issueService.getIssueById(issueId);
        if (!cancelled) {
          setIssue(res.data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setIssue(null);
          const msg =
            err.response?.data?.message || "Could not load this issue.";
          message.error(msg);
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

  const confirmDelete = () => {
    if (issue?.status !== "Pending") return;
    Modal.confirm({
      title: "Delete this report?",
      content:
        "This removes your report from the system. This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        setDeleting(true);
        try {
          await issueService.deleteIssue(issueId);
          message.success("Issue deleted.");
          navigate(ROUTES.DASHBOARD_ISSUE_REPORTING, {
            replace: true,
            state: { issueTab: "my-reports" },
          });
        } catch (err) {
          const msg =
            err.response?.data?.message || "Could not delete this issue.";
          message.error(msg);
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  if (loading) {
    return (
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto",
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <Loader2
          size={36}
          color={accent}
          style={{ animation: "spin 1s linear infinite" }}
        />
        <p style={{ marginTop: 16, color: "#64748b", fontSize: 14 }}>
          Loading issue…
        </p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!issue) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD_ISSUE_REPORTING)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 20,
            padding: "8px 14px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fff",
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          Back to issue reporting
        </button>
        <p style={{ color: "#64748b", fontSize: 15 }}>
          Issue not found or you do not have access.
        </p>
      </div>
    );
  }

  const catLabel =
    ISSUE_CATEGORIES.find((c) => c.value === issue.category)?.label ||
    issue.category;
  const statusInfo = STATUS_CONFIG[issue.status] || STATUS_CONFIG.Pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <button
          type="button"
          onClick={() => navigate(ROUTES.DASHBOARD_ISSUE_REPORTING)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 14px",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            background: "#fff",
            fontSize: 14,
            fontWeight: 600,
            color: "#475569",
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {issue.status === "Pending" && (
          <button
            type="button"
            disabled={deleting}
            onClick={confirmDelete}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 18px",
              borderRadius: 12,
              border: "1px solid rgba(239, 68, 68, 0.35)",
              background: "rgba(254, 242, 242, 0.95)",
              fontSize: 14,
              fontWeight: 600,
              color: "#b91c1c",
              cursor: deleting ? "not-allowed" : "pointer",
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? (
              <Loader2
                size={18}
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <Trash2 size={18} />
            )}
            Delete issue
          </button>
        )}
      </div>

      <header style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: `linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={24} color="#fff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "'Lora', Georgia, serif",
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {issue.title}
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 13,
                color: "#64748b",
              }}
            >
              {catLabel}
              {issue.createdAt
                ? ` · Reported ${new Date(issue.createdAt).toLocaleString()}`
                : ""}
            </p>
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              background: statusInfo.bg,
              border: `1px solid ${statusInfo.border}`,
              flexShrink: 0,
            }}
          >
            <StatusIcon size={14} color={statusInfo.color} />
            <span
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: statusInfo.color,
              }}
            >
              {statusInfo.label}
            </span>
          </div>
        </div>
      </header>

      <div
        style={{
          borderRadius: 20,
          border: "1px solid rgba(226, 232, 240, 0.9)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 8px 32px rgba(148, 163, 184, 0.12)",
          padding: "24px 28px",
        }}
      >
        <h2
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#64748b",
            margin: "0 0 10px",
          }}
        >
          Description
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            color: "#334155",
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
          }}
        >
          {issue.description}
        </p>

        <div
          style={{
            marginTop: 22,
            paddingTop: 22,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <h2
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#64748b",
              margin: "0 0 8px",
            }}
          >
            Location
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 14,
              color: "#475569",
            }}
          >
            <MapPin size={18} color={accent} style={{ flexShrink: 0 }} />
            <span>{issue.location}</span>
          </div>
        </div>

        {issue.image && (
          <div
            style={{
              marginTop: 22,
              paddingTop: 22,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <h2
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#64748b",
                margin: "0 0 12px",
              }}
            >
              Photo
            </h2>
            <img
              src={issue.image}
              alt=""
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "cover",
                borderRadius: 14,
                border: "1px solid #f1f5f9",
              }}
            />
          </div>
        )}

        {issue.adminResponse && (
          <div
            style={{
              marginTop: 22,
              paddingTop: 22,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <h2
              style={{
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#64748b",
                margin: "0 0 10px",
              }}
            >
              Admin response
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: "#334155",
                lineHeight: 1.6,
                whiteSpace: "pre-wrap",
              }}
            >
              {issue.adminResponse}
            </p>
          </div>
        )}

        {issue.resolvedAt && (
          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: "#94a3b8",
            }}
          >
            Resolved: {new Date(issue.resolvedAt).toLocaleString()}
          </p>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: "#94a3b8" }}>
        Need to see all reports?{" "}
        <Link
          to={ROUTES.DASHBOARD_ISSUE_REPORTING}
          style={{ color: accent, fontWeight: 600 }}
        >
          Go to issue reporting
        </Link>
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
