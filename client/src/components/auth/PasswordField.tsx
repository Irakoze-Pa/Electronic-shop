import { useState } from "react";
import { authFieldClass } from "./AuthShell";

export function PasswordField({
  autoComplete,
  label,
  name,
}: {
  autoComplete: string;
  label: string;
  name: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="block text-sm font-bold">
      {label}
      <span className="relative block">
        <input
          autoComplete={autoComplete}
          className={`${authFieldClass} pr-16`}
          name={name}
          required
          type={visible ? "text" : "password"}
        />
        <button
          className="absolute inset-y-0 right-4 mt-2 text-xs font-bold text-sky-600 hover:text-sky-700"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
          type="button"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
