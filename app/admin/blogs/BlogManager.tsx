"use client";

// BlogManager owns everything on /admin/blogs: it fetches the posts from
// GET /api/blogs on mount, renders the create form (BlogForm), and gives
// every post an inline Edit form (PUT) and a Delete button (DELETE with a
// confirm dialog). After every successful operation the list is refetched
// from the API. The browser sends the admin session cookie automatically.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  successBannerClass,
} from "@/app/components/formStyles";
import BlogForm from "./BlogForm";

// Local copy of the post shape: client components never import the lib
// module directly because it reads the JSON file with node "fs".
interface BlogPost {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  createdAt: string;
}

interface BlogFieldErrors {
  title?: string;
  summary?: string;
  content?: string;
  form?: string;
}

export default function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [listError, setListError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ title: "", summary: "", content: "" });
  const [draftErrors, setDraftErrors] = useState<BlogFieldErrors>({});
  const [saving, setSaving] = useState(false);

  // Reloads the whole list from the API. Called on mount and after every
  // successful create, update, or delete.
  const refresh = useCallback(async () => {
    const response = await fetch("/api/blogs");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setPosts((await response.json()) as BlogPost[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setLoadError("Could not load the posts. Please try again later.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const startEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setDraft({ title: post.title, summary: post.summary, content: post.content });
    setDraftErrors({});
    setNotice("");
    setListError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftErrors({});
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setDraftErrors({});
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (response.status === 200) {
        setEditingId(null);
        setNotice("Post updated.");
        setListError("");
        await refresh();
        return;
      }
      if (response.status === 400) {
        const body = (await response.json()) as { errors?: BlogFieldErrors };
        setDraftErrors(body.errors ?? { form: "Validation failed." });
        return;
      }
      if (response.status === 401) {
        setListError("Your session has expired. Please log in again.");
        return;
      }
      if (response.status === 404) {
        setEditingId(null);
        setListError("That post no longer exists.");
        await refresh();
        return;
      }
      setListError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setListError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this post? It will also disappear from the public blog page.")) {
      return;
    }
    setNotice("");
    setListError("");
    try {
      const response = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (response.status === 200) {
        setNotice("Post deleted.");
        await refresh();
        return;
      }
      if (response.status === 401) {
        setListError("Your session has expired. Please log in again.");
        return;
      }
      if (response.status === 404) {
        setListError("That post no longer exists.");
        await refresh();
        return;
      }
      setListError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setListError("Could not reach the server. Please try again.");
    }
  };

  if (loadError) {
    return (
      <p className={`${errorBannerClass} mt-8`}>
        {loadError}{" "}
        <Link href="/admin" className="text-accent underline">
          Go to login
        </Link>
      </p>
    );
  }

  return (
    <>
      <h2 className="type-h3 mt-10">New post</h2>
      <BlogForm onCreated={refresh} />

      <h2 className="type-h3 mt-14">
        Published posts {posts === null ? "" : `(${posts.length})`}
      </h2>

      {notice && (
        <p role="status" className={`${successBannerClass} mt-4`}>
          {notice}
        </p>
      )}
      {listError && <p className={`${errorBannerClass} mt-4`}>{listError}</p>}

      {posts === null ? (
        <p className="type-caption mt-4 font-mono">Loading posts...</p>
      ) : posts.length === 0 ? (
        <p className="type-body mt-4">No posts yet. Publish the first one above.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {posts.map((post) =>
            editingId === post.id ? (
              <li key={post.id} className="p-5">
                <p className="type-caption font-mono">
                  Editing &ldquo;{post.title}&rdquo; &mdash; slug /{post.slug}
                </p>
                <div className="mt-4 max-w-2xl space-y-4">
                  {draftErrors.form && (
                    <p className={errorBannerClass}>{draftErrors.form}</p>
                  )}
                  <div>
                    <label htmlFor={`edit-title-${post.id}`} className={labelClass}>
                      Title
                    </label>
                    <input
                      id={`edit-title-${post.id}`}
                      value={draft.title}
                      onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                      className={`${inputClass} mt-1.5 ${draftErrors.title ? "border-danger" : ""}`}
                    />
                    {draftErrors.title && (
                      <p className={fieldErrorClass}>{draftErrors.title}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`edit-summary-${post.id}`} className={labelClass}>
                      Summary
                    </label>
                    <input
                      id={`edit-summary-${post.id}`}
                      value={draft.summary}
                      onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
                      className={`${inputClass} mt-1.5 ${draftErrors.summary ? "border-danger" : ""}`}
                    />
                    {draftErrors.summary && (
                      <p className={fieldErrorClass}>{draftErrors.summary}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor={`edit-content-${post.id}`} className={labelClass}>
                      Content
                    </label>
                    <textarea
                      id={`edit-content-${post.id}`}
                      rows={8}
                      value={draft.content}
                      onChange={(e) => setDraft({ ...draft, content: e.target.value })}
                      className={`${inputClass} mt-1.5 ${draftErrors.content ? "border-danger" : ""}`}
                    />
                    {draftErrors.content && (
                      <p className={fieldErrorClass}>{draftErrors.content}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => saveEdit(post.id)}
                      disabled={saving}
                      className="text-sm font-medium text-success transition-colors hover:opacity-80"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm font-medium text-secondary transition-colors hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li key={post.id} className="flex flex-wrap items-baseline gap-x-4 gap-y-2 px-5 py-4">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="font-medium text-foreground transition-colors hover:text-accent"
                >
                  {post.title}
                </Link>
                <span className="whitespace-nowrap font-mono text-[13px] text-secondary">
                  /{post.slug}
                </span>
                <span className="ml-auto whitespace-nowrap font-mono text-[13px] text-secondary">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    dateStyle: "medium",
                  })}
                </span>
                <span className="flex w-full gap-4 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => startEdit(post)}
                    className="text-xs font-medium text-accent transition-colors hover:opacity-80"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(post.id)}
                    className="text-xs font-medium text-danger transition-colors hover:opacity-80"
                  >
                    Delete
                  </button>
                </span>
              </li>
            )
          )}
        </ul>
      )}
    </>
  );
}
