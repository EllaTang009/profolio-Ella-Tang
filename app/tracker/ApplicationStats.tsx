import {
  APPLICATION_STATUSES,
  type Application,
} from "@/lib/types/application";

// Color per status, reused by the stats tiles and the cards so both stay
// in sync with the design system.
export const statusStyles: Record<string, string> = {
  Applied: "border-accent/30 bg-accent/10 text-accent",
  Interviewing: "border-line bg-white/5 text-foreground",
  Offer: "border-success/25 bg-success/10 text-success",
  Rejected: "border-danger/25 bg-danger/10 text-danger",
};

// Shows the count of applications per status (plus the total) as tiles.
export default function ApplicationStats({
  applications,
}: {
  applications: Application[];
}) {
  const counts = APPLICATION_STATUSES.map((status) => ({
    status,
    count: applications.filter((entry) => entry.status === status).length,
  }));

  return (
    <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
      <div className="rounded-xl border border-line bg-surface px-4 py-4">
        <p className="font-mono text-2xl font-semibold text-foreground">
          {applications.length}
        </p>
        <p className="type-caption mt-1">Total</p>
      </div>
      {counts.map(({ status, count }) => (
        <div
          key={status}
          className={`rounded-xl border px-4 py-4 ${statusStyles[status]}`}
        >
          <p className="font-mono text-2xl font-semibold">{count}</p>
          <p className="type-caption mt-1">{status}</p>
        </div>
      ))}
    </div>
  );
}
