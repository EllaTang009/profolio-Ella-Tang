import { promises as fs } from "fs";
import path from "path";
import type { Application, NewApplication } from "@/lib/types/application";

// Re-exported so existing imports keep working and all application access
// stays reachable from one module.
export {
  APPLICATION_STATUSES,
  validateApplication,
} from "@/lib/types/application";
export type {
  Application,
  ApplicationFieldErrors,
  ApplicationFormErrors,
  ApplicationStatus,
  NewApplication,
} from "@/lib/types/application";

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
