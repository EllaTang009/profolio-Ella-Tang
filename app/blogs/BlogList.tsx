"use client";

import { useEffect, useState } from "react";
import type { BlogPost } from "@/lib/blogs";
import BlogCard from "./BlogCard";

// Fetches the posts from GET /api/blogs in the browser, so the list is
// always current without rebuilding the page.
export default function BlogList() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/blogs");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as BlogPost[];
        if (!cancelled) {
          setPosts(data);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load the posts. Please try again later.");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="type-body mt-10">{error}</p>;
  }

  if (posts === null) {
    return <p className="type-caption mt-10 font-mono">Loading posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <p className="type-body mt-10">No posts yet. Check back soon!</p>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
      {posts.map((post) => (
        <BlogCard key={post.id} post={post} />
      ))}
    </div>
  );
}
