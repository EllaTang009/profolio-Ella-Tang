"use client";

import { statusStyles } from "./ApplicationStats";

// Local copy of the application shape: client components never import the
// lib module directly because it reads the JSON file with node "fs".
interface Application {
  id: string;
  company: string;
  role: string;
  location: string;
  status: string;
  appliedDate: string;
  link: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Shows one application as a card. All data and actions arrive through
// props from ApplicationTracker; the card itself makes no API calls.
export default function ApplicationCard({
  application,
  onEdit,
  onDelete,
}: {
  application: Application;
  onEdit: (application: Application) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <article className="rounded-xl border border-line bg-surface p-5 transition-colors hover:bg-white/5">
      <div className="flex flex-wrap items-start gap-x-3 gap-y-2">
        <h3 className="type-body font-semibold text-foreground">
          {application.company}
        </h3>
        <span className="text-secondary">·</span>
        <p className="type-body text-secondary">{application.role}</p>
        <span
          className={`ml-auto inline-block whitespace-nowrap rounded-md border px-2 py-0.5 font-mono text-[13px] ${
            statusStyles[application.status] ?? statusStyles.Interviewing
          }`}
        >
          {application.status}
        </span>
      </div>

      <div className="type-caption mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
        {application.location && <span>{application.location}</span>}
        <span>
          Applied{" "}
          {new Date(application.appliedDate).toLocaleDateString("en-US", {
            dateStyle: "medium",
          })}
        </span>
        {application.link && (
          <a
            href={application.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:opacity-80"
          >
            Job posting &rarr;
          </a>
        )}
      </div>

      {application.notes && (
        <p className="mt-3 text-sm text-secondary">{application.notes}</p>
      )}

      <p className="type-caption mt-3 font-mono">
        Updated{" "}
        {new Date(application.updatedAt).toLocaleDateString("en-US", {
          dateStyle: "medium",
        })}
      </p>

      <div className="mt-4 flex gap-4">
        <button
          type="button"
          onClick={() => onEdit(application)}
          className="text-xs font-medium text-accent transition-colors hover:opacity-80"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(application.id)}
          className="text-xs font-medium text-danger transition-colors hover:opacity-80"
        >
          Delete
        </button>
      </div>
    </article>
  );
}
