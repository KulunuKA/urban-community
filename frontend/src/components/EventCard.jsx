import React from "react";

const EditIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /></svg>
);
const UsersIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
);

export default function EventCard({
  event,
  onEdit,
  onDelete,
  membershipStatus,
  isRequesting = false,
  onSendRequest,
}) {
  const canManageEvent = typeof onEdit === "function" || typeof onDelete === "function";
  const canSendRequest = typeof onSendRequest === "function";
  const normalizedStatus = membershipStatus?.toLowerCase?.();
  const requestDisabled = isRequesting || normalizedStatus === "pending" || normalizedStatus === "accepted";

  const requestLabel = isRequesting
    ? "Sending..."
    : normalizedStatus === "accepted"
      ? "Joined"
      : normalizedStatus === "pending"
        ? "Request Pending"
        : "Send Request";

  const memberCount = event.memberCount ?? 0;

  return (
    <div className="relative rounded-2xl p-5 border border-slate-200 bg-white transition-all hover:border-emerald-500/40 overflow-hidden group">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-500 rounded-t-2xl" />

      <div className="mt-1 mb-4 flex justify-between items-start">
        <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 inline-block max-w-[70%] truncate">
          {event.organization}
        </span>

        {membershipStatus && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {membershipStatus}
          </span>
        )}

        {canManageEvent && (
          <div className="flex gap-2">
            {typeof onEdit === "function" && (
              <button
                onClick={() => onEdit(event)}
                className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                aria-label="Edit event"
              >
                <EditIcon />
              </button>
            )}
            {typeof onDelete === "function" && (
              <button
                onClick={() => onDelete(event._id)}
                className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete event"
              >
                <TrashIcon />
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold mb-2 text-slate-900 leading-snug">
        {event.title}
      </h3>

      <p className="text-sm mb-4 text-slate-600 line-clamp-3 leading-relaxed">
        {event.description}
      </p>

      <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
        <UsersIcon />
        <span>{memberCount} {memberCount === 1 ? "member" : "members"}</span>
      </div>

      <div className="pt-4 flex flex-col gap-2 border-t border-slate-100 text-slate-500 text-xs">
        <div className="flex items-center gap-2">
          <span>📍</span> {event.location}
        </div>
        <div className="flex items-center gap-2">
          <span>📅</span> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: "long" })}
        </div>
      </div>

      {canSendRequest && (
        <button
          type="button"
          onClick={() => onSendRequest(event._id)}
          disabled={requestDisabled}
          className="mt-4 w-full rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {requestLabel}
        </button>
      )}
    </div>
  );
}