# Ella Tang — Personal Portfolio

A personal portfolio website for Ella Tang, MS in Information Systems student at Santa Clara University, built for the ISBA 2438 course. It presents her data analysis, AI, and web development work for recruiters, plus a personal photo page and an admin area with a blog, project manager, and job-application tracker — styled after Linear's dark design system (dark theme, medium-weight tight typography, monochrome accents with a single indigo accent color).

Built with Next.js (App Router, Cache Components), TypeScript, and Tailwind CSS v4.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page: hero headline, role line, intro, About/Projects buttons, and three fact cards (Big 4, 1M, 13) |
| `/about-me` | Portrait, bio, grouped skills (Data, Visualization, Web, AI), and an experience timeline with dates |
| `/projects` | Project cards fetched from `GET /api/projects` in a client component, rendered through the reusable `ProjectCard` with hover-to-play preview videos (dark gradient fallback when a video is missing) |
| `/projects/[slug]` | Project detail page: banner video, category, Problem / Approach / Result case study, tech stack, and a "Visit live site" button when available. Known slugs are prerendered; projects created later render on demand. Unknown slugs render a friendly not-found page |
| `/blogs` | Blog list fetched from `GET /api/blogs`, newest first |
| `/blogs/[slug]` | Blog post page. Known slugs are prerendered; posts created later render on demand. Unknown slugs render a friendly not-found page |
| `/life` | "Beyond Work" photo grid: 16 metadata-stripped photos with a film-noir CSS grade (grayscale + contrast), film grain, vignettes on full-width heroes, and hover-to-color; placeholder captions |
| `/contact-me-server-form` | Contact form submitted via a Next.js **Server Action** |
| `/contact-me` | Contact form submitted via `fetch()` to an **API route**, with a **LocalStorage draft autosave** (see below) |
| `/admin` | Password-gated hub: submissions table, plus links to the blog manager, project manager, and job application tracker |
| `/admin/blogs` | Password-gated blog manager: create, inline edit, and delete posts |
| `/admin/projects` | Password-gated project manager: create, inline edit, and delete projects |
| `/tracker` | Password-gated job application tracker: stats per status, create, inline edit, and delete applications |

### Project data

All projects live in `data/projects.json` and are read and written only by `lib/projects.ts`:

- `roblox-interview-agent` — AI Interviewer Rating Agent (AI Practicum)
- `f1-performance-analysis` — Formula 1 Driver Performance Analysis (Data Analysis)
- `ripple-realty-group` — Ripple Realty Group Website (Web Development, live at [ripplerealtygroup.com](https://www.ripplerealtygroup.com/))

Each project has `id`, `slug`, `title`, `category`, `shortDescription`, `problem`, `approach`, `result`, `techStack`, an optional `video` (`src` + `poster`, served from `public/videos/`), an optional `liveUrl`, and a `createdAt` timestamp. New projects created in `/admin/projects` get a unique slug generated from the title and appear on `/projects` and `/projects/[slug]` automatically — no page-code changes needed. The same pattern applies to blog posts (`data/blogs.json` via `lib/blogs.ts`) and job applications (`data/applications.json` via `lib/applications.ts`).

## Contact flows

Both forms collect name, email, and message, validate on the server with the **same** shared `validateContact()` function (`lib/validation.ts`), and save through the **same** `lib/submissions.ts` module to `data/submissions.json`. Each entry gets a UUID `id`, an ISO `submittedAt` timestamp, and a `source` field:

- `/contact-me-server-form` — the client component calls the `"use server"` action (`app/contact-me-server-form/actions.ts`) through `useActionState`. On validation failure the action returns the submitted values and the form re-renders with them kept (fields clear only on success); submissions are tagged `source: "server-form"`.
- `/contact-me` — a client component POSTs JSON to the route handler `app/api/contact/route.ts`, which returns `201` on success and `400`/`500` with per-field errors; submissions are tagged `source: "api"`.

Invalid submissions never touch the file; both flows share the field-error rendering styles in `app/components/formStyles.ts` and the `Notice` banner component.

### LocalStorage draft autosave (`/contact-me`)

The API contact form autosaves an unsent draft so a refresh or accidental leave never loses typed text:

- `lib/draftStorage.ts` is the only module that touches localStorage, under the single key `contact-draft-v1`, storing `{ name, email, message, savedAt }` with `JSON.stringify`. Every call is wrapped in try/catch so private browsing or blocked storage never breaks the page, and `loadDraft()` safely returns `null` for a missing key and removes corrupt or wrong-shaped entries instead of crashing.
- Save flow: input → React state → debounced 500 ms → `saveDraft()` → a small "Draft saved · [time]" indicator.
- Load flow: on mount, `loadDraft()` restores the fields and shows "Restored your unsent draft from [time]" with a "Clear draft" button.
- A successful submission (201) clears the draft and the fields; a failed submission keeps the draft so nothing is lost. Empty drafts (all fields blank) are never saved.

## API endpoints

| Endpoint | Method | Auth | Description |
| --- | --- | --- | --- |
| `/api/contact` | `GET` | Admin | All contact submissions, newest first |
| `/api/contact` | `POST` | Public | Create a submission from the API contact form (`201`/`400`) |
| `/api/contact/[id]` | `GET` | Admin | One submission (`200`/`404`) |
| `/api/contact/[id]` | `PUT` | Admin | Update a submission, validated by `validateContact()` (`200`/`400`/`404`) |
| `/api/contact/[id]` | `DELETE` | Admin | Delete a submission (`200`/`404`) |
| `/api/blogs` | `GET` | Public | All blog posts, newest first |
| `/api/blogs` | `POST` | Public | Create a post, validated by `validateBlog()` (`201`/`400`) |
| `/api/blogs/[id]` | `GET` | Public | One post (`200`/`404`) |
| `/api/blogs/[id]` | `PUT` | Admin | Update a post; the slug regenerates and stays unique when the title changes (`200`/`400`/`404`) |
| `/api/blogs/[id]` | `DELETE` | Admin | Delete a post (`200`/`404`) |
| `/api/projects` | `GET` | Public | All projects, oldest first (matches the original hand-written order) |
| `/api/projects` | `POST` | Admin | Create a project, validated by `validateProject()` (`201`/`400`) |
| `/api/projects/[id]` | `GET` | Public | One project (`200`/`404`) |
| `/api/projects/[id]` | `PUT` | Admin | Update a project; the slug regenerates and stays unique when the title changes (`200`/`400`/`404`) |
| `/api/projects/[id]` | `DELETE` | Admin | Delete a project (`200`/`404`) |
| `/api/applications` | `GET` | Admin | All job applications, newest applied date first |
| `/api/applications` | `POST` | Admin | Create an application, validated by `validateApplication()` (`201`/`400`) |
| `/api/applications/[id]` | `GET` | Admin | One application (`200`/`404`) |
| `/api/applications/[id]` | `PUT` | Admin | Update an application (`200`/`400`/`404`) |
| `/api/applications/[id]` | `DELETE` | Admin | Delete an application (`200`/`404`) |

Notes:

- "Admin" endpoints return `401` without a valid admin session. "Public" means no login required.
- Every response sends `Cache-Control: no-store` so the UI always reflects the latest JSON file.
- Every request is logged to the server console as `[area] METHOD /path -> status`.
- All data lives in `data/*.json`; only the matching `lib/*.ts` module reads or writes each file. Shared types and validation live in `lib/types/` (no Node imports, so client components can import them).

## Reusable components

| Component | Used by |
| --- | --- |
| `Navbar`, `Footer` (`app/components`) | Every page (layout) |
| `ProjectCard` (`app/components`) | `/projects` list |
| `BannerVideo` + `Placeholder` (`app/components`) | `/projects/[slug]` banner, `ProjectCard` fallback |
| `Notice` (`app/components`) | Contact forms, submissions table, blog manager, project manager, tracker — success/error banners |
| `EmptyState` (`app/components`) | Submissions table, tracker, project manager — dashed-border empty boxes |
| `formStyles` (`app/components`) | Every form (inputs, labels, field errors, banners, submit button) |
| `BlogCard`, `BlogList` (`app/blogs`) | `/blogs` |
| `ApplicationStats`, `ApplicationCard`, `ApplicationForm` (`app/tracker`) | `/tracker`, composed by the parent `ApplicationTracker` |

## Admin

`/admin` is gated by a password. Set it in `.env.local` (never committed):

```
ADMIN_PASSWORD=your-password-here
```

The server hashes it (SHA-256) and stores the hash in an `httpOnly` `admin_session` cookie after login. Every admin server action and every admin-only API endpoint re-checks the session server-side before touching data. `/admin` links to the blog manager (`/admin/blogs`), the project manager (`/admin/projects`), and the job application tracker (`/tracker`). Dynamic admin pages read their data fresh on every request inside `<Suspense>` boundaries (Cache Components pattern).

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
