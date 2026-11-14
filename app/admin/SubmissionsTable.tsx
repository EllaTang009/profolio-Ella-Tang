import Link from "next/link";
import DeleteButton from "./DeleteButton";
import { getSubmissions, type Submission } from "@/lib/submissions";

// This async server component runs at request time, so the table always
// reflects the latest contents of data/submissions.json. All admin
// actions it references live in ./actions.ts, guarded by ./auth.ts.
export default async function SubmissionsTable() {
  const submissions = await getSubmissions();

  // Newest first (ISO timestamps sort chronologically as strings).
  const sorted = [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );

  if (sorted.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="type-body">No submissions yet.</p>
        <p className="type-caption mt-2">
          Messages sent from the{" "}
          <Link
            href="/contact-me-server-form"
            className="text-accent hover:opacity-80"
          >
            server action form
          </Link>{" "}
          or the{" "}
          <Link href="/contact-me" className="text-accent hover:opacity-80">
            API form
          </Link>{" "}
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 type-caption font-mono">
        {sorted.length} {sorted.length === 1 ? "submission" : "submissions"}
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-white/5 font-mono text-[13px] uppercase tracking-wider text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((submission: Submission) => (
              <tr key={submission.id} className="align-top hover:bg-white/5">
                <td className="px-4 py-3 font-medium text-foreground">
                  {submission.name}
                </td>
                <td className="px-4 py-3 text-secondary">
                  {submission.email}
                </td>
                <td className="max-w-xs px-4 py-3 text-secondary">
                  {submission.message}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block whitespace-nowrap rounded-md border border-line px-2 py-0.5 font-mono text-[13px] text-accent">
                    {submission.source ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 type-caption font-mono">
                  {new Date(submission.submittedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <DeleteButton id={submission.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
