"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "./actions";

const initialState: ContactFormState = { status: "idle", errors: {} };

const inputClass =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";
const labelClass = "block text-sm font-medium text-zinc-900";

export default function ContactForm() {
  // useActionState connects the form to the server action: it passes the
  // previous state + FormData to the action and stores whatever it returns.
  const [state, formAction, isPending] = useActionState(
    submitContact,
    initialState
  );

  return (
    // Changing the key on success remounts the form, which clears the fields.
    <form
      key={state.status === "success" ? "submitted" : "editing"}
      action={formAction}
      className="mt-8 space-y-5"
      noValidate
    >
      {state.status === "success" && (
        <p
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
        >
          Thank you, your message has been sent! I&apos;ll get back to you
          soon.
        </p>
      )}

      {state.errors.form && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.errors.form}
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
          aria-invalid={Boolean(state.errors.name)}
          className={`mt-1.5 ${inputClass} ${
            state.errors.name ? "border-red-400" : ""
          }`}
        />
        {state.errors.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name}</p>
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
          aria-invalid={Boolean(state.errors.email)}
          className={`mt-1.5 ${inputClass} ${
            state.errors.email ? "border-red-400" : ""
          }`}
        />
        {state.errors.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email}</p>
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
          aria-invalid={Boolean(state.errors.message)}
          className={`mt-1.5 ${inputClass} ${
            state.errors.message ? "border-red-400" : ""
          }`}
        />
        {state.errors.message && (
          <p className="mt-1 text-sm text-red-600">{state.errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
