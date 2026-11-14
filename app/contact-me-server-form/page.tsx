import type { Metadata } from "next";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact (Server Form)",
};

export default function Contact() {
  return (
    <section className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="type-h2">Contact</h1>
      <p className="type-body mt-4">
        Have a question or just want to say hi? Send me a message.
      </p>
      <ContactForm />
    </section>
  );
}
