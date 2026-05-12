(() => {
  const ICON_BASE = "https://cdn.simpleicons.org";

  const LANG_COLORS = {
    JavaScript: "#f1e05a", TypeScript: "#3178c6", Python: "#3572A5",
    Java: "#b07219", Shell: "#89e051", HTML: "#e34c26", CSS: "#563d7c",
    Go: "#00ADD8", Rust: "#dea584", "C++": "#f34b7d", C: "#555555",
    Vue: "#41b883", Svelte: "#ff3e00", Markdown: "#083fa1",
  };

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

  const iconUrl = (slug, color = "ffffff") => `${ICON_BASE}/${slug}/${color}`;

  function bindStaticFields(data) {
    $$("[data-bind]").forEach((el) => {
      const value = getPath(data, el.dataset.bind);
      if (value != null) el.textContent = value;
    });
    $$("[data-href]").forEach((el) => {
      const value = getPath(data, el.dataset.href);
      if (value != null) el.setAttribute("href", `mailto:${value}`);
    });
  }

  function renderSocials(data) {
    const html = data.socials
      .map((s) => {
        const letter = (s.name || "?").trim().charAt(0).toUpperCase();
        const fallback = `this.outerHTML='<span class=\\'social-fallback\\'>${letter}</span>'`;
        return `
        <a href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}">
          <img src="${iconUrl(s.icon, "9595a3")}" alt="" loading="lazy" onerror="${fallback}" />
          <span>${s.name}</span>
          ${s.handle ? `<span class="handle">${s.handle}</span>` : ""}
        </a>`;
      })
      .join("");
    $$("[data-socials]").forEach((el) => (el.innerHTML = html));
  }

  function renderTimeline(data) {
    const root = $("[data-timeline]");
    if (!root) return;
    root.innerHTML = data.timeline
      .map(
        (item) => `
        <li class="reveal">
          <div class="timeline-card">
            <div class="timeline-date">${item.date}</div>
            <h3 class="timeline-title">${item.title}</h3>
            <p class="timeline-org">${item.org}</p>
            <p class="timeline-desc">${item.description}</p>
            <div class="timeline-tags">
              ${(item.tags || []).map((t) => `<span class="tag">${t}</span>`).join("")}
            </div>
          </div>
        </li>`
      )
      .join("");
  }

  function renderSkills(data) {
    const root = $("[data-skills]");
    if (!root) return;
    root.innerHTML = data.skills
      .map((s) => {
        const letter = (s.name || "?").trim().charAt(0).toUpperCase();
        const fallback = `this.outerHTML='<span class=\\'skill-fallback\\'>${letter}</span>'`;
        return `
        <div class="skill-card reveal">
          <div class="skill-icon">
            <img src="${iconUrl(s.slug)}" alt="${s.name}" loading="lazy" onerror="${fallback}" />
          </div>
          <div class="skill-name">${s.name}</div>
          <div class="skill-cat">${s.category}</div>
        </div>`;
      })
      .join("");
  }

  function renderCertifications(data) {
    const root = $("[data-certifications]");
    if (!root) return;
    root.innerHTML = data.certifications
      .map(
        (c) => `
        <a class="cert-card reveal" href="${c.url}" target="_blank" rel="noopener noreferrer">
          <span class="cert-badge">● Verified</span>
          <h3 class="cert-title">${c.title}</h3>
          <p class="cert-issuer">${c.issuer}</p>
          <p class="cert-desc">${c.description}</p>
          <div class="cert-foot">
            <span>${c.date}</span>
            <span>View →</span>
          </div>
        </a>`
      )
      .join("");
  }

  function projectCard(p) {
    const langColor = LANG_COLORS[p.language] || "var(--accent)";
    return `
      <a class="project-card reveal" href="${p.url}" target="_blank" rel="noopener noreferrer">
        <div class="project-name">
          <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5v-9zm10.5-1h-8A1 1 0 0 0 3.5 2.5v6.708A2.486 2.486 0 0 1 4.5 9h8v-7.5zm-6.875 9a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75z"/>
          </svg>
          ${p.name}
        </div>
        <p class="project-desc">${p.description || "No description provided."}</p>
        <div class="project-meta">
          ${p.language ? `<span><span class="lang-dot" style="background:${langColor}"></span>${p.language}</span>` : ""}
          ${p.stars != null ? `<span>★ ${p.stars}</span>` : ""}
        </div>
      </a>`;
  }

  function renderProjects(items) {
    const root = $("[data-projects]");
    if (!root) return;
    root.innerHTML = items.map(projectCard).join("");
  }

  async function fetchGithubProjects(username) {
    if (!username) return null;
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) return null;
      const repos = await res.json();
      return repos
        .filter((r) => !r.fork && !r.archived)
        .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
        .slice(0, 6)
        .map((r) => ({
          name: r.name,
          description: r.description,
          url: r.html_url,
          language: r.language,
          stars: r.stargazers_count,
        }));
    } catch (_) {
      return null;
    }
  }

  async function loadProjects(data) {
    const live = await fetchGithubProjects(data.github.username);
    renderProjects(live && live.length ? live : data.github.fallbackProjects);
  }

  function setupReveal() {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -50px 0px", threshold: 0.05 }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  }

  function setupNav() {
    const toggle = $(".nav-toggle");
    const links = $(".nav-links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  async function loadData() {
    try {
      const res = await fetch("assets/data/portfolio.json", { cache: "no-cache" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("Failed to load portfolio.json", err);
      return null;
    }
  }

  async function init() {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const data = await loadData();
    if (!data) return;

    bindStaticFields(data);
    renderSocials(data);
    renderTimeline(data);
    renderSkills(data);
    renderCertifications(data);
    await loadProjects(data);

    // mark generated sections as reveal-eligible after they exist
    setupReveal();
    setupNav();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
