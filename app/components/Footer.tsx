export default function Footer() {
  return (
    <footer className="border-t border-line bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-secondary sm:flex-row sm:px-6">
        <p>&copy; 2026 Ella Tang. All rights reserved.</p>
        <p className="font-mono text-xs">
          Information Systems &middot; Santa Clara University
        </p>
      </div>
    </footer>
  );
}
