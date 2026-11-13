export interface LifePhoto {
  src: string;
  alt: string;
  caption: string;
  // Layout hints for the asymmetric editorial grid: Tailwind column span
  // (plus optional stagger offset) and the aspect-ratio class for the crop.
  span: string;
  ratio: string;
}

export const lifePhotos: LifePhoto[] = [
  {
    src: "/images/life/life-01.jpg",
    alt: "Golden hour landscape",
    caption: "golden hour — my favorite light",
    span: "md:col-span-12",
    ratio: "aspect-[21/9]",
  },
  {
    src: "/images/life/life-02.jpg",
    alt: "Kitchen scene",
    caption: "the kitchen — recipes from my catering days",
    span: "md:col-span-7",
    ratio: "aspect-[4/3]",
  },
  {
    src: "/images/life/life-03.jpg",
    alt: "Campus walk",
    caption: "SCU campus — between classes",
    span: "md:col-span-5 md:mt-24",
    ratio: "aspect-[4/5]",
  },
  {
    src: "/images/life/life-04.jpg",
    alt: "Road trip view",
    caption: "Highway 1 — weekend road trips",
    span: "md:col-span-5",
    ratio: "aspect-square",
  },
  {
    src: "/images/life/life-05.jpg",
    alt: "Late night desk",
    caption: "the desk — editing long after midnight",
    span: "md:col-span-7 md:mt-16",
    ratio: "aspect-[3/2]",
  },
  {
    src: "/images/life/life-06.jpg",
    alt: "Calm evening view",
    caption: "home — where the week resets",
    span: "md:col-span-12",
    ratio: "aspect-[16/9]",
  },
];
