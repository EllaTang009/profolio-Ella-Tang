import type { Metadata } from "next";
import Link from "next/link";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Projects
      </h1>
      <p className="mt-4 text-secondary">
        A selection of academic and professional projects.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-white/20"
          >
            <span className="font-mono text-xs text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="mt-4 text-lg font-medium text-foreground">
              {project.title}
            </h2>
            <p className="mt-2 flex-1 text-sm leading-6 text-secondary">
              {project.shortDescription}
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line px-2 py-0.5 font-mono text-xs text-secondary"
                >
                  {tech}
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
}
