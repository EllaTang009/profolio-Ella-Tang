import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../auth";
import BlogManager from "./BlogManager";

export const metadata: Metadata = {
  title: "Blog Posts (Admin)",
};

// Same admin session gate as /admin: unauthenticated visitors are sent to
// the password form there first. The gate reads request-time cookies, so
// it streams inside the Suspense boundary; the post list itself is loaded
// client-side by BlogManager from GET /api/blogs.
async function AdminBlogsContent() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  return <BlogManager />;
}

export default function AdminBlogs() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Blog Posts</h1>
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
        <AdminBlogsContent />
      </Suspense>
    </section>
  );
}
