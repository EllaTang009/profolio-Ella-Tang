export interface ContactInput {
  name: string;
  email: string;
  message: string;
}

export interface ContactFieldErrors {
  name?: string;
  email?: string;
  message?: string;
}

// Field errors plus an optional form-level message for problems that are
// not tied to one field (malformed JSON, save failures, network errors).
export type ContactFormErrors = ContactFieldErrors & { form?: string };

// Single source of truth for contact-form validation, shared by the
// server action and the API route. Expects already-trimmed values.
export function validateContact(input: ContactInput): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  if (!input.name) {
    errors.name = "Please enter your name.";
  }
  if (!isValidEmail(input.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!input.message) {
    errors.message = "Please enter a message.";
  }
  return errors;
}

function isValidEmail(email: string): boolean {
  // Must contain exactly one @.
  if (email.split("@").length - 1 !== 1) {
    return false;
  }
  const local = email.split("@")[0];
  const domain = email.split("@")[1];
  // Nonblank text before the @.
  if (local.length === 0) {
    return false;
  }
  // Domain must contain a dot, and every dot-separated label must be
  // nonblank — a@b, a@b..com, and a@.com all fail.
  if (!domain.includes(".")) {
    return false;
  }
  if (domain.split(".").some((label) => label.length === 0)) {
    return false;
  }
  // No whitespace anywhere in the address (e.g. a b@c.com fails).
  if (/\s/.test(email)) {
    return false;
  }
  return true;
}
