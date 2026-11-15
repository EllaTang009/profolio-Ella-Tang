import Link from "next/link";
import type { BlogPost } from "@/lib/blogs";

// Presentational card for a single blog post. Receives the post through
// props so it can be reused by any list (public page, admin, etc.).
export default function BlogCard({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-white/20">
      <p className="font-mono text-[13px] text-secondary">
        {new Date(post.createdAt).toLocaleDateString("en-US", {
          dateStyle: "medium",
        })}
      </p>
      <h2 className="type-h3 mt-3">
        <Link
          href={`/blogs/${post.slug}`}
          className="transition-colors hover:text-accent"
        >
          {post.title}
        </Link>
      </h2>
      <p className="type-body mt-2 flex-1">{post.summary}</p>
      <Link
        href={`/blogs/${post.slug}`}
        className="mt-4 font-mono text-[13px] text-accent transition-colors hover:text-foreground"
      >
        Read post &rarr;
      </Link>
    </article>
  );
}
