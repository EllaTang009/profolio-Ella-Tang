import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Home",
};

export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
        Hi, I&apos;m <span className="text-indigo-600">Ella Tang</span>
      </h1>
      <p className="mt-5 text-lg font-medium text-zinc-600 sm:text-xl">
        Information Systems Graduate Student | Data Analytics &amp; Web
        Development
      </p>
      <p className="mt-6 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
        I&apos;m pursuing a Master of Information Systems at Santa Clara
        University. With a background in Big 4 audit and years of running my
        own businesses, I combine data analysis with hands-on operations
        experience to solve real problems.
      </p>
      <Link
        href="/about-me"
        className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-indigo-600 px-8 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
      >
        Learn More About Me
      </Link>
    </section>
  );
}
