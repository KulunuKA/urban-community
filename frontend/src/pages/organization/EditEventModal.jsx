import React from "react";

export default function EditEventModal({ 
  editForm, setEditForm, onClose, onUpdate, 
  inputStyle, focusInput, blurInput,
  onSearchLocation, suggestions, setSuggestions 
}) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "560px" }}>
        <div className="flex justify-between items-start mb-6 pb-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Initiative</h2>
            <p className="text-xs text-slate-500 mt-1">Search for a new location or edit details.</p>
          </div>
          <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <form onSubmit={onUpdate}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Title</label>
              <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} required style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase text-slate-500">Date</label>
              <input type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} required style={inputStyle} onFocus={focusInput} onBlur={blurInput} />
            </div>

            {/* Location with Photon Suggestions */}
            <div className="flex flex-col gap-1 relative col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-500">Location</label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => {
                  setEditForm({ ...editForm, location: e.target.value });
                  onSearchLocation(e.target.value); // safe — debounced in parent
                }}
                required
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />

              {/* Photon Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 z-[60] shadow-2xl max-h-48 overflow-y-auto">
                  {suggestions.map((item, index) => {
                    const label = [
                      item.properties.name,
                      item.properties.city,
                      item.properties.country
                    ].filter(Boolean).join(", ");

                    return (
                      <div
                        key={index}
                        className="p-3 text-xs hover:bg-emerald-50 cursor-pointer border-b last:border-none text-slate-700"
                        onClick={() => {
                          setEditForm({ ...editForm, location: label });
                          setSuggestions([]);
                        }}
                      >
                        📍 {label}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <textarea rows={3} value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} required style={{ ...inputStyle, resize: "none", marginBottom: "1.5rem" }} onFocus={focusInput} onBlur={blurInput} />

          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-emerald-500 text-white rounded-xl py-3 font-semibold hover:bg-emerald-600 transition-colors">Save Changes</button>
            <button type="button" onClick={onClose} className="px-6 py-3 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
