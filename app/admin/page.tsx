import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { getAdminSessionToken } from "./auth";
import PasswordForm from "./PasswordForm";
import { getSubmissions, type Submission } from "@/lib/submissions";

export const metadata: Metadata = {
  title: "Admin",
};

// The gate runs at request time: cookies() is a dynamic API, so the
// prerendered shell ships the fallback while this check runs per request.
async function AdminGate() {
  const cookieStore = await cookies();
  const expected = getAdminSessionToken();
  const authed =
    expected !== null && cookieStore.get("admin_session")?.value === expected;

  if (!authed) {
    return <PasswordForm />;
  }
  return <SubmissionsTable />;
}

// This async component runs at request time, so the table always
// reflects the latest contents of data/submissions.json.
async function SubmissionsTable() {
  const submissions = await getSubmissions();

  // Newest first (ISO timestamps sort chronologically as strings).
  const sorted = [...submissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );

  if (sorted.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <p className="text-zinc-600">No submissions yet.</p>
        <p className="mt-2 text-sm text-zinc-500">
          Messages sent from the{" "}
          <Link
            href="/contact-me-server-form"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            server action form
          </Link>{" "}
          or the{" "}
          <Link
            href="/contact-me"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            API form
          </Link>{" "}
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mt-4 text-sm font-medium text-zinc-500">
        {sorted.length} {sorted.length === 1 ? "submission" : "submissions"}
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-zinc-200 bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sorted.map((submission: Submission) => (
              <tr key={submission.id} className="align-top hover:bg-zinc-50">
                <td className="px-4 py-3 font-medium text-zinc-900">
                  {submission.name}
                </td>
                <td className="px-4 py-3 text-zinc-600">{submission.email}</td>
                <td className="max-w-xs px-4 py-3 text-zinc-600">
                  {submission.message}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block whitespace-nowrap rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {submission.source ?? "—"}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-zinc-500">
                  {new Date(submission.submittedAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Admin() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
        Submissions
      </h1>
      <Suspense
        fallback={
          <div className="mt-8 h-48 animate-pulse rounded-2xl border border-zinc-200 bg-zinc-100" />
        }
      >
        <AdminGate />
      </Suspense>
    </section>
  );
}
