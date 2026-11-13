"use client";

import { useState, type FormEvent } from "react";

// Unlike /contact-me-server-form (which submits through a server action with
// useActionState), this form is a plain client component that sends the data
// itself with fetch() as a JSON POST to the /api/contact route handler and
// interprets the HTTP response (201 success / 400 errors) in the browser.
const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const labelClass = "block text-sm font-medium text-zinc-900";

interface FieldErrors {
  name?: string;
  email?: string;
  message?: string;
  form?: string;
}

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

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
      let body: { errors?: FieldErrors } = {};
      try {
        body = await response.json();
      } catch {
        // Leave body empty; the status-based fallback below reports it.
      }

      if (response.status === 201) {
        // 201: the entry was saved — show the success message and clear the fields.
        setSuccess(true);
        setName("");
        setEmail("");
        setMessage("");
      } else {
        // 400: field-specific errors; any other failure: a visible fallback.
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
      setErrors({ form: "Could not reach the server. Please try again." });
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      {success && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          Thank you, your message has been sent! I&apos;ll get back to you soon.
        </p>
      )}

      {errors.form && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errors.form}
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
            errors.name ? "border-red-400" : ""
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
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
            errors.email ? "border-red-400" : ""
          }`}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
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
            errors.message ? "border-red-400" : ""
          }`}
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={sending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {sending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
