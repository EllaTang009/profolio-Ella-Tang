import { promises as fs } from "fs";
import path from "path";

export type SubmissionSource = "server-form" | "api";

export interface NewSubmission {
  name: string;
  email: string;
  message: string;
  source: SubmissionSource;
}

export interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  // Older entries saved before the source field was introduced may not
  // have it, so it stays optional when reading.
  source?: SubmissionSource;
}

const submissionsPath = path.join(process.cwd(), "data", "submissions.json");

export async function getSubmissions(): Promise<Submission[]> {
  // A failed read (missing file or invalid JSON) simply starts from an empty array.
  try {
    const raw = await fs.readFile(submissionsPath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Submission[]) : [];
  } catch {
    return [];
  }
}

export async function addSubmission(input: NewSubmission): Promise<Submission> {
  // Make sure the data folder exists before writing.
  await fs.mkdir(path.dirname(submissionsPath), { recursive: true });

  const submissions = await getSubmissions();

  // Attach a unique id, an ISO timestamp, and the form source to each new entry.
  const submission: Submission = {
    ...input,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString(),
  };
  submissions.push(submission);

  await fs.writeFile(
    submissionsPath,
    JSON.stringify(submissions, null, 2),
    "utf8"
  );

  return submission;
}

export async function deleteSubmission(id: string): Promise<boolean> {
  const submissions = await getSubmissions();
  const remaining = submissions.filter((entry) => entry.id !== id);

  // Unknown id: nothing to write, so the caller knows the delete failed.
  if (remaining.length === submissions.length) {
    return false;
  }

  await fs.writeFile(
    submissionsPath,
    JSON.stringify(remaining, null, 2),
    "utf8"
  );
  return true;
}
