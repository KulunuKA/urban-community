import React, { useState, useEffect } from "react";

// Derive status from date since your schema has no status field
const getStatus = (dateStr) =>
  new Date(dateStr) > new Date() ? "upcoming" : "completed";

// Build MONTHLY chart data from real events
const buildMonthly = (events) => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const currentYear = new Date().getFullYear();
  const buckets = Array(12).fill(0);

  events.forEach((e) => {
    const d = new Date(e.date);
    if (d.getFullYear() === currentYear) {
      buckets[d.getMonth()] += e.memberCount || 0;
    }
  });

  return months.map((month, i) => ({ month, participants: buckets[i] }));
};

const LeafIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const UsersIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const TrendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
    <polyline points="17 6 23 6 23 12"/>
  </svg>
);
const LocationIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export default function OrganizationDashboard() {
  const [events, setEvents]               = useState([]);
  const [monthly, setMonthly]             = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [animatedValues, setAnimatedValues] = useState({ events: 0, participants: 0, completed: 0, upcoming: 0 });
  const [barHeights, setBarHeights]       = useState([]);
  const [loaded, setLoaded]               = useState(false);

  // ─── Fetch real data ───────────────────────────────────────────────────────
  useEffect(() => {
    const token = sessionStorage.getItem("accessToken");

    fetch("http://localhost:3000/api/events/my-events", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(({ data }) => {
        // Attach derived status to each event
        const enriched = data.map((e) => ({
          ...e,
          status: getStatus(e.date),
          participants: e.memberCount || 0, // normalise field name for the UI
        }));
        setEvents(enriched);
        setMonthly(buildMonthly(enriched));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // ─── Derived stats ────────────────────────────────────────────────────────
  const totalParticipants = events.reduce((s, e) => s + e.participants, 0);
  const completed         = events.filter((e) => e.status === "completed").length;
  const upcoming          = events.filter((e) => e.status === "upcoming").length;
  const maxBar            = monthly.length ? Math.max(...monthly.map((m) => m.participants)) : 1;
  const recentEvents      = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

  // ─── Animate once data is ready ───────────────────────────────────────────
  useEffect(() => {
    if (loading) return;

    const t = setTimeout(() => {
      setLoaded(true);
      setBarHeights(monthly.map(() => 0));

      const targets  = { events: events.length, participants: totalParticipants, completed, upcoming };
      const duration = 1200, steps = 40;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        const ease = 1 - Math.pow(1 - step / steps, 3);
        setAnimatedValues({
          events:       Math.round(targets.events * ease),
          participants: Math.round(targets.participants * ease),
          completed:    Math.round(targets.completed * ease),
          upcoming:     Math.round(targets.upcoming * ease),
        });
        if (step >= steps) clearInterval(interval);
      }, duration / steps);

      monthly.forEach((m, i) => {
        setTimeout(() => {
          setBarHeights((prev) => {
            const next = [...prev];
            next[i] = m.participants;
            return next;
          });
        }, i * 80);
      });
    }, 100);

    return () => clearTimeout(t);
  }, [loading, events, monthly]);

  // ─── Guards ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#10b981", fontFamily: "monospace", fontSize: "14px", letterSpacing: "2px" }}>
        LOADING DASHBOARD...
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0f1117", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ color: "#f87171", fontFamily: "monospace", fontSize: "14px" }}>
        Error: {error}
      </div>
    </div>
  );

  return (
    <div style={{
      padding: "2.5rem", minHeight: "100vh", background: "#0f1117",
      color: "#f1f5f9", fontFamily: "'DM Sans', sans-serif",
      opacity: loaded ? 1 : 0, transition: "opacity 0.4s ease",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"2.5rem", paddingBottom:"1.5rem", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"6px" }}>
            <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#10b981", boxShadow:"0 0 8px #10b981" }} />
            <span style={{ fontSize:"11px", color:"#10b981", fontWeight:600, letterSpacing:"1.5px", textTransform:"uppercase" }}>Live Dashboard</span>
          </div>
          <h1 style={{ fontSize:"28px", fontWeight:600, color:"#f1f5f9", letterSpacing:"-0.5px", margin:0 }}>Organization Overview</h1>
          <p style={{ fontSize:"14px", color:"#6b7280", marginTop:"4px" }}>Track impact, events, and community reach at a glance.</p>
        </div>
        <div style={{ fontFamily:"'DM Mono', monospace", fontSize:"12px", color:"#4b5563", textAlign:"right" }}>
          <div>{new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" })}</div>
          <div style={{ color:"#374151", fontSize:"11px", marginTop:"2px" }}>{new Date().getFullYear()} Season</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:"1rem", marginBottom:"1.75rem" }}>
        {[
          { label:"Total Events",  value:animatedValues.events,       icon:<LeafIcon />,     accent:"#10b981", bg:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.15)" },
          { label:"Participants",  value:animatedValues.participants,  icon:<UsersIcon />,    accent:"#6366f1", bg:"rgba(99,102,241,0.08)",  border:"rgba(99,102,241,0.15)" },
          { label:"Completed",     value:animatedValues.completed,     icon:<TrendIcon />,    accent:"#f59e0b", bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.15)" },
          { label:"Upcoming",      value:animatedValues.upcoming,      icon:<CalendarIcon />, accent:"#38bdf8", bg:"rgba(56,189,248,0.08)",  border:"rgba(56,189,248,0.15)" },
        ].map(({ label, value, icon, accent, bg, border }) => (
          <div key={label} style={{ background:"#1a1d27", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"1.25rem 1.5rem", position:"relative", overflow:"hidden", transition:"border-color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = border)}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:accent, opacity:0.7 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ fontSize:"12px", color:"#6b7280", fontWeight:500, marginBottom:"10px", letterSpacing:"0.3px" }}>{label}</div>
                <div style={{ fontSize:"32px", fontWeight:600, color:"#f1f5f9", lineHeight:1, fontFamily:"'DM Mono', monospace" }}>{value}</div>
              </div>
              <div style={{ background:bg, border:`1px solid ${border}`, borderRadius:"10px", padding:"8px", color:accent }}>{icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart + Recent Events */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.1fr", gap:"1rem", marginBottom:"1rem" }}>

        {/* Bar chart — driven by real monthly data */}
        <div style={{ background:"#1a1d27", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"1.5rem" }}>
          <div style={{ marginBottom:"1.5rem" }}>
            <div style={{ fontSize:"14px", fontWeight:600, color:"#f1f5f9" }}>Participant Activity</div>
            <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"3px" }}>Monthly reach — {new Date().getFullYear()}</div>
          </div>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", height:"140px" }}>
            {monthly.map((m, i) => {
              const pct = maxBar > 0 ? ((barHeights[i] || 0) / maxBar) * 100 : 0;
              const isActive = (barHeights[i] || 0) > 0;
              return (
                <div key={m.month} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", height:"100%" }}>
                  <div style={{ flex:1, width:"100%", display:"flex", alignItems:"flex-end" }}>
                    <div style={{
                      width:"100%", height:`${pct}%`, minHeight:isActive ? "4px" : "0",
                      background: isActive ? "linear-gradient(to top, #10b981, rgba(16,185,129,0.4))" : "rgba(255,255,255,0.04)",
                      borderRadius:"5px 5px 3px 3px",
                      transition:"height 0.7s cubic-bezier(0.34,1.56,0.64,1)",
                      border: isActive ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(255,255,255,0.06)",
                      position:"relative",
                    }}>
                      {isActive && (
                        <div style={{ position:"absolute", top:"-20px", left:"50%", transform:"translateX(-50%)", fontSize:"10px", color:"#34d399", fontFamily:"'DM Mono', monospace", whiteSpace:"nowrap" }}>
                          {m.participants}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize:"11px", color:"#4b5563", fontWeight:500 }}>{m.month}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop:"1.25rem", paddingTop:"1rem", borderTop:"1px solid rgba(255,255,255,0.05)", display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:"11px", color:"#4b5563" }}>Total this year</span>
            <span style={{ fontSize:"12px", color:"#10b981", fontFamily:"'DM Mono', monospace", fontWeight:500 }}>
              {totalParticipants} participants
            </span>
          </div>
        </div>

        {/* Recent Events */}
        <div style={{ background:"#1a1d27", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"16px", padding:"1.5rem" }}>
          <div style={{ marginBottom:"1.25rem", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"14px", fontWeight:600, color:"#f1f5f9" }}>Recent Events</div>
              <div style={{ fontSize:"12px", color:"#6b7280", marginTop:"3px" }}>Latest activity from your org</div>
            </div>
          </div>
          {recentEvents.length === 0 ? (
            <div style={{ color:"#4b5563", fontSize:"13px", textAlign:"center", paddingTop:"2rem" }}>No events yet.</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"2px" }}>
              {recentEvents.map((event, i) => (
                <div key={event._id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 12px", borderRadius:"10px", background:"transparent", transition:"background 0.15s", cursor:"default", opacity:loaded ? 1 : 0, transform:loaded ? "translateY(0)" : "translateY(8px)", transitionDelay:`${i * 80 + 300}ms`, transitionProperty:"opacity, transform, background" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"8px", background:event.status === "completed" ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)", border:`1px solid ${event.status === "completed" ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:600, color:event.status === "completed" ? "#fbbf24" : "#34d399", flexShrink:0, fontFamily:"'DM Mono', monospace" }}>
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:"13px", fontWeight:500, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{event.title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px", marginTop:"2px" }}>
                      <span style={{ display:"flex", alignItems:"center", gap:"3px", fontSize:"11px", color:"#4b5563" }}>
                        <LocationIcon /> {event.location}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right", flexShrink:0 }}>
                    <div style={{ fontSize:"12px", color:"#94a3b8", fontFamily:"'DM Mono', monospace" }}>
                      {event.participants}<span style={{ fontSize:"10px", color:"#4b5563", marginLeft:"2px" }}>ppl</span>
                    </div>
                    <div style={{ fontSize:"10px", marginTop:"3px", color:event.status === "completed" ? "#fbbf24" : "#34d399", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                      {event.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Impact banner */}
      <div style={{ background:"#1a1d27", border:"1px solid rgba(16,185,129,0.12)", borderRadius:"16px", padding:"1.5rem 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"1rem", flexWrap:"wrap", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:"linear-gradient(to right, #10b981, #6366f1, transparent)" }} />
        <div>
          <div style={{ fontSize:"13px", color:"#6b7280", marginBottom:"4px" }}>Community impact score</div>
          <div style={{ display:"flex", alignItems:"baseline", gap:"8px" }}>
            <span style={{ fontSize:"36px", fontWeight:600, color:"#10b981", fontFamily:"'DM Mono', monospace", lineHeight:1 }}>{animatedValues.participants}</span>
            <span style={{ fontSize:"14px", color:"#6b7280" }}>people reached across</span>
            <span style={{ fontSize:"22px", fontWeight:600, color:"#f1f5f9", fontFamily:"'DM Mono', monospace" }}>{animatedValues.events}</span>
            <span style={{ fontSize:"14px", color:"#6b7280" }}>initiatives</span>
          </div>
        </div>
        <div style={{ minWidth:"220px", flex:1, maxWidth:"320px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
            <span style={{ fontSize:"11px", color:"#6b7280" }}>Yearly goal progress</span>
            <span style={{ fontSize:"11px", color:"#10b981", fontFamily:"'DM Mono', monospace" }}>{Math.min(Math.round((totalParticipants / 500) * 100), 100)}%</span>
          </div>
          <div style={{ height:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"99px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:loaded ? `${Math.min((totalParticipants / 500) * 100, 100)}%` : "0%", background:"linear-gradient(to right, #10b981, #6366f1)", borderRadius:"99px", transition:"width 1.2s cubic-bezier(0.34,1.2,0.64,1) 0.3s" }} />
          </div>
          <div style={{ fontSize:"11px", color:"#374151", marginTop:"6px" }}>Target: 500 participants / year</div>
        </div>
      </div>
    </div>
  );
}