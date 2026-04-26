import { Spinner } from "@/components/common/Spinner";
import { useCivilian } from "@/contexts/CivilianProvider";
import { message } from "antd";
import {
  CalendarCheck2,
  LayoutDashboard,
  MapPin,
  Send,
  Tags,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const formatDate = (dateValue) => {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "Date not available";

  return parsed.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const getScheduleTag = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return {
      label: "Schedule TBA",
      className: "border-slate-200 bg-slate-50 text-slate-600",
    };
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfEventDay = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  const diffDays = Math.floor(
    (startOfEventDay.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 0) {
    return {
      label: "Past Event",
      className: "border-slate-200 bg-slate-100 text-slate-600",
    };
  }

  if (diffDays === 0) {
    return {
      label: "Today",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };
  }

  if (diffDays <= 7) {
    return {
      label: "This Week",
      className: "border-sky-200 bg-sky-50 text-sky-700",
    };
  }

  return {
    label: "Upcoming",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

const getMembershipTag = (status) => {
  if (status === "Accepted") {
    return {
      label: "Accepted",
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (status === "Pending") {
    return {
      label: "Pending",
      className: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "Open",
    className: "border-slate-200 bg-white text-slate-600",
  };
};

export default function CivilianDashboardHomePage() {
  const { events, getEvents, sendEventRequest } = useCivilian();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestingId, setRequestingId] = useState(null);
  const [requestedMap, setRequestedMap] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await getEvents();
      } catch (fetchError) {
        setError(fetchError || "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const acceptedEvents = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const currentStatus = requestedMap[event._id]
          ? "Pending"
          : event.membershipStatus;
        return currentStatus === "Accepted";
      }),
    [sortedEvents, requestedMap],
  );

  const pendingEvents = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const currentStatus = requestedMap[event._id]
          ? "Pending"
          : event.membershipStatus;
        return currentStatus === "Pending";
      }),
    [sortedEvents, requestedMap],
  );

  const openEvents = useMemo(
    () =>
      sortedEvents.filter((event) => {
        const currentStatus = requestedMap[event._id]
          ? "Pending"
          : event.membershipStatus;
        return !currentStatus;
      }),
    [sortedEvents, requestedMap],
  );

  const onSendRequest = async (eventId) => {
    if (!eventId) return;

    try {
      setRequestingId(eventId);
      await sendEventRequest(eventId);
      setRequestedMap((prev) => ({ ...prev, [eventId]: true }));
      message.success("Request sent successfully.");
    } catch (requestError) {
      message.error(requestError || "Failed to send request");
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-5">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-200/80">
          <LayoutDashboard className="h-7 w-7 text-white" />
        </div>
        <div>
          <h1
            className="text-3xl font-bold tracking-tight text-slate-900"
            style={{ fontFamily: "'Lora', Georgia, serif" }}
          >
            Civilian Dashboard
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-600">
            Track requests, view accepted events, and discover new activities.
          </p>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="mb-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            <Users className="h-4 w-4" />
            Total Events
          </div>
          <p className="mt-3 text-2xl font-bold text-slate-900">{sortedEvents.length}</p>
        </article>

        <article className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <CalendarCheck2 className="h-4 w-4" />
            Accepted
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-700">{acceptedEvents.length}</p>
        </article>

        <article className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
            <Send className="h-4 w-4" />
            Pending
          </div>
          <p className="mt-3 text-2xl font-bold text-amber-700">{pendingEvents.length}</p>
        </article>

        <article className="rounded-2xl border border-sky-200 bg-sky-50/60 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
            <Tags className="h-4 w-4" />
            Open to Join
          </div>
          <p className="mt-3 text-2xl font-bold text-sky-700">{openEvents.length}</p>
        </article>
      </section>

      <section className="mb-7 rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-200/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Accepted Events</h2>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            {acceptedEvents.length} active
          </span>
        </div>

        {acceptedEvents.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            No accepted events yet. Send requests from the open events section below.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {acceptedEvents.map((event) => {
              const scheduleTag = getScheduleTag(event.date);

              return (
                <article
                  key={event._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                    {event.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Accepted
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${scheduleTag.className}`}
                    >
                      {scheduleTag.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                      {event.organization || "Community Team"}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-medium text-slate-500">Date:</span>{" "}
                      {formatDate(event.date)}
                    </p>
                    <p className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {event.location || "Location will be updated"}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-200/90 bg-white/95 p-6 shadow-lg shadow-slate-200/30">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Open Events</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Request to join
          </span>
        </div>

        {openEvents.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
            You have no open events right now. Check back later for new opportunities.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {openEvents.slice(0, 6).map((event) => {
              const scheduleTag = getScheduleTag(event.date);
              const membershipTag = getMembershipTag(event.membershipStatus);
              const isRequesting = requestingId === event._id;

                return (
                <article
                  key={event._id}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <h3 className="text-lg font-semibold text-slate-900">{event.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {event.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${membershipTag.className}`}
                  >
                    {membershipTag.label}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${scheduleTag.className}`}
                  >
                    {scheduleTag.label}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    {event.organization || "Community Team"}
                  </span>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-medium text-slate-500">Date:</span>{" "}
                    {formatDate(event.date)}
                  </p>
                  <p className="inline-flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {event.location || "Location will be updated"}
                  </p>
                  </div>

                  <button
                  type="button"
                  onClick={() => onSendRequest(event._id)}
                  disabled={isRequesting}
                  className="mt-4 inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:bg-emerald-300"
                  >
                  {isRequesting ? "Sending..." : "Request to Join"}
                  </button>
                </article>
                );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
