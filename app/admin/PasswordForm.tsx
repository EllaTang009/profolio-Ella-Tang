"use client";

import { useActionState } from "react";
import { loginAdmin, type LoginFormState } from "./actions";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  submitButtonClass,
} from "@/app/components/formStyles";

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
      {state.error && <p className={errorBannerClass}>{state.error}</p>}
      <div>
        <label htmlFor="password" className={labelClass}>
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={`mt-1.5 ${inputClass} ${
            state.error ? "border-danger" : ""
          }`}
        />
        {state.error && <p className={fieldErrorClass}>{state.error}</p>}
      </div>
      <button type="submit" disabled={isPending} className={submitButtonClass}>
        {isPending ? "Checking..." : "Unlock"}
      </button>
    </form>
  );
}
