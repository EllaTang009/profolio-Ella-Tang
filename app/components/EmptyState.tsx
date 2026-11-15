// The dashed-border empty-state box shared by the admin managers
// (submissions, tracker, projects). Children are the message lines.
export default function EmptyState({
  children,
  className = "mt-4",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className} rounded-xl border border-dashed border-line bg-surface px-6 py-16 text-center`}
    >
      {children}
    </div>
  );
}
