// Shared application types — no Node imports, so both server modules
// (lib/applications.ts) and client components can import this file safely.

// The four statuses an application can have. Used by validation (server)
// and the form's status selector and stats tiles (client), so they always
// stay in sync.
export const APPLICATION_STATUSES = [
  "Applied",
  "Interviewing",
  "Offer",
  "Rejected",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface NewApplication {
  company: string;
  role: string;
  location: string;
  status: ApplicationStatus;
  appliedDate: string;
  link: string;
  notes: string;
}

export interface Application extends NewApplication {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationFieldErrors {
  company?: string;
  role?: string;
  status?: string;
  appliedDate?: string;
}

// Field errors plus an optional form-level message for problems that are
// not tied to one field (malformed JSON, save failures, network errors).
export type ApplicationFormErrors = ApplicationFieldErrors & { form?: string };

export interface ApplicationInput {
  company: string;
  role: string;
  location: string;
  status: string;
  appliedDate: string;
  link: string;
  notes: string;
}

// Single source of truth for application validation. Expects
// already-trimmed values; called by the API routes before any write.
// (Lives here because it is pure: no Node imports needed.)
export function validateApplication(
  input: ApplicationInput
): ApplicationFieldErrors {
  const errors: ApplicationFieldErrors = {};

  if (!input.company) {
    errors.company = "Please enter the company name.";
  }
  if (!input.role) {
    errors.role = "Please enter the role.";
  }
  if (!APPLICATION_STATUSES.includes(input.status as ApplicationStatus)) {
    errors.status = "Please choose a valid status.";
  }
  // Must be a real calendar date; "2026-02-30" and "not a date" both fail.
  if (!input.appliedDate || Number.isNaN(Date.parse(input.appliedDate))) {
    errors.appliedDate = "Please enter a valid date.";
  }
  return errors;
}
