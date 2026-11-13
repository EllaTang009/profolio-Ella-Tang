import type { Metadata } from "next";
import Image from "next/image";
import { Cormorant_Garamond } from "next/font/google";
import FadeIn from "./FadeIn";
import { lifePhotos } from "@/lib/life";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Beyond Work",
};

export default function Life() {
  return (
    <section
      className={`${cormorant.variable} mx-auto w-full max-w-5xl flex-1 px-4 py-16 sm:px-6`}
    >
      <h1
        className={`${cormorant.className} text-5xl font-medium text-foreground sm:text-6xl`}
      >
        Beyond Work
      </h1>
      <p className="type-caption mt-4 font-mono">
        Places, food, and light — the things that keep me curious outside of
        code.
      </p>

      <div className="mt-16 grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-12">
        {lifePhotos.map((photo) => (
          <FadeIn key={photo.src} className={photo.span}>
            <figure>
              <div
                className={`${photo.ratio} overflow-hidden rounded-xl border border-line`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={800}
                  className="h-full w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 font-mono text-xs text-secondary">
                {photo.caption}
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
