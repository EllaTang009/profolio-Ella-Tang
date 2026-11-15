"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  submitButtonClass,
  successBannerClass,
} from "@/app/components/formStyles";

interface BlogFieldErrors {
  title?: string;
  summary?: string;
  content?: string;
  form?: string;
}

// Creates a blog post by POSTing JSON to /api/blogs. Field errors from a
// 400 response are shown under each field; a 201 clears the form, shows
// the success message, and refreshes the server-rendered list.
export default function BlogForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<BlogFieldErrors>({});

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setSuccess(false);
    setErrors({});
    try {
      const response = await fetch("/api/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, summary, content }),
      });

      let body: { errors?: BlogFieldErrors; post?: unknown } = {};
      try {
        body = await response.json();
      } catch {
        // Leave body empty; the status-based fallback below reports it.
      }

      if (response.status === 201) {
        setSuccess(true);
        setTitle("");
        setSummary("");
        setContent("");
        // Re-render the server component list with the new post.
        router.refresh();
      } else {
        setErrors(
          body.errors && Object.keys(body.errors).length > 0
            ? body.errors
            : {
                form: `Something went wrong (HTTP ${response.status}). Please try again.`,
              }
        );
      }
    } catch {
      setErrors({ form: "Could not reach the server. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-2xl space-y-5" noValidate>
      {success && (
        <p role="status" className={successBannerClass}>
          Post published! It is now listed on the blog page.
        </p>
      )}

      {errors.form && <p className={errorBannerClass}>{errors.form}</p>}

      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={Boolean(errors.title)}
          className={`mt-1.5 w-full ${inputClass} ${
            errors.title ? "border-danger" : ""
          }`}
        />
        {errors.title && <p className={fieldErrorClass}>{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="summary" className={labelClass}>
          Summary
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          required
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          aria-invalid={Boolean(errors.summary)}
          className={`mt-1.5 w-full ${inputClass} ${
            errors.summary ? "border-danger" : ""
          }`}
        />
        {errors.summary && <p className={fieldErrorClass}>{errors.summary}</p>}
      </div>

      <div>
        <label htmlFor="content" className={labelClass}>
          Content
        </label>
        <textarea
          id="content"
          name="content"
          rows={8}
          required
          value={content}
          onChange={(event) => setContent(event.target.value)}
          aria-invalid={Boolean(errors.content)}
          className={`mt-1.5 w-full ${inputClass} ${
            errors.content ? "border-danger" : ""
          }`}
        />
        {errors.content && <p className={fieldErrorClass}>{errors.content}</p>}
      </div>

      <button type="submit" disabled={sending} className={submitButtonClass}>
        {sending ? "Publishing..." : "Publish Post"}
      </button>
    </form>
  );
}
