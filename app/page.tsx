import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

const facts = [
  { value: "Big 4", label: "KPMG audit experience" },
  { value: "1M", label: "followers grown in 4 months" },
  { value: "13", label: "rubrics evaluated by my Roblox AI agent" },
];

export default function Home() {
  return (
    <section className="hero-glow flex flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6">
        <h1 className="type-hero">Ella Tang</h1>
        <p className="type-caption mt-5 font-mono">
          Information Systems &middot; Data Analytics &middot; Web Development
        </p>
        <p className="type-body mt-8">
          I&apos;m pursuing a Master of Information Systems at Santa Clara
          University. With a background in Big 4 audit and years of running my
          own businesses, I combine data analysis with hands-on operations
          experience to solve real problems.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/about-me"
            className="btn-primary inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
          >
            About Me
          </Link>
          <Link
            href="/projects"
            className="btn-secondary inline-flex h-11 items-center justify-center px-6 text-sm font-medium"
          >
            Projects
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-4 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {facts.map((fact) => (
          <div
            key={fact.value}
            className="rounded-xl border border-line bg-surface p-6 text-center transition-colors hover:border-white/20"
          >
            <p className="text-3xl font-medium tracking-tight text-accent sm:text-4xl">
              {fact.value}
            </p>
            <p className="type-caption mt-2">{fact.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
