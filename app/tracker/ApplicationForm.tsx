"use client";

import { useState } from "react";
import {
  APPLICATION_STATUSES,
  type ApplicationFormErrors,
} from "@/lib/types/application";
import {
  fieldErrorClass,
  inputClass,
  labelClass,
  submitButtonClass,
} from "@/app/components/formStyles";

export interface ApplicationFormValues {
  company: string;
  role: string;
  location: string;
  status: string;
  appliedDate: string;
  link: string;
  notes: string;
}

// Used for both creating and editing: the parent passes empty values for
// create and the application being edited for edit (remounted via `key`,
// so the fields reseed). Errors come from the server (400 responses) and
// are shown under each field.
export default function ApplicationForm({
  initial,
  errors,
  saving,
  onSubmit,
  onCancel,
}: {
  initial: ApplicationFormValues;
  errors: ApplicationFormErrors;
  saving: boolean;
  onSubmit: (values: ApplicationFormValues) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<ApplicationFormValues>(initial);

  const set = (field: keyof ApplicationFormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(values);
      }}
      noValidate
    >
      {errors.form && (
        <p className={fieldErrorClass} role="alert">
          {errors.form}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="app-company" className={labelClass}>
            Company *
          </label>
          <input
            id="app-company"
            value={values.company}
            onChange={(e) => set("company", e.target.value)}
            className={`${inputClass} mt-1 ${errors.company ? "border-danger" : ""}`}
          />
          {errors.company && <p className={fieldErrorClass}>{errors.company}</p>}
        </div>

        <div>
          <label htmlFor="app-role" className={labelClass}>
            Role *
          </label>
          <input
            id="app-role"
            value={values.role}
            onChange={(e) => set("role", e.target.value)}
            className={`${inputClass} mt-1 ${errors.role ? "border-danger" : ""}`}
          />
          {errors.role && <p className={fieldErrorClass}>{errors.role}</p>}
        </div>

        <div>
          <label htmlFor="app-location" className={labelClass}>
            Location
          </label>
          <input
            id="app-location"
            value={values.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="San Francisco, CA"
            className={`${inputClass} mt-1`}
          />
        </div>

        <div>
          <label htmlFor="app-status" className={labelClass}>
            Status *
          </label>
          <select
            id="app-status"
            value={values.status}
            onChange={(e) => set("status", e.target.value)}
            className={`${inputClass} mt-1 ${errors.status ? "border-danger" : ""}`}
          >
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          {errors.status && <p className={fieldErrorClass}>{errors.status}</p>}
        </div>

        <div>
          <label htmlFor="app-date" className={labelClass}>
            Applied date *
          </label>
          <input
            id="app-date"
            type="date"
            value={values.appliedDate}
            onChange={(e) => set("appliedDate", e.target.value)}
            className={`${inputClass} mt-1 ${errors.appliedDate ? "border-danger" : ""}`}
          />
          {errors.appliedDate && (
            <p className={fieldErrorClass}>{errors.appliedDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="app-link" className={labelClass}>
            Job posting link
          </label>
          <input
            id="app-link"
            type="url"
            value={values.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="https://..."
            className={`${inputClass} mt-1`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="app-notes" className={labelClass}>
          Notes
        </label>
        <textarea
          id="app-notes"
          rows={3}
          value={values.notes}
          onChange={(e) => set("notes", e.target.value)}
          placeholder="Referrals, follow-ups, interview progress..."
          className={`${inputClass} mt-1`}
        />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving} className={submitButtonClass}>
          {saving ? "Saving..." : "Save application"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-sm font-medium text-secondary transition-colors hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
