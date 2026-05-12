# Jan Klein — Portfolio

A minimal, framework-free personal portfolio for **Jan Klein** — Pega Business &
System Architect and dual student at **Deutsche Telekom AG**.

Built with plain HTML, CSS and JavaScript. No build step, no dependencies — just
open `index.html` or drop the folder onto any static host.

## Highlights

- **Zero dependencies** — vanilla HTML / CSS / JS, no frameworks, no bundler
- **Data-driven** — all content lives in [`assets/data/portfolio.json`](assets/data/portfolio.json)
  and is rendered into the page via small `data-bind` attributes
- **Dark, responsive UI** — gradient hero, grid-based sections, mobile nav
- **Live GitHub projects** — pulls public repos from the GitHub API at runtime,
  with a static fallback list when no username is configured
- **Self-hostable** — works on GitHub Pages, Netlify, Vercel, Nginx, or your
  own home server

## Project structure

```
.
├── index.html                  # Page markup & section structure
├── assets/
│   ├── css/style.css           # All styles (dark theme, grid, components)
│   ├── js/main.js              # Data binding, GitHub fetch, nav toggle
│   └── data/portfolio.json     # Single source of truth for all content
└── README.md
```

## Configure your content

Everything visible on the page is driven by `assets/data/portfolio.json`.
Edit that file to update:

- `personal` — name, title, tagline, bio, email
- `socials` — GitHub / LinkedIn / Email links
- `github.username` — set this to fetch live repos via the GitHub API
- `github.fallbackProjects` — shown when no username is set or the API fails
- `timeline` — education, work and milestones
- `skills` — tech stack (icons come from [simpleicons.org](https://simpleicons.org))
- `certifications` — verified credentials

No rebuild required — just refresh the page.

## Run locally

Because everything is static, any of these work:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Then visit <http://localhost:8000>.

## Deploy

Drop the repository onto any static host. For **GitHub Pages**:

1. Push to `main`
2. Repo → *Settings → Pages → Source: `main` / `/ (root)`*
3. Wait for the deploy and visit the provided URL

## License

Personal portfolio — feel free to take inspiration from the structure, but
please don't reuse the personal content (name, bio, certifications) as your own.
