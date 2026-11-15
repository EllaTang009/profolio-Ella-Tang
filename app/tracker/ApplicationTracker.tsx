"use client";

// ApplicationTracker is the parent client component for /tracker.
//
// Data flow: ALL data is fetched from the API thisthis component holds the
// list in React state (loaded from GET /api/applications, refetched after
// every create, update, and delete). It never touches the JSON file
// directly; the child components are pure presentational pieces that
// receive everything through props:
//   - ApplicationStats gets the list to show counts per status.
//   - ApplicationCard gets one application plus onEdit/onDelete callbacks.
//   - ApplicationForm gets the initial values (empty for create, the
//     application being edited for edit) plus onSubmit/onCancel callbacks.
// The browser sends the admin session cookie automatically, so no auth
// token handling is needed here.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type {
  Application,
  ApplicationFormErrors,
} from "@/lib/types/application";
import Notice from "@/app/components/Notice";
import EmptyState from "@/app/components/EmptyState";
import ApplicationStats from "./ApplicationStats";
import ApplicationCard from "./ApplicationCard";
import ApplicationForm, {
  type ApplicationFormValues,
} from "./ApplicationForm";

const emptyForm: ApplicationFormValues = {
  company: "",
  role: "",
  location: "",
  status: "Applied",
  appliedDate: "",
  link: "",
  notes: "",
};

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ApplicationFormErrors>({});
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Application | null>(null);
  const [saving, setSaving] = useState(false);

  // Reloads the whole list from the API. Called on mount and after every
  // successful create, update, or delete.
  const refresh = useCallback(async () => {
    const response = await fetch("/api/applications");
    if (response.status === 401) {
      setLoadError("Your session has expired. Please log in again.");
      return;
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setApplications((await response.json()) as Application[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setLoadError("Could not load the applications. Please try again later.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
    setFieldErrors({});
    setFormError("");
    setNotice("");
  };

  const openEdit = (application: Application) => {
    setEditing(application);
    setFormOpen(true);
    setFieldErrors({});
    setFormError("");
    setNotice("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFieldErrors({});
    setFormError("");
  };

  // One submit handler for both create (no editing) and edit (editing set).
  const submitForm = async (values: ApplicationFormValues) => {
    setSaving(true);
    setFieldErrors({});
    setFormError("");
    try {
      const response = await fetch(
        editing ? `/api/applications/${editing.id}` : "/api/applications",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        }
      );

      if (response.status === 201 || response.status === 200) {
        closeForm();
        setNotice(editing ? "Application updated." : "Application added.");
        await refresh();
        return;
      }
      if (response.status === 400) {
        const body = (await response.json()) as { errors?: ApplicationFormErrors };
        setFieldErrors(body.errors ?? { form: "Validation failed." });
        return;
      }
      if (response.status === 401) {
        setFormError("Your session has expired. Please log in again.");
        return;
      }
      if (response.status === 404) {
        closeForm();
        setFormError("That application no longer exists.");
        await refresh();
        return;
      }
      setFormError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this application?")) {
      return;
    }
    setNotice("");
    setFormError("");
    try {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        setNotice("Application deleted.");
        await refresh();
        return;
      }
      if (response.status === 401) {
        setFormError("Your session has expired. Please log in again.");
        return;
      }
      if (response.status === 404) {
        setFormError("That application no longer exists.");
        await refresh();
        return;
      }
      setFormError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setFormError("Could not reach the server. Please try again.");
    }
  };

  if (loadError) {
    return (
      <Notice kind="error" className="mt-8">
        {loadError}{" "}
        <Link href="/admin" className="text-accent underline">
          Go to login
        </Link>
      </Notice>
    );
  }

  if (applications === null) {
    return <p className="type-caption mt-8 font-mono">Loading applications...</p>;
  }

  return (
    <>
      {notice && (
        <Notice kind="success" className="mt-6">
          {notice}
        </Notice>
      )}
      {formError && <Notice kind="error" className="mt-6">{formError}</Notice>}

      <ApplicationStats applications={applications} />

      {formOpen ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="type-h3">
            {editing
              ? `Edit application — ${editing.company}`
              : "Add application"}
          </h2>
          <div className="mt-4">
            <ApplicationForm
              key={editing?.id ?? "new"}
              initial={editing ?? emptyForm}
              errors={fieldErrors}
              saving={saving}
              onSubmit={submitForm}
              onCancel={closeForm}
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openCreate}
          className="mt-8 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          + Add application
        </button>
      )}

      <h2 className="type-h3 mt-10">
        Applications ({applications.length})
      </h2>

      {applications.length === 0 ? (
        <EmptyState>
          <p className="type-body">No applications yet.</p>
          <p className="type-caption mt-2">
            Use the button above to add the first one.
          </p>
        </EmptyState>
      ) : (
        <ul className="mt-4 space-y-3">
          {applications.map((application) => (
            <li key={application.id}>
              <ApplicationCard
                application={application}
                onEdit={openEdit}
                onDelete={remove}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
