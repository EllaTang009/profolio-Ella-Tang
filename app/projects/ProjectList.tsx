"use client";

// Loads the projects from GET /api/projects and renders each one through
// the reusable ProjectCard (same props as before, so the hover video
// behavior is untouched). A project without a working video falls back to
// the placeholder inside ProjectCard.

import { useEffect, useState } from "react";
import ProjectCard from "@/app/components/ProjectCard";
import type { Project } from "@/lib/types/project";
import { errorBannerClass } from "@/app/components/formStyles";

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("/api/projects");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = (await response.json()) as Project[];
        if (!cancelled) {
          setProjects(data);
        }
      } catch {
        if (!cancelled) {
          setLoadError("Could not load the projects. Please try again later.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return <p className={`${errorBannerClass} mt-8`}>{loadError}</p>;
  }

  if (projects === null) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-xl border border-line bg-surface"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          href={`/projects/${project.slug}`}
          number={String(index + 1).padStart(2, "0")}
          category={project.category}
          title={project.title}
          description={project.shortDescription}
          tags={project.techStack}
          video={project.video}
          className={
            // With an odd last card, it spans the full row on tablet sizes
            // and rejoins the grid on large screens.
            index === projects.length - 1 && projects.length % 2 === 1
              ? "sm:col-span-2 lg:col-span-1"
              : ""
          }
        />
      ))}
    </div>
  );
}
