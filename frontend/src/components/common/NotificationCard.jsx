import { Bell, CheckCircle2, Clock3 } from "lucide-react";

const formatDateTime = (value) => {
  if (!value) return "Unknown time";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Unknown time";

  return parsed.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export function NotificationCard({ notification, onMarkAsRead, isMarking }) {
  const isRead = Boolean(notification?.isRead);

  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm transition ${
        isRead
          ? "border-slate-200 bg-white"
          : "border-emerald-200 bg-emerald-50/40"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 rounded-full p-2 ${
              isRead
                ? "bg-slate-100 text-slate-500"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            <Bell size={16} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {notification?.title || "Notification"}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              {notification?.body || "No message"}
            </p>
          </div>
        </div>

        {!isRead ? (
          <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-white">
            New
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock3 size={14} />
          {formatDateTime(notification?.createdAt)}
        </p>

        <button
          type="button"
          disabled={isRead || isMarking}
          onClick={() => onMarkAsRead(notification?._id)}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <CheckCircle2 size={14} />
          {isMarking ? "Updating..." : isRead ? "Read" : "Mark as read"}
        </button>
      </div>
    </article>
  );
}
