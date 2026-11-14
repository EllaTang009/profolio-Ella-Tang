export interface LifePhoto {
  src: string;
  alt: string;
  // Short one-line caption shown under the photo. Empty = no caption yet;
  // the photo then shows only its number.
  caption: string;
  // Optional CSS object-position override (e.g. "center top") for the
  // fixed aspect-ratio crop, for photos that need a custom framing.
  focus?: string;
  // Layout hints for the asymmetric editorial grid: Tailwind column span
  // (plus optional stagger offset) and the aspect-ratio class for the crop.
  span: string;
  ratio: string;
}

// One entry per processed photo in public/images/life/. Captions are
// empty until filled in.
const layouts = [
  { span: "md:col-span-12", ratio: "aspect-[21/9]" },
  { span: "md:col-span-7", ratio: "aspect-[4/3]" },
  { span: "md:col-span-5 md:mt-24", ratio: "aspect-[4/5]" },
  { span: "md:col-span-5", ratio: "aspect-square" },
  { span: "md:col-span-7 md:mt-16", ratio: "aspect-[3/2]" },
  { span: "md:col-span-12", ratio: "aspect-[16/9]" },
];

export const lifePhotos: LifePhoto[] = Array.from({ length: 16 }, (_, i) => {
  const layout = layouts[i % layouts.length];
  return {
    src: `/images/life/life-${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `Personal photo ${i + 1}`,
    caption: "",
    span: layout.span,
    ratio: layout.ratio,
  };
});
