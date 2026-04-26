import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Input({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  icon: Icon,
  error,
  required = false,
  disabled = false,
  className = "",
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label
          htmlFor={id}
          className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-1"
        >
          {label}
          {required && (
            <span style={{ color: "var(--primary-blue)", marginLeft: "3px" }}>
              *
            </span>
          )}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 flex items-center pointer-events-none transition-color duration-180">
            <Icon size={15} />
          </span>
        )}
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          disabled={disabled}
          className={`w-full p-3 text-sm font-normal text-gray-900 bg-white border border-gray-300 rounded-lg ${error ? "border-red-500" : ""} ${Icon ? "pl-10" : "pl-3"} ${isPassword ? "pr-10" : "pr-3"} ${disabled ? "cursor-not-allowed bg-slate-100 text-slate-500" : ""} ${className}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-none border-none cursor-pointer text-gray-500 flex items-center p-0"
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {error && (
        <p className=" text-sm text-red-600 dark:text-red-500">{error}</p>
      )}
    </div>
  );
}
