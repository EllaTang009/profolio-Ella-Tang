import type { Metadata } from "next";
import ProjectList from "./ProjectList";

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
      <ProjectList />
    </section>
  );
}
