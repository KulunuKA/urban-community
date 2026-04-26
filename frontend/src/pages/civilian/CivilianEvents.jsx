import React, { useMemo, useState, useEffect } from "react";
import { message } from "antd";
import EventCard from "@/components/EventCard";
import { useCivilian } from "@/contexts/CivilianProvider";
import { Spinner } from "@/components/common/Spinner";

export default function CivilianEvents() {
  const { events, getEvents, sendEventRequest } = useCivilian();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestingId, setRequestingId] = useState(null);
  const [requestedMap, setRequestedMap] = useState({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await getEvents();
      } catch (error) {
        console.error("Error fetching events:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events]);

  const onSendRequest = async (eventId) => {
    if (!eventId) return;

    try {
      setRequestingId(eventId);
      await sendEventRequest(eventId);
      setRequestedMap((prev) => ({ ...prev, [eventId]: true }));
      message.success("Request sent successfully.");
    } catch (requestError) {
      console.error("Error sending request:", requestError);
      message.error(requestError || "Failed to send request");
    } finally {
      setRequestingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <Spinner label="Loading civilian profile" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-5xl px-6 py-8">
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          {error || "Failed to load events."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Community Events</h1>
        <p className="mt-2 text-sm text-slate-600">
          Discover activities in your area and send a request to join.
        </p>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-600">
          No events available right now.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sortedEvents.map((event) => {
            const currentStatus = requestedMap[event._id]
              ? "Pending"
              : event.membershipStatus;
            const isRequesting = requestingId === event._id;

            return (
              <EventCard
                key={event._id}
                event={event}
                membershipStatus={currentStatus}
                isRequesting={isRequesting}
                onSendRequest={onSendRequest}
                type="civilian"
              />
            );
          })}
        </div>
      )}
    </div>
  );
}