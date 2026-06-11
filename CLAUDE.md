# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page personal portfolio for Jan Klein. Static, framework-free, zero dependencies — just `index.html`, one CSS file, one JS file, and a JSON data file.

There is **no build step, no package manager, no test suite, and no linter**. Edits go live on refresh.

## Running locally

```bash
python3 -m http.server 8000   # or: npx serve .
```

Open <http://localhost:8000>. The page fetches `assets/data/portfolio.json` over HTTP, so opening `index.html` directly via `file://` will fail — always serve it.

## Architecture

The site is **data-driven**: nearly all visible content comes from `assets/data/portfolio.json`. To change what the user sees, edit the JSON — not the HTML.

Three pieces work together:

1. **`index.html`** — declares the section skeleton and uses two attribute conventions:
   - `data-bind="path.to.field"` — replaces `textContent` with a value from `portfolio.json`
   - `data-href="personal.email"` — sets the `href` (currently hardcoded to a `mailto:` prefix in `main.js`)
   - `data-socials`, `data-timeline`, `data-skills`, `data-projects`, `data-certifications` — empty containers that `main.js` fills with rendered lists

2. **`assets/data/portfolio.json`** — the single source of truth. Top-level keys: `personal`, `socials`, `github`, `timeline`, `skills`, `certifications`. Schema is implicit — match the existing shape when adding entries.

3. **`assets/js/main.js`** — one IIFE. `init()` (runs on `DOMContentLoaded`) loads the JSON, then calls `bindStaticFields` + a `render*` function per list section. Each renderer builds an HTML string from the JSON and assigns it to `innerHTML`. Reveal animations (`IntersectionObserver` on `.reveal` elements) and the mobile nav are wired up last.

### Adding a new section

1. Add the markup to `index.html` with a `data-yoursection` container.
2. Add the data array to `portfolio.json`.
3. Add a `renderYourSection(data)` function in `main.js` and call it from `init()` **before** `setupReveal()` (so any `.reveal` elements it emits get observed).

### Icons

Skill and social icons load from `https://cdn.simpleicons.org/{slug}/{color}`. The `slug` field in `skills` and `socials` must be a valid [Simple Icons](https://simpleicons.org) slug. If the request 404s, the renderer's inline `onerror` swaps in a single-letter fallback.

### GitHub projects

`loadProjects()` calls the GitHub REST API live when `github.username` is non-empty, filters out forks/archived repos, sorts by stars then recency, and shows the top 6. If the username is empty or the request fails, `github.fallbackProjects` is rendered instead. The page works fully offline-of-GitHub via this fallback.

## Deployment

Any static host. The README documents the GitHub Pages flow (push to `main`, enable Pages from root).
