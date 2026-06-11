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

2. **`assets/data/portfolio.json`** — the single source of truth. Top-level keys: `personal`, `socials`, `github`, `stats`, `timeline`, `skills`, `caseStudy`, `certifications`. Schema is implicit — match the existing shape when adding entries. Certifications live **only** under `certifications`; do not duplicate them as `timeline` entries. `github.featured` is an ordered list of repo names that curates which live repos appear as project cards (empty list = top 6 by stars/recency). `caseStudy` drives the deep-dive section; if removed, the section removes itself from the DOM.

3. **`assets/js/main.js`** — one IIFE. `init()` (runs on `DOMContentLoaded`) loads the JSON, then calls `bindStaticFields` + a `render*` function per list section. Each renderer builds an HTML string from the JSON and assigns it to `innerHTML`. Interactive effects are wired up last, **after** the renderers (they attach listeners/observers to rendered elements): staggered reveals (`.reveal` + inline `--d` delay), masked heading reveals (`.mask`), per-letter hero entrance (`setupSplit` on `.split`, gated by `body.loaded`), scramble-decode on `.scramble` labels, animated counters (`.stat-value`), the skills marquee (built from `skills` names, duplicated for a seamless loop), custom cursor (fine pointers only), magnetic buttons (`.magnetic`), parallax (`[data-parallax]` + `data-speed`), Berlin local time (`[data-time]`), scroll progress / nav state / back-to-top, active-section nav highlighting, and the mobile nav. The preloader curtain adds `body.loaded`, which gates all hero entrance animations. Every motion effect respects `prefers-reduced-motion` (the CSS fallback also un-hides `.ch`/`.mask` content, so keep that in sync when adding gated animations).

### Container selectors — one vs. many

`renderSocials` uses `querySelectorAll` and fills **every** `[data-socials]` container (the markup has two: hero + contact). The other list renderers (`renderTimeline`, `renderSkills`, `renderCertifications`, `renderProjects`) use `querySelector` and only fill the **first** matching container. If you duplicate one of those containers in the markup, the second copy stays empty — promote the renderer to `querySelectorAll` or keep a single container.

### `data-href` is mailto-only

`bindStaticFields` hardcodes a `mailto:` prefix when resolving `data-href`. To drive a non-mail link from JSON (e.g. a phone or external URL), generalize the helper — don't add a second hardcoded prefix.

### Trust model for JSON content

Every renderer interpolates JSON values straight into `innerHTML` (titles, descriptions, tags, URLs). That is safe **only** because `portfolio.json` is author-controlled. If you ever wire up user-submitted content (contact form, comments, etc.), escape it before it reaches `innerHTML`.

### Adding a new section

1. Add the markup to `index.html` with a `data-yoursection` container.
2. Add the data array to `portfolio.json`.
3. Add a `renderYourSection(data)` function in `main.js` and call it from `init()` **before** `setupReveal()` (so any `.reveal` elements it emits get observed).

### Icons

Skill and social icons load from `https://cdn.simpleicons.org/{slug}/{color}`. The `slug` field in `skills` and `socials` must be a valid [Simple Icons](https://simpleicons.org) slug. The design is monochrome: all icons are requested in a single gray (`ICON_GRAY` in `main.js`) and brightened on hover via CSS — don't reintroduce per-icon colors. If the request 404s, the renderer's inline `onerror` swaps in a single-letter fallback.

### GitHub projects

`loadProjects()` calls the GitHub REST API live when `github.username` is non-empty, filters out forks/archived repos, sorts by stars then recency, and shows the top 6. If the username is empty or the request fails, `github.fallbackProjects` is rendered instead. The page works fully offline-of-GitHub via this fallback.

Each project card shows a live repo preview image from `https://opengraph.githubassets.com/1/{owner}/{repo}` (derived from the repo URL in `previewUrl()`); if the image fails to load, the inline `onerror` removes the media block and the card renders text-only. GitHub's OG cards are white, so the CSS folds them into the dark design with a `grayscale + invert` filter chain, and a left-anchored 3:2 crop hides the avatar (which would render as a photo negative under the invert). Language dots are monochrome (`var(--dim)`, accent on card hover) — there is deliberately no per-language color map.

## Deployment

Any static host. The README documents the GitHub Pages flow (push to `main`, enable Pages from root).
