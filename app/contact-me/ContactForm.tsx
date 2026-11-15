"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ContactFormErrors } from "@/lib/validation";
import { loadDraft, saveDraft, clearDraft } from "@/lib/draftStorage";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  submitButtonClass,
  successBannerClass,
} from "@/app/components/formStyles";

// Unlike /contact-me-server-form (which submits through a server action with
// useActionState), this form is a plain client component that sends the data
// itself with fetch() as a JSON POST to the /api/contact route handler and
// interprets the HTTP response (201 success / 400 errors) in the browser.
//
// The form also autosaves an unsent draft to localStorage (see
// lib/draftStorage.ts — the only module that touches storage):
//
//   SAVE FLOW:  user input -> onChange updates React state -> the state
//   effect below debounces 500ms -> saveDraft() serializes with
//   JSON.stringify -> stored under "contact-draft-v1" -> "Draft saved"
//   indicator shows the time.
//
//   LOAD FLOW:  on mount -> loadDraft() reads -> JSON.parse -> validate
//   shape -> values go into state (fields fill in) -> the "Restored your
//   unsent draft" message displays the saved time.
//
// A successful 201 submission clears both the stored draft and the fields;
// a failed submission keeps the draft so nothing is lost.
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ContactFormErrors>({});
  // Time of the last autosave (for the "Draft saved" indicator) and of the
  // restored draft (for the restore message). Null = nothing to show.
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null);
  const [restoredAt, setRestoredAt] = useState<string | null>(null);
  // False until the load effect has run, so the save effect never wipes the
  // stored draft with the initial empty state before it was restored.
  const hydratedRef = useRef(false);

  // LOAD FLOW (runs once on mount): load -> parse -> validate -> state.
  // loadDraft() returns null for a missing, corrupt, or non-string-shaped
  // entry, and storage errors never throw here. The work runs in a timer
  // callback (not synchronously in the effect body) per the React Compiler
  // lint rules, right after the first paint.
  useEffect(() => {
    const timer = setTimeout(() => {
      const draft = loadDraft();
      if (draft && (draft.name || draft.email || draft.message)) {
        // validate -> state: fill the fields with the saved values.
        setName(draft.name);
        setEmail(draft.email);
        setMessage(draft.message);
        // state -> display: remember when it was saved for the message.
        setRestoredAt(draft.savedAt || new Date().toISOString());
      }
      hydratedRef.current = true;
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // SAVE FLOW (runs after every keystroke): state -> debounce 500ms ->
  // serialize -> store. The cleanup clears the pending timer each time the
  // state changes, so only the final value after 500ms of quiet is saved.
  useEffect(() => {
    if (!hydratedRef.current) {
      return;
    }
    const timer = setTimeout(() => {
      if (!name && !email && !message) {
        // Don't save an empty draft; if one exists, remove it so a refresh
        // doesn't resurrect blank text.
        clearDraft();
        setDraftSavedAt(null);
        return;
      }
      // serialize (JSON.stringify inside saveDraft) -> store. If storage is
      // blocked, saveDraft returns false and the indicator simply stays off.
      if (saveDraft({ name, email, message })) {
        setDraftSavedAt(new Date().toISOString());
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [name, email, message]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSending(true);
    setSuccess(false);
    setErrors({});
    try {
      // Send the form data as a JSON body to the API route.
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      // Parse the response body defensively: an unexpected non-JSON response
      // (proxy error page, crash, etc.) must not crash the form silently.
      let body: { errors?: ContactFormErrors } = {};
      try {
        body = await response.json();
      } catch {
        // Leave body empty; the status-based fallback below reports it.
      }

      if (response.status === 201) {
        // 201: the entry was saved — show the success message, clear the
        // fields, and clear the draft (nothing left to restore). The save
        // effect also re-clears storage because the fields are now empty.
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
        clearDraft();
        setDraftSavedAt(null);
        setRestoredAt(null);
      } else {
        // 400: field-specific errors; any other failure: a visible fallback.
        // The draft is intentionally kept so nothing the visitor typed is lost.
        setErrors(
          body.errors && Object.keys(body.errors).length > 0
            ? body.errors
            : {
                form: `Something went wrong (HTTP ${response.status}). Please try again.`,
              }
        );
      }
    } catch {
      // fetch() only rejects on network failures (server unreachable, etc.).
      // The draft is kept here too.
      setErrors({ form: "Could not reach the server. Please try again." });
    } finally {
      setSending(false);
    }
  }

  // "Clear draft" button on the restore message: remove the stored draft and
  // the restored values so the form starts empty again.
  function handleClearDraft() {
    clearDraft();
    setName("");
    setEmail("");
    setMessage("");
    setRestoredAt(null);
    setDraftSavedAt(null);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      {success && (
        <p role="status" className={successBannerClass}>
          Thank you, your message has been sent! I&apos;ll get back to you soon.
        </p>
      )}

      {errors.form && <p className={errorBannerClass}>{errors.form}</p>}

      {restoredAt && (
        <p className="flex flex-wrap items-center gap-x-3 rounded-lg border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
          <span>
            Restored your unsent draft from{" "}
            {new Date(restoredAt).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
            .
          </span>
          <button
            type="button"
            onClick={handleClearDraft}
            className="text-xs font-medium text-danger transition-colors hover:opacity-80"
          >
            Clear draft
          </button>
        </p>
      )}

      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-invalid={Boolean(errors.name)}
          className={`mt-1.5 ${inputClass} ${
            errors.name ? "border-danger" : ""
          }`}
        />
        {errors.name && <p className={fieldErrorClass}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-invalid={Boolean(errors.email)}
          className={`mt-1.5 ${inputClass} ${
            errors.email ? "border-danger" : ""
          }`}
        />
        {errors.email && <p className={fieldErrorClass}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          aria-invalid={Boolean(errors.message)}
          className={`mt-1.5 ${inputClass} ${
            errors.message ? "border-danger" : ""
          }`}
        />
        {errors.message && <p className={fieldErrorClass}>{errors.message}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={sending} className={submitButtonClass}>
          {sending ? "Sending..." : "Send Message"}
        </button>
        {draftSavedAt && (
          <span className="font-mono text-[13px] text-secondary">
            Draft saved ·{" "}
            {new Date(draftSavedAt).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>
    </form>
  );
}
