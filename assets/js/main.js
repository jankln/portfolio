(() => {
  const ICON_BASE = "https://cdn.simpleicons.org";
  const ICON_GRAY = "8d8a93";

  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE_POINTER = window.matchMedia("(pointer: fine)").matches;

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const getPath = (obj, path) =>
    path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

  const iconUrl = (slug, color = ICON_GRAY) => `${ICON_BASE}/${slug}/${color}`;

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

  /* ---------- renderers ---------- */

  function renderSocials(data) {
    const html = data.socials
      .map((s) => {
        const letter = (s.name || "?").trim().charAt(0).toUpperCase();
        const fallback = `this.outerHTML='<span class=\\'social-fallback\\'>${letter}</span>'`;
        return `
        <a class="social-chip" href="${s.url}" target="_blank" rel="noopener noreferrer" aria-label="${s.name}">
          <img src="${iconUrl(s.icon)}" alt="" loading="lazy" onerror="${fallback}" />
          <span>${s.name}</span>
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
        (item, i) => `
        <li class="timeline-item reveal" style="--d:${i * 100}ms">
          <span class="timeline-year">${item.date}</span>
          <div class="timeline-body">
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
    const groups = data.skills.reduce((acc, s) => {
      (acc[s.category] = acc[s.category] || []).push(s);
      return acc;
    }, {});
    root.innerHTML = Object.entries(groups)
      .map(([cat, items], gi) => {
        const pills = items
          .map((s) => {
            const letter = (s.name || "?").trim().charAt(0).toUpperCase();
            const fallback = `this.outerHTML='<span class=\\'skill-fallback\\'>${letter}</span>'`;
            return `
            <span class="skill-pill">
              <img src="${iconUrl(s.slug)}" alt="" loading="lazy" onerror="${fallback}" />
              ${s.name}
            </span>`;
          })
          .join("");
        return `
        <div class="skill-group reveal" style="--d:${gi * 80}ms">
          <span class="skill-group-label">${cat}</span>
          <div class="skill-pills">${pills}</div>
        </div>`;
      })
      .join("");
  }

  function renderStats(data) {
    const root = $("[data-stats]");
    if (!root || !data.stats) return;
    root.innerHTML = data.stats
      .map(
        (s, i) => `
        <div class="stat reveal" style="--d:${i * 100}ms">
          <span class="stat-value" data-target="${s.value}" data-suffix="${s.suffix || ""}">0${s.suffix || ""}</span>
          <span class="stat-label">${s.label}</span>
        </div>`
      )
      .join("");
  }

  function renderCertifications(data) {
    const root = $("[data-certifications]");
    if (!root) return;
    root.innerHTML = data.certifications
      .map(
        (c, i) => `
        <a class="cert-row reveal" style="--d:${i * 100}ms" href="${c.url}" target="_blank" rel="noopener noreferrer">
          <span class="cert-index">0${i + 1}</span>
          <div class="cert-main">
            <h3 class="cert-title">${c.title}</h3>
            <p class="cert-issuer">${c.issuer} — ${c.description}</p>
          </div>
          <span class="cert-year">${c.date}</span>
          <span class="cert-arrow" aria-hidden="true">↗</span>
        </a>`
      )
      .join("");
  }

  /* repo preview via GitHub's OpenGraph image service */
  function previewUrl(repoUrl) {
    const path = (repoUrl || "")
      .replace(/^https:\/\/github\.com\//, "")
      .replace(/\/+$/, "");
    return /^[^/]+\/[^/]+$/.test(path)
      ? `https://opengraph.githubassets.com/1/${path}`
      : "";
  }

  function projectCard(p, i) {
    const preview = previewUrl(p.url);
    const media = preview
      ? `<div class="project-media">
           <img src="${preview}" alt="Preview of ${p.name}" loading="lazy"
                onerror="this.closest('.project-media').remove()" />
         </div>`
      : "";
    return `
      <a class="project-card reveal" style="--d:${(i % 2) * 100}ms" href="${p.url}" target="_blank" rel="noopener noreferrer">
        ${media}
        <div class="project-body">
          <div class="project-top">
            <h3 class="project-name">${p.name}</h3>
            <span class="project-arrow" aria-hidden="true">↗</span>
          </div>
          <p class="project-desc">${p.description || "No description provided."}</p>
          <div class="project-meta">
            ${p.language ? `<span><span class="lang-dot"></span>${p.language}</span>` : ""}
            ${p.stars != null ? `<span>★ ${p.stars}</span>` : ""}
          </div>
        </div>
      </a>`;
  }

  function renderProjects(items) {
    const root = $("[data-projects]");
    if (!root) return;
    root.innerHTML = items.map(projectCard).join("");
  }

  async function fetchGithubProjects(username, featured = []) {
    if (!username) return null;
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=100`,
        { headers: { Accept: "application/vnd.github+json" } }
      );
      if (!res.ok) return null;
      const repos = await res.json();
      const pool = repos.filter((r) => !r.fork && !r.archived);
      // curated list from portfolio.json wins; fall back to stars/recency
      const picked = featured.length
        ? featured
            .map((name) => pool.find((r) => r.name.toLowerCase() === name.toLowerCase()))
            .filter(Boolean)
        : pool
            .sort((a, b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at) - new Date(a.updated_at)))
            .slice(0, 6);
      return picked
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
    const live = await fetchGithubProjects(data.github.username, data.github.featured || []);
    renderProjects(live && live.length ? live : data.github.fallbackProjects);
  }

  function renderCaseStudy(data) {
    const root = $("[data-casestudy]");
    const cs = data.caseStudy;
    if (!root || !cs) {
      const section = document.getElementById("casestudy");
      if (section && !cs) section.remove();
      return;
    }
    const blocks = (cs.blocks || [])
      .map(
        (b, i) => `
        <div class="case-block reveal" style="--d:${i * 110}ms">
          <span class="case-block-label">${b.label}</span>
          <p>${b.text}</p>
        </div>`
      )
      .join("");
    const stack = (cs.stack || [])
      .map((s) => `<span class="tag">${s}</span>`)
      .join("");
    root.innerHTML = `
      <div class="case-media reveal">
        <a href="${cs.url}" target="_blank" rel="noopener noreferrer" aria-label="View ${cs.name} on GitHub">
          <img src="${cs.image}" alt="Preview of ${cs.name}" loading="lazy"
               onerror="this.closest('.case-media').remove()" />
        </a>
      </div>
      <div class="case-content">
        <h3 class="case-name reveal">${cs.name}</h3>
        <p class="case-tagline serif reveal" style="--d:60ms">${cs.tagline}</p>
        <p class="case-intro reveal" style="--d:120ms">${cs.intro}</p>
        ${blocks}
        <div class="case-foot reveal" style="--d:200ms">
          <div class="case-stack">${stack}</div>
          <a class="btn btn-line magnetic" href="${cs.url}" target="_blank" rel="noopener noreferrer">
            View on GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>`;
  }

  /* ---------- effects ---------- */

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
      { rootMargin: "0px 0px -60px 0px", threshold: 0.05 }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  }

  /* split hero name into per-letter spans for the staggered entrance */
  function setupSplit() {
    $$(".split").forEach((el) => {
      const text = el.textContent;
      el.innerHTML = text
        .split("")
        .map((ch, i) => (ch === " " ? " " : `<span class="ch" style="--ci:${i}">${ch}</span>`))
        .join("");
    });
  }

  /* decode/scramble effect on section labels when they scroll into view */
  function setupScramble() {
    const CHARS = "!<>-_/[]{}=+*^?#abcdefghijklmnop";
    const run = (el) => {
      const target = el.textContent;
      if (REDUCED_MOTION) return;
      let frame = 0;
      const total = Math.max(14, target.length * 2);
      const tick = () => {
        frame++;
        const settled = Math.floor((frame / total) * target.length);
        el.textContent = target
          .split("")
          .map((ch, i) =>
            i < settled || ch === " " || ch === "/"
              ? ch
              : CHARS[Math.floor(Math.random() * CHARS.length)]
          )
          .join("");
        if (settled < target.length) requestAnimationFrame(tick);
        else el.textContent = target;
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    $$(".scramble").forEach((el) => io.observe(el));
  }

  /* animated counters in the stats row */
  function setupCounters() {
    const animate = (el) => {
      const target = Number(el.dataset.target) || 0;
      const suffix = el.dataset.suffix || "";
      if (REDUCED_MOTION) {
        el.textContent = `${target}${suffix}`;
        return;
      }
      const start = performance.now();
      const dur = 1300;
      const tick = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    $$(".stat-value").forEach((el) => io.observe(el));
  }

  /* infinite marquee built from skill names (two copies for a seamless loop) */
  function setupMarquee(data) {
    const track = $("[data-marquee]");
    if (!track) return;
    const half = data.skills
      .map((s) => `<span class="marquee-item">${s.name}</span><span class="marquee-sep">✦</span>`)
      .join("");
    track.innerHTML = `<span class="marquee-half">${half}</span><span class="marquee-half">${half}</span>`;
  }

  /* custom cursor: instant dot + lerped trailing ring, desktop only */
  function setupCursor() {
    const dot = $(".cursor-dot");
    const ring = $(".cursor-ring");
    if (!dot || !ring || !FINE_POINTER || REDUCED_MOTION) {
      if (dot) dot.remove();
      if (ring) ring.remove();
      return;
    }
    document.documentElement.classList.add("has-cursor");
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    document.addEventListener("pointermove", (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    });
    (function loop() {
      rx += (x - rx) * 0.16;
      ry += (y - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest("a, button")) document.documentElement.classList.add("cursor-on");
    });
    document.addEventListener("pointerout", (e) => {
      if (e.target.closest("a, button")) document.documentElement.classList.remove("cursor-on");
    });
  }

  /* buttons gently follow the cursor */
  function setupMagnetic() {
    if (!FINE_POINTER || REDUCED_MOTION) return;
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
      });
      el.addEventListener("pointerleave", () => {
        el.style.transform = "";
      });
    });
  }

  function setupParallax() {
    if (REDUCED_MOTION) return;
    const els = $$("[data-parallax]");
    if (!els.length) return;
    let raf = 0;
    window.addEventListener(
      "scroll",
      () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          els.forEach((el) => {
            const speed = Number(el.dataset.speed) || 0.2;
            el.style.transform = `translateY(${window.scrollY * speed}px)`;
          });
        });
      },
      { passive: true }
    );
  }

  /* local time (Berlin) in nav + footer */
  function setupTime() {
    const els = $$("[data-time]");
    if (!els.length) return;
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Berlin",
      hour: "2-digit",
      minute: "2-digit",
    });
    const update = () => els.forEach((el) => (el.textContent = fmt.format(new Date())));
    update();
    setInterval(update, 15000);
  }

  /* scroll progress bar + nav state + back-to-top, one passive listener */
  function setupScrollEffects() {
    const bar = $(".scroll-progress");
    const nav = $(".nav");
    const toTop = $(".to-top");
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      if (nav) nav.classList.toggle("scrolled", y > 10);
      if (toTop) toTop.classList.toggle("show", y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (toTop) {
      toTop.addEventListener("click", () =>
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" })
      );
    }
  }

  function setupActiveNav() {
    const links = $$('.nav-links a[href^="#"]');
    const byId = new Map(links.map((l) => [l.getAttribute("href").slice(1), l]));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          const link = byId.get(en.target.id);
          if (!link) return;
          links.forEach((l) => l.classList.remove("active"));
          link.classList.add("active");
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    $$("main section[id]").forEach((s) => io.observe(s));
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

  /* intro curtain; body.loaded gates the hero entrance animations */
  function setupPreloader() {
    const pre = $(".preloader");
    const finish = () => {
      document.body.classList.add("loaded");
      if (pre) {
        pre.classList.add("done");
        setTimeout(() => pre.remove(), 1200);
      }
    };
    if (!pre || REDUCED_MOTION) {
      if (pre) pre.remove();
      document.body.classList.add("loaded");
      return;
    }
    setTimeout(finish, 900);
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
    setupPreloader();

    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const data = await loadData();
    if (data) {
      bindStaticFields(data);
      renderSocials(data);
      renderTimeline(data);
      renderSkills(data);
      renderStats(data);
      renderCaseStudy(data);
      renderCertifications(data);
      setupMarquee(data);
      await loadProjects(data);
    }

    // effects attach to rendered elements, so they run after the renderers
    setupSplit();
    setupReveal();
    setupScramble();
    setupCounters();
    setupCursor();
    setupMagnetic();
    setupParallax();
    setupTime();
    setupScrollEffects();
    setupActiveNav();
    setupNav();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
