# Jan Klein — Portfolio

Personal portfolio of **Jan Klein** — Pega Business & System Architect and dual
student at **Deutsche Telekom AG**.

**Live: <https://jankln.github.io/portfolio/>**

Built with plain HTML, CSS and JavaScript. No build step, no dependencies, no
framework — just a static folder you can drop onto any host.

## Highlights

- **Zero dependencies** — vanilla HTML / CSS / JS, no bundler, no packages
- **Data-driven** — all content lives in [`assets/data/portfolio.json`](assets/data/portfolio.json);
  the markup binds to it via `data-*` attributes
- **Monochrome editorial design** — near-black canvas, a single magenta accent,
  Inter + Instrument Serif + JetBrains Mono, grain overlay
- **Motion design** — preloader curtain, per-letter hero entrance, custom cursor,
  magnetic buttons, scramble-decode labels, infinite skills marquee, masked
  heading reveals, animated counters, parallax — all respecting
  `prefers-reduced-motion`
- **Live GitHub projects with previews** — repos are fetched from the GitHub API
  at runtime (curated via a `featured` list), each card showing the repo's
  OpenGraph preview image; a static fallback list covers API failures
- **Case study section** — one project told as problem → approach → outcome
- **Accessible** — skip link, visible `:focus-visible` styles, reduced-motion
  support, semantic markup
- **Self-hostable** — GitHub Pages, Netlify, Vercel, Nginx, or a home server

## Project structure

```
.
├── index.html                  # Page markup & section structure
├── assets/
│   ├── css/style.css           # All styles (editorial dark theme, animations)
│   ├── js/main.js              # Data binding, renderers, GitHub fetch, effects
│   ├── img/                    # Favicon, apple-touch-icon, og-image
│   └── data/portfolio.json     # Single source of truth for all content
└── README.md
```

## Configure your content

Everything visible on the page is driven by `assets/data/portfolio.json`:

- `personal` — name, title, tagline, bio, email
- `socials` — GitHub / LinkedIn / Email links
- `github.username` — set this to fetch live repos via the GitHub API
- `github.featured` — ordered list of repo names to show as project cards
- `github.fallbackProjects` — shown when no username is set or the API fails
- `stats` — the animated counters in the About section
- `timeline` — education, work and milestones (certifications live separately)
- `skills` — tech stack, grouped by `category`; icons come from
  [simpleicons.org](https://simpleicons.org) (also feeds the marquee)
- `caseStudy` — the deep-dive project (problem / approach / outcome blocks)
- `certifications` — verified credentials

No rebuild required — just refresh the page.

## Run locally

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit <http://localhost:8000>. (Opening `index.html` via `file://` won't
work — the page fetches `portfolio.json` over HTTP.)

## Deploy

Drop the repository onto any static host. For **GitHub Pages**:

1. Push to `main`
2. Repo → *Settings → Pages → Source: `main` / `/ (root)`*
3. Wait for the deploy and visit the provided URL

## License

Personal portfolio — feel free to take inspiration from the structure, but
please don't reuse the personal content (name, bio, certifications) as your own.
