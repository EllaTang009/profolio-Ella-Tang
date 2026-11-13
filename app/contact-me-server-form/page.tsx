import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact",
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
      <ContactForm />
    </section>
  );
}
