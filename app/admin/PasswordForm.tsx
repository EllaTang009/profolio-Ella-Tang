"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginFormState } from "./actions";

const initialState: LoginFormState = {};

export default function PasswordForm() {
  // Same useActionState pattern as the server-action contact form:
  // submit the password, and let the server action decide the result.
  const [state, formAction, isPending] = useActionState(
    loginAdmin,
    initialState
  );

  return (
    <form action={formAction} className="mt-8 max-w-sm space-y-5" noValidate>
      {state.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-900"
        >
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 ${
            state.error ? "border-red-400" : ""
          }`}
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-11 items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
