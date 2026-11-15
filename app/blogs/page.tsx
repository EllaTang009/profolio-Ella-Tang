import type { Metadata } from "next";
import BlogList from "./BlogList";

export const metadata: Metadata = {
  title: "Blog",
};

export default function Blog() {
  return (
    <section className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Blog</h1>
      <p className="type-body mt-4">
        Short notes on data, development, and building things.
      </p>
      <BlogList />
    </section>
  );
}
