import type { Metadata } from "next";
import Link from "next/link";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact (API)",
};

export default function Contact() {
  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">
        Contact
      </h1>
      <p className="mt-4 text-secondary">
        Have a question or just want to say hi? Send me a message.
      </p>
      <p className="mt-1 text-sm text-secondary">
        This form submits through the{" "}
        <code className="rounded-md border border-line bg-surface px-1 py-0.5 font-mono text-xs">
          /api/contact
        </code>{" "}
        API route. Prefer the{" "}
        <Link
          href="/contact-me-server-form"
          className="text-accent hover:opacity-80"
        >
          server action version
        </Link>
        ?
      </p>
      <ContactForm />
    </section>
  );
}
