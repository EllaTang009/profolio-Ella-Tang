# Ella Tang — Personal Portfolio

A personal portfolio website for Ella Tang, MS in Information Systems student at Santa Clara University. Built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Pages

| Route | Description |
| --- | --- |
| `/` | Landing page with hero, intro, and a link to About Me |
| `/about-me` | Bio, profile photo, and skills |
| `/projects` | Card list of projects |
| `/projects/[slug]` | Project detail page (dynamic route; unknown slugs show a friendly not-found message) |
| `/contact-me-server-form` | Contact form submitted via a Next.js **Server Action** |
| `/contact-me` | Contact form submitted via `fetch()` to an **API route** |
| `/admin` | Lists all saved submissions, newest first |

## Contact forms

Both forms collect name, email, and message, validate on the server, and save to the same `data/submissions.json` file (shared logic in `lib/submissions.ts`). Each entry gets a UUID `id`, an ISO `submittedAt` timestamp, and a `source` field:

- `/contact-me-server-form` — the page component calls a `"use server"` action (`app/contact-me-server-form/actions.ts`) through `useActionState`; submissions are tagged `source: "server-form"`.
- `/contact-me` — a client component POSTs JSON to the route handler `app/api/contact/route.ts`, which returns `201` on success and `400`/`500` with error details; submissions are tagged `source: "api"`.

The `/admin` page reads the JSON file fresh on every request (Cache Components pattern: `await connection()` inside a `<Suspense>` boundary).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To create a production build instead:

```bash
npm run build
npm start
```
