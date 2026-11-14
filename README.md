# Ella Tang — Personal Portfolio

A personal portfolio website for Ella Tang, MS in Information Systems student at Santa Clara University, built for the ISBA 2438 course. It presents her data analysis, AI, and web development work for recruiters, plus a personal photo page — styled after Linear's dark design system (dark theme, medium-weight tight typography, monochrome accents with a single indigo accent color).

Built with Next.js (App Router, Cache Components), TypeScript, and Tailwind CSS v4.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page: hero headline, role line, intro, About/Projects buttons, and three fact cards (Big 4, 1M, 13) |
| `/about-me` | Portrait, bio, grouped skills (Data, Visualization, Web, AI), and an experience timeline with dates |
| `/projects` | Project cards with hover-to-play preview videos (dark gradient fallback when a video is missing) |
| `/projects/[slug]` | Project detail page: banner video, category, Problem / Approach / Result case study, tech stack, and a "Visit live site" button when available. Unknown slugs render a friendly not-found page |
| `/life` | "Beyond Work" photo grid: 16 metadata-stripped photos with a film-noir CSS grade (grayscale + contrast), film grain, vignettes on full-width heroes, and hover-to-color; placeholder captions |
| `/contact-me-server-form` | Contact form submitted via a Next.js **Server Action** |
| `/contact-me` | Contact form submitted via `fetch()` to an **API route** |
| `/admin` | Password-gated list of all saved submissions, newest first, with logout and per-row delete |

### Project slugs

The three projects live in `lib/projects.ts` and are served by the dynamic route:

- `roblox-interview-agent` — AI Interviewer Rating Agent (AI Practicum)
- `f1-performance-analysis` — Formula 1 Driver Performance Analysis (Data Analysis)
- `ripple-realty-group` — Ripple Realty Group Website (Web Development, live at [ripplerealtygroup.com](https://www.ripplerealtygroup.com/))

Each project defines `slug`, `title`, `category`, `shortDescription`, `problem`, `approach`, `result`, `techStack`, an optional `video` (`src` + `poster`, served from `public/videos/`), and an optional `liveUrl`. Adding a new entry automatically appears in the list, detail route, and navigation — no page-code changes needed.

## Contact flows

Both forms collect name, email, and message, validate on the server with the **same** shared `validateContact()` function (`lib/validation.ts`), and save through the **same** `lib/submissions.ts` module to `data/submissions.json`. Each entry gets a UUID `id`, an ISO `submittedAt` timestamp, and a `source` field:

- `/contact-me-server-form` — the client component calls the `"use server"` action (`app/contact-me-server-form/actions.ts`) through `useActionState`. On validation failure the action returns the submitted values and the form re-renders with them kept (fields clear only on success); submissions are tagged `source: "server-form"`.
- `/contact-me` — a client component POSTs JSON to the route handler `app/api/contact/route.ts`, which returns `201` on success and `400`/`500` with per-field errors; submissions are tagged `source: "api"`.

Invalid submissions never touch the file; both flows share the field-error rendering styles in `app/components/formStyles.ts`.

## Admin

`/admin` is gated by a password. Set it in `.env.local` (never committed):

```
ADMIN_PASSWORD=your-password-here
```

The server hashes it (SHA-256) and stores the hash in an `httpOnly` `admin_session` cookie after login. Every admin server action (logout, delete) re-checks the session server-side before touching data. The table reads `data/submissions.json` fresh on every request inside a `<Suspense>` boundary (Cache Components pattern).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (use `localhost`, not `127.0.0.1` — the dev server binds to the `localhost` hostname). To create a production build instead:

```bash
npm run build
npm start
```

Notes:

- Dev and production builds share the `.next` folder — stop `npm run dev` before running `npm run build`, or the dev session serves stale chunks.
- Project preview videos live in `public/videos/` (`roblox.mp4`, `f1.mp4`, `ripple.mp4` with matching `-poster.jpg` files). A missing file falls back to a dark gradient placeholder.
- The life photos are pre-processed to ≤1600px and <400KB with all EXIF/GPS metadata removed.
