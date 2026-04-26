import React from "react";

export default function RegisterEventForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  inputStyle, 
  focusInput, 
  blurInput, 
  onSearchLocation, 
  suggestions, 
  setSuggestions,
  isLocating
}) {
  return (
    <div className="max-w-2xl mx-auto rounded-2xl p-8 border border-slate-200 bg-white shadow-sm">
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Event Title */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Title</label>
            <input 
              type="text" 
              placeholder="Eco-Drive 2026" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
              required 
              style={inputStyle} 
              onFocus={focusInput} 
              onBlur={blurInput} 
            />
          </div>

          {/* Event Date */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Date</label>
            <input 
              type="date" 
              value={formData.date} 
              onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
              required 
              style={inputStyle} 
              onFocus={focusInput} 
              onBlur={blurInput} 
            />
          </div>

          {/* Searchable Location Field with Button */}
          <div className="flex flex-col gap-2 relative md:col-span-1">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Event Location</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type location..."
                value={formData.location}
                onChange={(e) => {
                  setFormData({ ...formData, location: e.target.value });
                  if (suggestions.length > 0) setSuggestions([]);
                }}
                required
                className="flex-1"
                style={inputStyle}
                onFocus={focusInput}
                onBlur={blurInput}
              />
              <button
                type="button"
                onClick={() => onSearchLocation(formData.location)}
                disabled={isLocating}
                className="px-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                title="Search location"
              >
                {isLocating ? "⏳" : "🔍"}
              </button>
            </div>

            {/* Photon Suggestions Dropdown */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-xl mt-1 z-50 shadow-xl max-h-60 overflow-y-auto">
                {suggestions.map((item, index) => {
                  const label = [
                    item.properties.name,
                    item.properties.city,
                    item.properties.country
                  ].filter(Boolean).join(", ");

                  return (
                    <div
                      key={index}
                      className="p-3 text-sm hover:bg-emerald-50 cursor-pointer border-b last:border-none text-slate-700"
                      onClick={() => {
                        setFormData({ ...formData, location: label });
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

          {/* Organization */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Organization</label>
            <input 
              type="text" 
              placeholder="Urban Care Team" 
              value={formData.organization} 
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })} 
              required 
              style={inputStyle} 
              onFocus={focusInput} 
              onBlur={blurInput} 
            />
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Description</label>
          <textarea 
            rows={5} 
            placeholder="Details..." 
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            required 
            className="resize-none" 
            style={{ ...inputStyle, lineHeight: "1.6" }} 
            onFocus={focusInput} 
            onBlur={blurInput} 
          />
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-2">
          <button 
            type="submit" 
            className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors"
          >
            Publish Initiative
          </button>
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
