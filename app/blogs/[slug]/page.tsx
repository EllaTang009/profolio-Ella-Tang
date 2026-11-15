import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getBlogs, getBlogBySlug } from "@/lib/blogs";

export const metadata: Metadata = {
  title: "Blog Post",
};

// Known slugs are prerendered at build time; posts created later in the
// admin render on demand.
export async function generateStaticParams() {
  const blogs = await getBlogs();
  return blogs.map((post) => ({ slug: post.slug }));
}

// The content is dynamic (posts are created in the admin at runtime), so
// the slug resolution and body run per request inside a Suspense boundary.
async function PostContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();
  const post = await getBlogBySlug(slug);

  if (!post) {
    return (
      <section className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-start px-4 py-24 sm:px-6">
        <h1 className="type-h2">Post not found</h1>
        <p className="type-body mt-4">
          Sorry, there is no blog post matching{" "}
          <code className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[13px] text-foreground">
            /blogs/{slug}
          </code>
          .
        </p>
        <Link
          href="/blogs"
          className="btn-secondary mt-8 inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
        >
          Back to Blog
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <Link
        href="/blogs"
        className="font-mono text-[13px] text-secondary transition-colors hover:text-foreground"
      >
        &larr; Back to Blog
      </Link>

      <p className="mt-8 font-mono text-[13px] text-secondary">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          dateStyle: "medium",
        })}
      </p>
      <h1 className="type-h2 mt-3">{post.title}</h1>
      <p className="type-body mt-4">{post.summary}</p>

      <div className="mt-10 space-y-4 border-t border-line pt-8">
        {post.content.split("\n").map((paragraph, i) =>
          paragraph.trim() ? (
            <p key={i} className="type-body">
              {paragraph}
            </p>
          ) : null
        )}
      </div>
    </section>
  );
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
          <div className="h-96 animate-pulse rounded-xl border border-line bg-surface" />
        </div>
      }
    >
      <PostContent params={params} />
    </Suspense>
  );
}
