"use client";

import { useActionState } from "react";
import { submitContact, type ContactFormState } from "./actions";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  submitButtonClass,
  successBannerClass,
} from "../components/formStyles";

const initialState: ContactFormState = { status: "idle", errors: {} };

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
        <p role="status" className={successBannerClass}>
          Thank you, your message has been sent! I&apos;ll get back to you soon.
        </p>
      )}

      {state.errors.form && (
        <p className={errorBannerClass}>{state.errors.form}</p>
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
            state.errors.name ? "border-danger" : ""
          }`}
        />
        {state.errors.name && (
          <p className={fieldErrorClass}>{state.errors.name}</p>
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
            state.errors.email ? "border-danger" : ""
          }`}
        />
        {state.errors.email && (
          <p className={fieldErrorClass}>{state.errors.email}</p>
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
            state.errors.message ? "border-danger" : ""
          }`}
        />
        {state.errors.message && (
          <p className={fieldErrorClass}>{state.errors.message}</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className={submitButtonClass}>
        {isPending ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
}
