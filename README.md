# jankln.net

My personal portfolio — one page, no framework, no build step.

**Live at [jankln.net](https://jankln.net) · [www.jankln.net](https://www.jankln.net)**

I'm Jan Klein, Solution Designer at Deutsche Telekom Services Europe SE and dual
student of Business Informatics (B.Sc.). This repo is the site itself: everything
I do professionally — Pega, process automation — plus the things I build for
myself, from a Raspberry Pi home lab to small tools.

The site is deliberately plain underneath. Three files carry it: `index.html`,
`style.css`, `main.js`. No bundler, no packages, no CI. Edits go live on refresh.

---

## What's in it

**Data-driven** — nearly all visible content comes from a single JSON file. The
markup declares the skeleton and binds to it with `data-*` attributes, so adding
a job or a certification means editing data, never HTML.

**Editorial dark design** — near-black canvas, one magenta accent, Inter +
Instrument Serif + JetBrains Mono, a grain overlay over the whole page.

**Motion, but restrained** — preloader curtain, per-letter hero entrance, masked
heading reveals, scramble-decode labels, animated counters, an infinite skills
marquee, magnetic buttons, a custom cursor and parallax. Every effect checks
`prefers-reduced-motion` and switches itself off.

**A journey that stays readable** — the CV is split into *Experience* and
*Education*, each group on its own spine with a mono index and entry count. A
segmented filter above it switches between them, built from the data.

**Live GitHub projects** — repos are fetched from the GitHub API at runtime and
curated through a `featured` list. Cards are text-only on purpose: GitHub's
OpenGraph preview repeats the repo name and description, so every card ended up
saying the same thing twice. A static fallback list covers API failures, which
means the page never renders empty.

**Case study** — one project told properly as problem → approach → outcome,
instead of a wall of screenshots.

**Accessible** — skip link, visible `:focus-visible` styles, semantic markup,
reduced-motion support throughout.

---

## Structure

```
.
├── index.html                  # Section skeleton, data-* bindings
├── assets/
│   ├── css/style.css           # Everything visual
│   ├── js/main.js              # Binding, renderers, GitHub fetch, effects
│   ├── img/                    # Favicon, apple-touch-icon, og-image, diagrams
│   └── data/portfolio.json     # All content
├── CLAUDE.md                   # Notes for working on this repo
└── README.md
```

## The content file

`assets/data/portfolio.json` is the single source of truth:

| Key | Drives |
| --- | --- |
| `personal` | Name, role, company, tagline, bio, contact |
| `socials` | Hero and contact chips (icons via [Simple Icons](https://simpleicons.org) slugs) |
| `github.username` | Live repo fetch; empty falls back to the static list |
| `github.featured` | Ordered repo names shown as project cards |
| `github.fallbackProjects` | Rendered when the API is unavailable |
| `stats` | The animated counters in About |
| `timeline` | Ordered groups (`Experience`, `Education`), each with its own `items` |
| `skills` | Stack, grouped by `category`; also feeds the marquee |
| `caseStudy` | The deep-dive section — remove it and the section removes itself |
| `certifications` | Credential rows, each linking to its verification page |

Timeline entries take an optional `orgNote` for a small line under the
organisation — useful where the employer and the place of work differ.

No rebuild needed anywhere. Save, refresh, done.

## Run it locally

```bash
python3 -m http.server 8000   # or: npx serve .
```

Then open <http://localhost:8000>. Opening `index.html` straight from the file
system won't work — the page fetches `portfolio.json` over HTTP.

## Deploy

The repo *is* the artifact. Drop it on any static host — GitHub Pages, Netlify,
Vercel, Nginx, or your own server. Nothing to compile, nothing to configure.

## Using this

The structure is free to learn from — take the data-binding approach, the
timeline, whatever is useful. Please leave the personal content where it is:
name, bio, certifications and case study are mine.
