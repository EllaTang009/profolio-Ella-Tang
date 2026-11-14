export interface LifePhoto {
  src: string;
  alt: string;
  caption: string;
  // Intrinsic pixel dimensions of the processed file. The image renders
  // at its natural aspect ratio (no cropping), sized by its grid column.
  width: number;
  height: number;
  // Layout hints for the asymmetric editorial grid: Tailwind column span
  // (plus optional stagger offset).
  span: string;
}

// One entry per processed photo in public/images/life/. Captions are
// placeholders — replace the caption (and alt) text with real ones.
const layouts = [
  { span: "md:col-span-12" },
  { span: "md:col-span-7" },
  { span: "md:col-span-5 md:mt-24" },
  { span: "md:col-span-5" },
  { span: "md:col-span-7 md:mt-16" },
  { span: "md:col-span-12" },
];

const dimensions: Record<string, [number, number]> = {
  "01": [1600, 1200],
  "02": [1200, 900],
  "03": [1200, 1600],
  "04": [900, 900],
  "05": [1200, 800],
  "06": [1600, 900],
  "07": [630, 354],
  "08": [1600, 1200],
  "09": [1200, 1600],
  "10": [1200, 1600],
  "11": [1067, 1600],
  "12": [1200, 1600],
  "13": [1200, 1600],
  "14": [741, 1600],
  "15": [1202, 1600],
  "16": [1086, 1448],
};

export const lifePhotos: LifePhoto[] = Array.from({ length: 16 }, (_, i) => {
  const key = String(i + 1).padStart(2, "0");
  const [width, height] = dimensions[key];
  return {
    src: `/images/life/life-${key}.jpg`,
    alt: `Personal photo ${i + 1}`,
    caption: "Add a caption",
    width,
    height,
    span: layouts[i % layouts.length].span,
  };
});
