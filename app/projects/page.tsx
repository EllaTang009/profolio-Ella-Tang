import type { Metadata } from "next";
import Link from "next/link";
import HoverVideo from "@/app/components/HoverVideo";
import { projects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
};

export default function Projects() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Projects</h1>
      <p className="type-body mt-4">
        A selection of academic and professional projects.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {projects.map((project, index) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group flex flex-col rounded-xl border border-line bg-surface p-6 transition-colors hover:border-white/20"
          >
            {project.video && (
              <HoverVideo
                src={project.video.src}
                poster={project.video.poster}
                label={`${project.title} preview`}
                className="aspect-[16/10] w-full rounded-lg border border-line object-cover"
              />
            )}
            <span className="mt-5 font-mono text-[13px] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h2 className="type-h3 mt-4">{project.title}</h2>
            <p className="type-body mt-2 flex-1">{project.shortDescription}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-md border border-line px-2 py-0.5 font-mono text-[13px] text-secondary"
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
