// The only module that touches localStorage for the contact form draft.
// Every call is wrapped in try/catch: private browsing or blocked storage
// throws, and the form must keep working without a draft.

export interface ContactDraft {
  name: string;
  email: string;
  message: string;
  savedAt: string;
}

const DRAFT_KEY = "contact-draft-v1";

// Load flow: read -> parse -> validate -> return.
export function loadDraft(): ContactDraft | null {
  try {
    // Step 1: read. A missing key returns null (nothing saved yet).
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }

    // Step 2: parse. Broken JSON removes the bad entry and returns null.
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }

    // Step 3: validate. The value must be an object with string name,
    // email, and message; anything else is treated as corrupt.
    if (
      parsed === null ||
      typeof parsed !== "object" ||
      typeof (parsed as ContactDraft).name !== "string" ||
      typeof (parsed as ContactDraft).email !== "string" ||
      typeof (parsed as ContactDraft).message !== "string"
    ) {
      window.localStorage.removeItem(DRAFT_KEY);
      return null;
    }

    const draft = parsed as ContactDraft;
    return {
      name: draft.name,
      email: draft.email,
      message: draft.message,
      savedAt: typeof draft.savedAt === "string" ? draft.savedAt : "",
    };
  } catch {
    // Storage unavailable (private browsing, blocked, etc.): no draft.
    return null;
  }
}

// Save flow: serialize -> store. Returns false when storage is unavailable.
export function saveDraft(draft: {
  name: string;
  email: string;
  message: string;
}): boolean {
  const withTime: ContactDraft = { ...draft, savedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(DRAFT_KEY, JSON.stringify(withTime));
    return true;
  } catch {
    return false;
  }
}

// Removes the draft (after a successful send or a "Clear draft" click).
export function clearDraft(): void {
  try {
    window.localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable: nothing to remove, the form keeps working.
  }
}
