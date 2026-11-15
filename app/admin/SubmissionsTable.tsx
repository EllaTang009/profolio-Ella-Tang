"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  successBannerClass,
} from "@/app/components/formStyles";

interface Submission {
  id: string;
  name: string;
  email: string;
  message: string;
  submittedAt: string;
  source?: string;
}

// Loads the submissions from GET /api/contact and performs edits/deletes
// through PUT and DELETE /api/contact/[id] (admin-only endpoints, so the
// browser sends the admin session cookie automatically).
export default function SubmissionsTable() {
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [rowError, setRowError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: "", email: "", message: "" });
  const [draftErrors, setDraftErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/contact");
        if (cancelled) {
          return;
        }
        if (response.status === 401) {
          setLoadError("Your session has expired. Please log in again.");
          return;
        }
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Submission[];
        if (!cancelled) {
          setRows(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load the submissions. Please try again later.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startEdit = (row: Submission) => {
    setEditingId(row.id);
    setDraft({ name: row.name, email: row.email, message: row.message });
    setDraftErrors({});
    setNotice("");
    setRowError("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraftErrors({});
  };

  const saveEdit = async (id: string) => {
    setDraftErrors({});
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (response.status === 200) {
        const updated = (await response.json()) as Submission;
        setRows((current) =>
          current
            ? current.map((row) => (row.id === id ? updated : row))
            : current
        );
        setEditingId(null);
        setNotice("Submission updated.");
        setRowError("");
        return;
      }
      if (response.status === 400) {
        const body = (await response.json()) as { errors?: Record<string, string> };
        setDraftErrors(body.errors ?? { form: "Validation failed." });
        return;
      }
      if (response.status === 404) {
        setRows((current) => (current ? current.filter((row) => row.id !== id) : current));
        setEditingId(null);
        setRowError("That submission no longer exists.");
        return;
      }
      setRowError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setRowError("Could not reach the server. Please try again.");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this submission?")) {
      return;
    }
    try {
      const response = await fetch(`/api/contact/${id}`, { method: "DELETE" });
      if (response.status === 200) {
        setRows((current) => (current ? current.filter((row) => row.id !== id) : current));
        setNotice("Submission deleted.");
        setRowError("");
        return;
      }
      if (response.status === 404) {
        setRows((current) => (current ? current.filter((row) => row.id !== id) : current));
        setRowError("That submission no longer exists.");
        return;
      }
      setRowError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setRowError("Could not reach the server. Please try again.");
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

  if (rows === null) {
    return <p className="type-caption mt-8 font-mono">Loading submissions...</p>;
  }

  if (rows.length === 0) {
    return (
      <div className="mt-8 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="type-body">No submissions yet.</p>
        <p className="type-caption mt-2">
          Messages sent from the{" "}
          <Link
            href="/contact-me-server-form"
            className="text-accent hover:opacity-80"
          >
            server action form
          </Link>{" "}
          or the{" "}
          <Link href="/contact-me" className="text-accent hover:opacity-80">
            API form
          </Link>{" "}
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {notice && (
        <p role="status" className={`${successBannerClass} mt-6`}>
          {notice}
        </p>
      )}
      {rowError && <p className={`${errorBannerClass} mt-6`}>{rowError}</p>}

      <div className="mt-4 overflow-x-auto rounded-xl border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-white/5 font-mono text-[13px] uppercase tracking-wider text-secondary">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) =>
              editingId === row.id ? (
                <tr key={row.id} className="align-top">
                  <td className="px-4 py-3">
                    <input
                      aria-label="Name"
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      className={`${inputClass} w-36 ${draftErrors.name ? "border-danger" : ""}`}
                    />
                    {draftErrors.name && (
                      <p className={fieldErrorClass}>{draftErrors.name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      aria-label="Email"
                      value={draft.email}
                      onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                      className={`${inputClass} w-44 ${draftErrors.email ? "border-danger" : ""}`}
                    />
                    {draftErrors.email && (
                      <p className={fieldErrorClass}>{draftErrors.email}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <textarea
                      aria-label="Message"
                      rows={3}
                      value={draft.message}
                      onChange={(e) => setDraft({ ...draft, message: e.target.value })}
                      className={`${inputClass} max-w-xs ${draftErrors.message ? "border-danger" : ""}`}
                    />
                    {draftErrors.message && (
                      <p className={fieldErrorClass}>{draftErrors.message}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-secondary">{row.source ?? "—"}</td>
                  <td className="px-4 py-3 text-secondary">
                    {new Date(row.submittedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(row.id)}
                        className="text-xs font-medium text-success transition-colors hover:opacity-80"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-xs font-medium text-secondary transition-colors hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={row.id} className="align-top hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-secondary">{row.email}</td>
                  <td className="max-w-xs px-4 py-3 text-secondary">
                    {row.message}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block whitespace-nowrap rounded-md border border-line px-2 py-0.5 font-mono text-[13px] text-accent">
                      {row.source ?? "—"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 type-caption font-mono">
                    {new Date(row.submittedAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="text-xs font-medium text-accent transition-colors hover:opacity-80"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(row.id)}
                        className="text-xs font-medium text-danger transition-colors hover:opacity-80"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
