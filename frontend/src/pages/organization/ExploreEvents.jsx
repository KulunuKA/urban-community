import React, { useState, useEffect } from "react";
import { useCivilian } from "@/contexts/CivilianProvider";
import EventCard from "@/components/EventCard"; // Import the card
import { Spinner } from "@/components/common/Spinner"; // Assuming you have a spinner

export default function ExploreEvents() {
  const { events, getEvents } = useCivilian();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        await getEvents();
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [getEvents]); // Added getEvents to dependency array

  if (loading) return <Spinner label="Loading events..." />;

  if (error) return (
    <div className="p-10 text-rose-600 bg-rose-50 border border-rose-200 rounded-xl">
      {error}
    </div>
  );

  return (
    <div className="p-6 lg:p-10 min-h-screen bg-white text-slate-900">
      <header className="mb-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl font-bold tracking-tight">Explore Events</h1>
        <p className="mt-1 text-sm text-slate-600">
          See what other organizations are doing in the community.
        </p>
      </header>

      {events.length === 0 ? (
        <div className="py-20 text-center rounded-2xl border-1.5 border-dashed border-slate-300 bg-slate-50">
          <p className="italic text-slate-500">No community events listed yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}