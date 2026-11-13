"use client";

import { deleteSubmissionAction } from "./actions";

// Client component so the browser confirm dialog can cancel the submit
// before the server action runs. The row's submission id travels in the
// hidden input and is read from FormData by the server action.
export default function DeleteButton({ id }: { id: string }) {
  return (
    <form
      action={deleteSubmissionAction}
      onSubmit={(event) => {
        if (!window.confirm("Delete this submission?")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-medium text-red-600 transition-colors hover:text-red-500"
      >
        Delete
      </button>
    </form>
  );
}
