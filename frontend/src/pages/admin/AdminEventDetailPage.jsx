import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { message } from "antd";
import { adminService } from "@/services/admin.service";
import { ROUTES } from "@/constants/routes";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

export default function AdminEventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await adminService.getEventByIdAdmin(eventId);
        if (!cancelled) {
          setEvent(res.data?.data || null);
        }
      } catch (err) {
        if (!cancelled) {
          setEvent(null);
          message.error(
            err.response?.data?.message || "Could not load this event.",
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
  }, [eventId]);

  const goBack = () => {
    navigate(ROUTES.ADMIN_EVENT_MANAGEMENT);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2
          className="h-9 w-9 animate-spin text-violet-400"
          aria-hidden
        />
        <p className="mt-4 text-sm text-slate-500">Loading event…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-2xl">
        <button
          type="button"
          onClick={goBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-200"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to events
        </button>
        <p className="text-slate-500">
          Event not found or you do not have access.
        </p>
      </div>
    );
  }

  const org = event.orgId && typeof event.orgId === "object" ? event.orgId : null;

  return (
    <div className="mx-auto max-w-3xl">
      <button
        type="button"
        onClick={goBack}
        className="mb-8 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-200"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to events
      </button>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-600 shadow-lg shadow-violet-500/20">
            <CalendarDays className="h-6 w-6 text-white" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="font-serif text-2xl font-bold leading-tight text-white sm:text-3xl">
              {event.title}
            </h1>
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-xs font-semibold text-violet-300">
                <Building2 className="h-3.5 w-3.5" aria-hidden />
                {event.organization || "—"}
              </span>
              {event.createdAt && (
                <span>
                  Listed{" "}
                  {new Date(event.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            When &amp; where
          </h2>
          <div className="space-y-3 text-sm text-slate-300">
            <p className="inline-flex items-start gap-2">
              <CalendarDays
                className="mt-0.5 h-4 w-4 shrink-0 text-violet-400"
                aria-hidden
              />
              <span>
                {event.date
                  ? new Date(event.date).toLocaleString(undefined, {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "—"}
              </span>
            </p>
            <p className="inline-flex items-start gap-2">
              <MapPin
                className="mt-0.5 h-4 w-4 shrink-0 text-slate-500"
                aria-hidden
              />
              {event.location}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Description
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
            {event.description}
          </p>
        </section>

        {org && (
          <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hosting organization
            </h2>
            <div className="space-y-3 text-sm text-slate-300">
              <p className="font-semibold text-slate-100">{org.name}</p>
              {org.email && (
                <p className="inline-flex items-center gap-2 text-slate-400">
                  <Mail className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  {org.email}
                </p>
              )}
              {org.phone && (
                <p className="inline-flex items-center gap-2 text-slate-400">
                  <Phone className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  {org.phone}
                </p>
              )}
              {org.address && (
                <p className="inline-flex items-start gap-2 text-slate-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                  {org.address}
                </p>
              )}
              {org.description && (
                <p className="mt-2 border-t border-white/5 pt-3 text-sm leading-relaxed text-slate-400">
                  {org.description}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
