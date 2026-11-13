import type { Metadata } from "next";
import ProjectCard from "@/app/components/ProjectCard";
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

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            href={`/projects/${project.slug}`}
            number={String(index + 1).padStart(2, "0")}
            category={project.category}
            title={project.title}
            description={project.shortDescription}
            tags={project.techStack}
            video={project.video}
            className={
              // With three projects, the odd last card spans the full row
              // on tablet sizes and rejoins the grid on large screens.
              index === projects.length - 1 ? "sm:col-span-2 lg:col-span-1" : ""
            }
          />
        ))}
      </div>
    </section>
  );
}
