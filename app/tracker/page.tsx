import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/app/admin/auth";
import ApplicationTracker from "./ApplicationTracker";

export const metadata: Metadata = {
  title: "Job Application Tracker",
};

// Same admin session gate as /admin: the application list is private, so
// unauthenticated visitors are sent to the password form first.
async function TrackerContent() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return <ApplicationTracker />;
}

export default function Tracker() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Job Application Tracker</h1>
      <p className="type-caption mt-4">
        <Link href="/admin" className="text-accent hover:opacity-80">
          &larr; Back to admin
        </Link>
      </p>
      <Suspense
        fallback={
          <div className="mt-10 h-96 animate-pulse rounded-xl border border-line bg-surface" />
        }
      >
        <TrackerContent />
      </Suspense>
    </section>
  );
}
