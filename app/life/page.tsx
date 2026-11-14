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
        {lifePhotos.map((photo, index) => (
          <FadeIn key={photo.src} className={photo.span}>
            <figure>
              <div
                className={`photo-frame ${
                  // Large full-width photos get the cinematic vignette.
                  photo.span.includes("col-span-12") ? "photo-vignette" : ""
                } ${photo.ratio} overflow-hidden border border-line`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={1200}
                  height={800}
                  className="photo-noir h-full w-full object-cover"
                  style={
                    photo.focus ? { objectPosition: photo.focus } : undefined
                  }
                />
              </div>
              <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[13px] text-secondary">
                {photo.caption && <span>{photo.caption}</span>}
                <span className="font-mono">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </figcaption>
            </figure>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
