import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { isAdminAuthenticated } from "./auth";
import PasswordForm from "./PasswordForm";
import SubmissionsTable from "./SubmissionsTable";
import { logoutAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Admin",
};

// The gate runs at request time: cookies() is a dynamic API, so the
// prerendered shell ships the fallback while this check runs per request.
async function AdminGate() {
  if (!(await isAdminAuthenticated())) {
    return <PasswordForm />;
  }
  return (
    <>
      <form action={logoutAdmin} className="mt-4">
        <button
          type="submit"
          className="font-mono text-[13px] text-secondary transition-colors hover:text-foreground"
        >
          Log out
        </button>
      </form>
      <p className="mt-6">
        <Link
          href="/admin/blogs"
          className="font-mono text-[13px] text-accent transition-colors hover:text-foreground"
        >
          Manage blog posts &rarr;
        </Link>
      </p>
      <p className="mt-3">
        <Link
          href="/tracker"
          className="font-mono text-[13px] text-accent transition-colors hover:text-foreground"
        >
          Job application tracker &rarr;
        </Link>
      </p>
      <p className="mt-3">
        <Link
          href="/admin/projects"
          className="font-mono text-[13px] text-accent transition-colors hover:text-foreground"
        >
          Manage projects &rarr;
        </Link>
      </p>
      <SubmissionsTable />
    </>
  );
}

export default function Admin() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Submissions</h1>
      <Suspense
        fallback={
          <div className="mt-8 h-48 animate-pulse rounded-xl border border-line bg-surface" />
        }
      >
        <AdminGate />
      </Suspense>
    </section>
  );
}
