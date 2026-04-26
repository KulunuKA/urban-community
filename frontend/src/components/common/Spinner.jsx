import React from "react";

export function Spinner({ label = 'Loading' }) {
  return (
    <div className="spinner" role="status" aria-live="polite">
      <span className="spinner__dot" aria-hidden />
      <span className="spinner__dot" aria-hidden />
      <span className="spinner__dot" aria-hidden />
      <span className="visually-hidden">{label}</span>
    </div>
  )
}
