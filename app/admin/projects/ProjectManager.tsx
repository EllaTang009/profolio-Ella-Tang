"use client";

// ProjectManager owns everything on /admin/projects: it fetches the
// projects from GET /api/projects on mount, renders the create form, and
// gives every project an inline Edit form (PUT) and a Delete button
// (DELETE with a confirm dialog). After every successful operation the
// list is refetched from the API. The browser sends the admin session
// cookie automatically. Tech stack is entered as comma-separated text and
// split before sending; video and poster are paths under /public.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  errorBannerClass,
  fieldErrorClass,
  inputClass,
  labelClass,
  successBannerClass,
  submitButtonClass,
} from "@/app/components/formStyles";

// Local copy of the project shape: client components never import the lib
// module directly because it reads the JSON file with node "fs".
interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  shortDescription: string;
  problem: string;
  approach: string;
  result: string;
  techStack: string[];
  video?: { src: string; poster: string };
  liveUrl?: string;
  createdAt: string;
}

interface ProjectFieldErrors {
  title?: string;
  summary?: string;
  category?: string;
  techStack?: string;
  form?: string;
}

interface FormValues {
  title: string;
  category: string;
  summary: string;
  techStackText: string;
  liveUrl: string;
  videoSrc: string;
  videoPoster: string;
}

const emptyForm: FormValues = {
  title: "",
  category: "",
  summary: "",
  techStackText: "",
  liveUrl: "",
  videoSrc: "",
  videoPoster: "",
};

// Turns comma-separated text into a clean array, e.g. "Python, pandas" ->
// ["Python", "pandas"]. Empty entries are dropped; empty text -> [].
function splitTechStack(text: string): string[] {
  return text
    .split(",")
    .map((tech) => tech.trim())
    .filter((tech) => tech.length > 0);
}

function toFormValues(project: Project): FormValues {
  return {
    title: project.title,
    category: project.category,
    summary: project.shortDescription,
    techStackText: project.techStack.join(", "),
    liveUrl: project.liveUrl ?? "",
    videoSrc: project.video?.src ?? "",
    videoPoster: project.video?.poster ?? "",
  };
}

function toRequestBody(values: FormValues) {
  return {
    title: values.title,
    category: values.category,
    summary: values.summary,
    techStack: splitTechStack(values.techStackText),
    // Empty video fields mean "no video": the card and detail page then use
    // the placeholder.
    ...(values.videoSrc && values.videoPoster
      ? { video: { src: values.videoSrc, poster: values.videoPoster } }
      : { video: null }),
    ...(values.liveUrl ? { liveUrl: values.liveUrl } : { liveUrl: "" }),
  };
}

export default function ProjectManager() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [listError, setListError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [values, setValues] = useState<FormValues>(emptyForm);
  const [fieldErrors, setFieldErrors] = useState<ProjectFieldErrors>({});
  const [saving, setSaving] = useState(false);

  // Reloads the whole list from the API. Called on mount and after every
  // successful create, update, or delete.
  const refresh = useCallback(async () => {
    const response = await fetch("/api/projects");
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    setProjects((await response.json()) as Project[]);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refresh();
      } catch {
        if (!cancelled) {
          setLoadError("Could not load the projects. Please try again later.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const openCreate = () => {
    setEditing(null);
    setValues(emptyForm);
    setFormOpen(true);
    setFieldErrors({});
    setNotice("");
    setListError("");
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setValues(toFormValues(project));
    setFormOpen(true);
    setFieldErrors({});
    setNotice("");
    setListError("");
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFieldErrors({});
    setListError("");
  };

  // One submit handler for both create (no editing) and edit (editing set).
  const submitForm = async () => {
    setSaving(true);
    setFieldErrors({});
    try {
      const response = await fetch(
        editing ? `/api/projects/${editing.id}` : "/api/projects",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toRequestBody(values)),
        }
      );

      if (response.status === 201 || response.status === 200) {
        closeForm();
        setNotice(editing ? "Project updated." : "Project added.");
        await refresh();
        return;
      }
      if (response.status === 400) {
        const body = (await response.json()) as { errors?: ProjectFieldErrors };
        setFieldErrors(body.errors ?? { form: "Validation failed." });
        return;
      }
      if (response.status === 401) {
        setFieldErrors({
          form: "Your session has expired. Please log in again.",
        });
        return;
      }
      if (response.status === 404) {
        closeForm();
        setListError("That project no longer exists.");
        await refresh();
        return;
      }
      setFieldErrors({
        form: `Something went wrong (HTTP ${response.status}).`,
      });
    } catch {
      setFieldErrors({ form: "Could not reach the server. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Delete this project? It will also disappear from the public projects page.")) {
      return;
    }
    setNotice("");
    setListError("");
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (response.status === 200) {
        setNotice("Project deleted.");
        await refresh();
        return;
      }
      if (response.status === 401) {
        setListError("Your session has expired. Please log in again.");
        return;
      }
      if (response.status === 404) {
        setListError("That project no longer exists.");
        await refresh();
        return;
      }
      setListError(`Something went wrong (HTTP ${response.status}).`);
    } catch {
      setListError("Could not reach the server. Please try again.");
    }
  };

  if (loadError) {
    return (
      <p className={`${errorBannerClass} mt-8`}>
        {loadError}{" "}
        <Link href="/admin" className="text-accent underline">
          Go to login
        </Link>
      </p>
    );
  }

  const set = (field: keyof FormValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));

  return (
    <>
      {notice && (
        <p role="status" className={`${successBannerClass} mt-6`}>
          {notice}
        </p>
      )}
      {listError && <p className={`${errorBannerClass} mt-6`}>{listError}</p>}

      {formOpen ? (
        <div className="mt-8 rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 className="type-h3">
            {editing ? `Edit project — ${editing.title}` : "Add project"}
          </h2>
          <form
            className="mt-4 max-w-2xl space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              submitForm();
            }}
            noValidate
          >
            {fieldErrors.form && (
              <p className={fieldErrorClass} role="alert">
                {fieldErrors.form}
              </p>
            )}

            <div>
              <label htmlFor="proj-title" className={labelClass}>
                Title *
              </label>
              <input
                id="proj-title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                className={`${inputClass} mt-1.5 ${fieldErrors.title ? "border-danger" : ""}`}
              />
              {fieldErrors.title && (
                <p className={fieldErrorClass}>{fieldErrors.title}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="proj-category" className={labelClass}>
                  Category *
                </label>
                <input
                  id="proj-category"
                  value={values.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={`${inputClass} mt-1.5 ${fieldErrors.category ? "border-danger" : ""}`}
                />
                {fieldErrors.category && (
                  <p className={fieldErrorClass}>{fieldErrors.category}</p>
                )}
              </div>
              <div>
                <label htmlFor="proj-tech" className={labelClass}>
                  Tech stack (comma-separated)
                </label>
                <input
                  id="proj-tech"
                  value={values.techStackText}
                  onChange={(e) => set("techStackText", e.target.value)}
                  placeholder="Python, pandas, SQL"
                  className={`${inputClass} mt-1.5 ${fieldErrors.techStack ? "border-danger" : ""}`}
                />
                {fieldErrors.techStack && (
                  <p className={fieldErrorClass}>{fieldErrors.techStack}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="proj-summary" className={labelClass}>
                Summary *
              </label>
              <textarea
                id="proj-summary"
                rows={2}
                value={values.summary}
                onChange={(e) => set("summary", e.target.value)}
                className={`${inputClass} mt-1.5 ${fieldErrors.summary ? "border-danger" : ""}`}
              />
              {fieldErrors.summary && (
                <p className={fieldErrorClass}>{fieldErrors.summary}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="proj-video" className={labelClass}>
                  Video path (under /public)
                </label>
                <input
                  id="proj-video"
                  value={values.videoSrc}
                  onChange={(e) => set("videoSrc", e.target.value)}
                  placeholder="/videos/my-project.mp4"
                  className={`${inputClass} mt-1.5`}
                />
              </div>
              <div>
                <label htmlFor="proj-poster" className={labelClass}>
                  Poster path (under /public)
                </label>
                <input
                  id="proj-poster"
                  value={values.videoPoster}
                  onChange={(e) => set("videoPoster", e.target.value)}
                  placeholder="/videos/my-project-poster.jpg"
                  className={`${inputClass} mt-1.5`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="proj-live" className={labelClass}>
                Live link (optional)
              </label>
              <input
                id="proj-live"
                value={values.liveUrl}
                onChange={(e) => set("liveUrl", e.target.value)}
                placeholder="https://..."
                className={`${inputClass} mt-1.5`}
              />
            </div>

            <div className="flex items-center gap-4">
              <button type="submit" disabled={saving} className={submitButtonClass}>
                {saving ? "Saving..." : "Save project"}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="text-sm font-medium text-secondary transition-colors hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={openCreate}
          className="mt-8 inline-flex h-10 items-center rounded-full bg-accent px-5 text-sm font-semibold text-white transition-colors hover:opacity-90"
        >
          + Add project
        </button>
      )}

      <h2 className="type-h3 mt-10">
        Projects {projects === null ? "" : `(${projects.length})`}
      </h2>

      {projects === null ? (
        <p className="type-caption mt-4 font-mono">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center">
          <p className="type-body">No projects yet.</p>
          <p className="type-caption mt-2">
            Use the button above to add the first one.
          </p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
          {projects.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-baseline gap-x-4 gap-y-2 px-5 py-4"
            >
              <Link
                href={`/projects/${project.slug}`}
                className="font-medium text-foreground transition-colors hover:text-accent"
              >
                {project.title}
              </Link>
              <span className="whitespace-nowrap font-mono text-[13px] text-secondary">
                /{project.slug}
              </span>
              <span className="whitespace-nowrap font-mono text-[13px] text-secondary">
                {project.category}
              </span>
              <span className="ml-auto flex gap-4">
                <button
                  type="button"
                  onClick={() => openEdit(project)}
                  className="text-xs font-medium text-accent transition-colors hover:opacity-80"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(project.id)}
                  className="text-xs font-medium text-danger transition-colors hover:opacity-80"
                >
                  Delete
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
