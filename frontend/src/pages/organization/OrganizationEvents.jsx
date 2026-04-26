import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getSessionValue } from "@/utils/session";

// Components
import EventCard from "../../components/EventCard"; 
import EditEventModal from "./EditEventModal"; 
import RegisterEventForm from "./RegisterEventForm";

const inputStyle = { background: "#ffffff", border: "1px solid #cbd5e1", padding: "11px 14px", color: "#0f172a", borderRadius: "10px", fontSize: "14px", width: "100%", outline: "none", fontFamily: "inherit" };
const focusInput = (e) => { e.target.style.borderColor = "rgba(16,185,129,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.08)"; };
const blurInput = (e) => { e.target.style.borderColor = "#cbd5e1"; e.target.style.boxShadow = "none"; };

export default function OrganizationEvents() {
  const [view, setView] = useState("overview");
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", date: "", location: "", organization: "" });
  const [formData, setFormData] = useState({ title: "", description: "", date: "", location: "", organization: "" });
  const [isLocating, setIsLocating] = useState(false);

  const debounceTimer = useRef(null);

  const getAuthToken = () => getSessionValue("accessToken");

  const fetchMyEvents = async () => {
    try {
      const token = getAuthToken();
      const response = await axios.get("http://localhost:3000/api/events/my-events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEvents(response.data.data || []);
    } catch (err) { console.error("Error fetching your events", err); }
  };

  useEffect(() => { fetchMyEvents(); }, []);

  // --- Third Party API: Photon (OpenStreetMap) Search with debounce ---
  const handleSearchLocation = (query) => {
    clearTimeout(debounceTimer.current);

    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setIsLocating(true);
      try {
        const response = await axios.get(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
        );
        setSuggestions(response.data.features || []);
      } catch (err) {
        console.error("Search error:", err);
        alert("Search failed. Please try again.");
      } finally {
        setIsLocating(false);
      }
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await axios.post("http://localhost:3000/api/events", formData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Event registered successfully!");
      setFormData({ title: "", description: "", date: "", location: "", organization: "" });
      setView("overview");
      fetchMyEvents();
    } catch (err) { alert(err.response?.data?.message || "Registration failed."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const token = getAuthToken();
      await axios.delete(`http://localhost:3000/api/events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchMyEvents();
    } catch (err) { alert("Unauthorized deletion."); }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date ? event.date.substring(0, 10) : "",
      location: event.location || "",
      organization: event.organization || ""
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      await axios.put(`http://localhost:3000/api/events/${editingEvent._id}`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      setEditingEvent(null);
      fetchMyEvents();
    } catch (err) { alert("Update failed."); }
  };

  return (
    <div className="p-6 lg:p-10 min-h-screen bg-white text-slate-900">
      
      {editingEvent && (
        <EditEventModal 
          editForm={editForm} setEditForm={setEditForm} 
          onClose={() => { setEditingEvent(null); setSuggestions([]); }} 
          onUpdate={handleUpdate}
          inputStyle={inputStyle} focusInput={focusInput} blurInput={blurInput}
          onSearchLocation={handleSearchLocation}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
        />
      )}

      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-6 border-b border-slate-100">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{view === "overview" ? "My Eco-Hub" : "Host a New Initiative"}</h1>
          <p className="mt-1 text-sm text-slate-500">{view === "overview" ? "Manage and track your organization's contributions." : "Fill in the details to launch your next program."}</p>
        </div>
        <button onClick={() => {
          setView(view === "overview" ? "register" : "overview");
          setSuggestions([]);
        }} className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600">
          {view === "overview" ? "+ Register Event" : "← Back to My Events"}
        </button>
      </header>

      {view === "overview" && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event._id} event={event} onEdit={openEditModal} onDelete={handleDelete} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <p className="italic text-slate-400">No community events registered yet.</p>
            </div>
          )}
        </div>
      )}

      {view === "register" && (
        <RegisterEventForm 
          formData={formData} setFormData={setFormData}
          onSubmit={handleSubmit} onCancel={() => setView("overview")}
          inputStyle={inputStyle} focusInput={focusInput} blurInput={blurInput}
          onSearchLocation={handleSearchLocation}
          suggestions={suggestions}
          setSuggestions={setSuggestions}
          isLocating={isLocating}
        />
      )}
    </div>
  );
}
