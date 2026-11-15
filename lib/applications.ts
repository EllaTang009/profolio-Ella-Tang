import { promises as fs } from "fs";
import path from "path";

// The four statuses an application can have. Used by validation and by the
// form's status selector, so they always stay in sync.
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

export interface ApplicationInput {
  company: string;
  role: string;
  location: string;
  status: string;
  appliedDate: string;
  link: string;
  notes: string;
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

// Single source of truth for application validation. Expects
// already-trimmed values; called by the API routes before any write.
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

const applicationsPath = path.join(process.cwd(), "data", "applications.json");

// All JSON file access lives in this module. The API routes and the page
// only ever call these functions.
export async function getApplications(): Promise<Application[]> {
  // A failed read (missing file or invalid JSON) simply starts from an empty array.
  try {
    const raw = await fs.readFile(applicationsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Application[]) : [];
  } catch {
    return [];
  }
}

export async function getApplicationById(
  id: string
): Promise<Application | undefined> {
  const applications = await getApplications();
  return applications.find((entry) => entry.id === id);
}

export async function addApplication(
  input: NewApplication
): Promise<Application> {
  // Make sure the data folder exists before writing.
  await fs.mkdir(path.dirname(applicationsPath), { recursive: true });

  const applications = await getApplications();

  // Attach a unique id and the two timestamps to the new entry.
  const now = new Date().toISOString();
  const application: Application = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  applications.push(application);

  await fs.writeFile(
    applicationsPath,
    JSON.stringify(applications, null, 2),
    "utf8"
  );
  return application;
}

export async function updateApplication(
  id: string,
  input: NewApplication
): Promise<Application | undefined> {
  const applications = await getApplications();

  // Unknown id: nothing is written, so the caller knows it failed.
  const index = applications.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return undefined;
  }

  // Replace the editable fields and refresh updatedAt; id and createdAt stay.
  applications[index] = {
    ...applications[index],
    ...input,
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(
    applicationsPath,
    JSON.stringify(applications, null, 2),
    "utf8"
  );
  return applications[index];
}

export async function deleteApplication(id: string): Promise<boolean> {
  const applications = await getApplications();
  const remaining = applications.filter((entry) => entry.id !== id);

  // Unknown id: nothing to write, so the caller knows the delete failed.
  if (remaining.length === applications.length) {
    return false;
  }

  await fs.writeFile(
    applicationsPath,
    JSON.stringify(remaining, null, 2),
    "utf8"
  );
  return true;
}
