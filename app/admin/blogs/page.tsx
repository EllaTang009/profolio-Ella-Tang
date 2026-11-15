import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "../auth";
import BlogForm from "./BlogForm";
import { getBlogs } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blog Posts (Admin)",
};

// Same admin session gate as /admin: unauthenticated visitors are sent to
// the password form there first. The gate and the post list both read
// request-time data, so they stream inside the Suspense boundary.
async function AdminBlogsContent() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const blogs = await getBlogs();
  const sorted = [...blogs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <>
      <h2 className="type-h3 mt-10">New post</h2>
      <BlogForm />

      <h2 className="type-h3 mt-14">Published posts ({sorted.length})</h2>
      {sorted.length === 0 ? (
        <p className="type-body mt-4">No posts yet. Publish the first one above.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {sorted.map((post) => (
            <li key={post.id} className="flex items-baseline gap-4 px-5 py-4">
              <Link
                href={`/blogs/${post.slug}`}
                className="font-medium text-foreground transition-colors hover:text-accent"
              >
                {post.title}
              </Link>
              <span className="ml-auto whitespace-nowrap font-mono text-[13px] text-secondary">
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              </span>
              <span className="whitespace-nowrap font-mono text-[13px] text-secondary">
                /{post.slug}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
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
