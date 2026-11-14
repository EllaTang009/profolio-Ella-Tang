# PROMPT_LOG.md — AI-Assisted Development Log

A chronological log of the prompts used to build this portfolio with an AI coding assistant (Viber), with a short critique of each outcome. Every commit in the repository maps to one of these prompts.

| # | Prompt (abridged) | Result / Critique |
| --- | --- | --- |
| 1 | Build Ella Tang's portfolio: home, about, projects + detail routes, two contact forms (server action + API), password-protected admin; use Next.js App Router, Cache Components, dark Linear-style design | Shipped all pages in two commits. Critique: solid foundation, but the initial design was light-themed and generic — replaced later. |
| 2 | Update README with project overview | Docs matched the early page set; fell behind as features grew — rewritten at the end. |
| 3 | Rename the Contact nav link to Contact (Server) to distinguish the two forms | Small nav/metadata fix; exposed that both forms duplicated validation logic. |
| 4 | Update the bio: automotive content company grew to 1 million followers in 4 months | Content-only change; no issues. |
| 5 | Add password protection to /admin | SHA-256 token + httpOnly cookie; tested wrong-password, gated content, and session cookie paths. |
| 6 | Fix nav active-link detection for overlapping URL prefixes | Bug found while clicking through pages: prefix matching failed on shared prefixes; fixed with exact-or-trailing-slash logic. |
| 7 | Both contact forms duplicate validation — extract shared validateContact() | Good refactor; single source of truth for rules. |
| 8 | Harden the API contact form error handling | Non-JSON responses and network failures now show visible errors instead of failing silently. |
| 9 | Deduplicate form styles and error types into shared modules | formStyles.ts + shared types removed copy-pasted classes; made the two forms easier to compare. |
| 10 | Add admin logout and per-row delete with server-side session check | Full CRUD-lite admin; delete re-checks auth server-side — tested authed vs unauthed deletes. |
| 11 | Adopt a dark Linear-style design system (tokens, surfaces, accent color) | Design tokens in globals.css; initial migration left stray light classes that resurfaced later (see 15). |
| 12 | Apply the dark design system to every page | All pages migrated; verified by grep for leftover palette classes. |
| 13 | Add a Beyond Work (/life) page with an editorial photo grid | Asymmetric grid + scroll fade-in; placeholder photos initially. |
| 14 | Pages still render light — force dark theme via CSS variables everywhere | Root-caused to a stale dev-compiled stylesheet in .next plus leftover light classes; wiped .next, removed the palette remap layer, migrated every remaining class. Critique: taught the key lesson that `next build` and `next dev` share .next. |
| 15 | Match Linear's typography: reusable type scale (hero 56/40, h2 32–40, h3 18–20, body, captions), Inter with optical sizing | Type classes defined once in globals.css; serif /life heading kept as the one exception. |
| 16 | Add hover-to-play project videos like Linear's Now page; reusable component; poster/fallback/touch/reduced-motion handling | HoverVideo component + video fields in lib/projects.ts; gradient fallback for missing files. |
| 17 | Cards show the first frame but hover does nothing — debug | Hardened: handlers moved to the card wrapper, posters generated from first frames, preload="auto", muted enforced. Root cause of the empty area: missing poster + preload=metadata not painting a frame. |
| 18 | Add a third project (Ripple Realty Group) with category, live link, rebalanced grid | Data-driven addition worked with zero new page code; grid rebalanced for three cards. |
| 19 | Hover still doesn't play after hard refresh — rewrite the hover behavior the simplest reliable way | Replaced with ProjectCard: whole card as one client component, muted-before-play, logged rejections. Root cause confirmed: a missing video file (NotSupportedError) plus stale dev chunks; guard-heavy wrapper version removed. |
| 20 | The server form clears valid fields on validation errors — fix both forms to behave the same | Cause: React 19 auto-resets forms after a server action. Actions now return submitted values; the form remounts with them on error and empty on success. |
| 21 | Compress ripple.mp4 to 720p (<5MB, H.264, no audio) and generate its poster | ffmpeg installed via static build (winget source was broken); 7.11MB → 0.28MB + first-frame poster. |
| 22 | Strip all metadata (GPS/camera) from life photos, resize ≤1600px and <400KB, fix numbering, update lib/life.ts | One photo was HEIC (decoded via ffmpeg); pipeline: bake EXIF orientation, re-encode metadata-free, quality-step to target size. 16 photos final. |
| 23 | Code organization review against rubric: separation of page/UI/server responsibilities, single shared validation/submissions | Extracted SubmissionsTable, standardized alias imports, removed unused create-next-app assets, confirmed both flows share validateContact() + lib/submissions.ts. |
| 24 | Give /life photos a film-noir CSS grade: grayscale + contrast, grain, vignette, hover-to-color — CSS only | Reusable .photo-noir/.photo-frame classes; verified computed styles in a headless browser. |
| 25 | /life shows empty boxes and unfiltered photos — investigate | No code bug: verified single 16-entry list, all files present, filter active in computed styles; symptoms were stale dev-server chunks. Critique: headless lazy-loading initially misread as broken images. |
| 26 | Natural aspect ratios instead of cropping | Fixed the head-cutting crop but made the grid uneven — reverted in the next prompt. |
| 27 | Revert to fixed editorial frames; crop with object-position "center 25%"; optional per-photo focus override; sharp corners; numbered caption rows | Final /life layout: magazine-style frames, face-safe crop, caption-left/number-right rows. |

## Lessons

- `next build` and `next dev` share `.next` — never build while the dev server runs; wipe `.next` when switching.
- Verify bugs in a real browser (computed styles, network requests) before changing code: several "bugs" were stale dev chunks or lazy-loading behavior.
- React 19 resets uncontrolled forms after server actions — return submitted values from the action and re-apply them.
- Strip EXIF (including GPS) from any photo before publishing.
