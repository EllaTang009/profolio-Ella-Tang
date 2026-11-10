import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
        Projects
      </h1>
      <p className="mt-4 text-zinc-600">
        A selection of academic and professional projects.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
          >
            <h2 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600">
              {project.title}
            </h2>
            <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">
              {project.shortDescription}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
                >
                  {tech}
                </li>
              ))}
            </ul>
            <span className="mt-5 text-sm font-medium text-indigo-600">
              View details &rarr;
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
