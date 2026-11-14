// Generador estático de Leonida Hoy. Sin dependencias: `node scripts/build.mjs`.
// Lee site.config.json + content/ y escribe la web completa en _site/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(ROOT, process.env.OUT_DIR || "_site");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
if (process.env.SITE_URL) cfg.siteUrl = process.env.SITE_URL;
if (process.env.ADSENSE_CLIENT) cfg.adsense.client = process.env.ADSENSE_CLIENT;

const SITE = cfg.siteUrl.replace(/\/$/, "");
const BASE = new URL(SITE + "/").pathname.replace(/\/$/, ""); // "/GTAVI-INFO" o ""
const ADS = cfg.adsense?.client?.trim() || "";
const GA = cfg.analytics?.ga4?.trim() || "";
const BUILD_TIME = new Date().toISOString();

// ---------- utilidades ----------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const u = (p = "/") => BASE + p; // ruta interna
const abs = (p = "/") => SITE + p; // URL absoluta
const fmtDate = (iso, opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) => {
  const s = new Intl.DateTimeFormat("es-ES", { ...opts, timeZone: "UTC" }).format(new Date(iso + "T12:00:00Z"));
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const write = (rel, content) => {
  const file = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const fail = (msg) => {
  console.error("✗ " + msg);
  process.exit(1);
};

// ---------- contenido ----------
const briefDir = path.join(ROOT, "content/briefs");
const briefs = fs
  .readdirSync(briefDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(briefDir, f), "utf8")))
  .sort((a, b) => b.date.localeCompare(a.date));
const guide = JSON.parse(fs.readFileSync(path.join(ROOT, "content/guide.json"), "utf8"));

for (const b of briefs) {
  const where = `content/briefs/${b.date}.json`;
  if (!b.title || !b.summary) fail(`${where}: faltan title/summary`);
  if (!Array.isArray(b.stories) || b.stories.length < 1) fail(`${where}: sin historias`);
  b.stories.forEach((s, i) => {
    if (!s.title || !s.change) fail(`${where}: historia ${i + 1} sin title/change`);
    if (!s.sources?.length) fail(`${where}: historia ${i + 1} sin fuente (regla: nada sin fuente)`);
    s.sources.forEach((src) => /^https?:\/\//.test(src.url) || fail(`${where}: URL inválida ${src.url}`));
  });
}
if (!briefs.length) fail("No hay resúmenes en content/briefs/");
const latest = briefs[0];

// ---------- piezas comunes ----------
const icon = {
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7.1 4.2H5.1l11.9 16Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/></svg>',
  tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 9h10v12H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M9 7h8v8"/></svg>',
  rss: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 10a11 11 0 0 1 11 11h-3a8 8 0 0 0-8-8v-3Zm0-6a17 17 0 0 1 17 17h-3A14 14 0 0 0 3 7V4Z"/></svg>',
};
const markSvg = fs
  .readFileSync(path.join(ROOT, "assets/logo-mark.svg"), "utf8")
  .replace(/ id="lh-/g, ' id="m-lh-')
  .replace(/url\(#lh-/g, "url(#m-lh-")
  .replace("<svg ", '<svg class="mark" aria-hidden="true" ')
  .replace(/ role="img" aria-label="[^"]*"/, "");

const shareLinks = (text, url) => {
  const t = encodeURIComponent(text);
  const full = encodeURIComponent(`${text} ${url}`);
  return `
    <a class="share share--x" href="https://x.com/intent/post?text=${t}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="Compartir en X">${icon.x}</a>
    <a class="share share--wa" href="https://wa.me/?text=${full}" target="_blank" rel="noopener" aria-label="Compartir por WhatsApp">${icon.wa}</a>
    <a class="share share--tg" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${t}" target="_blank" rel="noopener" aria-label="Compartir en Telegram">${icon.tg}</a>`;
};

const adUnit = (name, extra = "") => {
  const slot = cfg.adsense?.slots?.[name];
  if (!ADS || !slot) return ""; // sin slot manual: Auto ads coloca los anuncios
  return `<aside class="ad ad--${name} ${extra}" aria-label="Publicidad"><span class="ad__label">Publicidad</span>
    <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ADS)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
};

const countdown = (size = "lg") => `
  <div class="countdown countdown--${size}" data-countdown="${esc(cfg.launchDate)}" role="timer" aria-live="off">
    <div class="countdown__label">Faltan para GTA VI</div>
    <div class="countdown__grid">
      <div><b data-unit="d">–</b><span>días</span></div>
      <div><b data-unit="h">–</b><span>horas</span></div>
      <div><b data-unit="m">–</b><span>min</span></div>
      <div><b data-unit="s">–</b><span>seg</span></div>
    </div>
    <div class="countdown__done" hidden>¡GTA VI ya está disponible! 🌴</div>
  </div>`;

const header = (active) => {
  const nav = [
    ["/", "Hoy", "home"],
    ["/guia/", "Guía", "guia"],
    ["/archivo/", "Archivo", "archivo"],
    ["/acerca/", "Acerca", "acerca"],
  ];
  return `
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="${u("/")}" aria-label="${esc(cfg.name)}, inicio">
        ${markSvg}
        <span class="brand__text"><span class="brand__name">LEONIDA<em>HOY</em></span><span class="brand__tag">${esc(cfg.tagline)}</span></span>
      </a>
      <nav class="nav" aria-label="Principal">
        ${nav.map(([href, label, key]) => `<a href="${u(href)}"${key === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <div class="pill-count" data-countdown-mini="${esc(cfg.launchDate)}" aria-hidden="true"><span class="dot"></span><span data-mini>GTA VI · 19 nov</span></div>
    </div>
  </header>`;
};

const footer = () => {
  const soc = Object.entries(cfg.social || {}).filter(([, v]) => v);
  return `
  <footer class="site-footer">
    <div class="wrap site-footer__inner">
      <div>
        <a class="brand brand--sm" href="${u("/")}">${markSvg}<span class="brand__name">LEONIDA<em>HOY</em></span></a>
        <p class="muted small">Web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive. Grand Theft Auto y GTA son marcas de sus respectivos propietarios.</p>
      </div>
      <nav class="footer-nav" aria-label="Pie">
        <a href="${u("/guia/")}">Guía GTA VI</a>
        <a href="${u("/archivo/")}">Archivo</a>
        <a href="${u("/acerca/")}">Acerca y normas</a>
        <a href="${u("/privacidad/")}">Privacidad y cookies</a>
        <a href="${u("/feed.xml")}" class="rss">${icon.rss} RSS</a>
        ${soc.map(([k, v]) => `<a href="${esc(v)}" rel="me noopener" target="_blank">${esc(k === "x" ? "X" : k.charAt(0).toUpperCase() + k.slice(1))}</a>`).join("")}
      </nav>
    </div>
  </footer>`;
};

const layout = ({ title, description, pathName, body, active, type = "website", jsonLd = [], published, image = "/assets/og.png" }) => {
  const canonical = abs(pathName);
  const fullTitle = title === cfg.name ? `${cfg.name} · ${cfg.tagline}` : `${title} · ${cfg.name}`;
  return `<!doctype html>
<html lang="${cfg.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="theme-color" content="#0e0722">
<meta name="color-scheme" content="dark">
<meta property="og:site_name" content="${esc(cfg.name)}">
<meta property="og:locale" content="${cfg.locale}">
<meta property="og:type" content="${type}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${abs(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
${published ? `<meta property="article:published_time" content="${published}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${abs(image)}">
<link rel="icon" href="${u("/assets/favicon.svg")}" type="image/svg+xml">
<link rel="icon" href="${u("/assets/icon-192.png")}" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="${u("/assets/apple-touch-icon.png")}">
<link rel="manifest" href="${u("/manifest.webmanifest")}">
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.name)}" href="${u("/feed.xml")}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap">
<link rel="stylesheet" href="${u("/assets/styles.css")}?v=${BUILD_TIME.slice(0, 10)}">
${ADS ? `<meta name="google-adsense-account" content="${esc(ADS)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(ADS)}" crossorigin="anonymous"></script>` : ""}
${GA ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(GA)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(GA)}');</script>` : ""}
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<a class="skip" href="#main">Saltar al contenido</a>
${header(active)}
<main id="main">
${body}
</main>
${footer()}
<script src="${u("/assets/app.js")}?v=${BUILD_TIME.slice(0, 10)}" defer></script>
</body>
</html>
`;
};

const publisher = {
  "@type": "Organization",
  name: cfg.name,
  url: abs("/"),
  logo: { "@type": "ImageObject", url: abs("/assets/icon-512.png"), width: 512, height: 512 },
};

const sourcesHtml = (sources) =>
  `<div class="sources"><span>Fuente${sources.length > 1 ? "s" : ""}:</span> ${sources
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}${icon.ext}</a>`)
    .join(" ")}</div>`;

// ---------- página de un resumen ----------
const briefBody = (b, { isHome }) => {
  const pagePath = `/resumen/${b.date}/`;
  const pageUrl = abs(pagePath);
  const big = b.stories[b.biggest ?? 0];
  const idx = briefs.indexOf(b);
  const newer = briefs[idx - 1];
  const older = briefs[idx + 1];

  const stories = b.stories
    .map(
      (s, i) => `
      <article class="story${i === (b.biggest ?? 0) ? " story--big" : ""}" id="h${i + 1}">
        <div class="story__num">${String(i + 1).padStart(2, "0")}</div>
        <div class="story__body">
          <div class="story__meta"><span class="tag">${esc(s.tag || "Noticia")}</span>${i === (b.biggest ?? 0) ? '<span class="tag tag--hot">La más grande</span>' : ""}</div>
          <h3 class="story__title">${esc(s.title)}</h3>
          <p class="story__text" data-aud="fans"><strong>Qué cambió:</strong> ${esc(s.change)}</p>
          <p class="story__text" data-aud="nuevos"><strong>En corto:</strong> ${esc(s.plain || s.change)}</p>
          ${sourcesHtml(s.sources)}
        </div>
      </article>${i === 1 ? adUnit("inFeed") : ""}`
    )
    .join("");

  const posts = (b.posts || [])
    .map(
      (p, i) => `
      <figure class="post">
        <figcaption class="post__head"><span class="post__n">Post ${i + 1}</span><span class="post__chars">${[...p].length} caracteres</span></figcaption>
        <blockquote class="post__text" id="post-${b.date}-${i}">${esc(p)}</blockquote>
        <div class="post__actions">
          <button class="btn btn--ghost" type="button" data-copy="#post-${b.date}-${i}">${icon.copy}<span>Copiar</span></button>
          ${shareLinks(p, pageUrl)}
        </div>
      </figure>`
    )
    .join("");

  const context = (b.context || [])
    .map(
      (c) => `
      <li class="ctx">
        <time datetime="${c.date}">${esc(fmtDate(c.date, { day: "numeric", month: "short" }))}</time>
        <div><h4>${esc(c.title)}</h4><p>${esc(c.text)}</p>${sourcesHtml(c.sources)}</div>
      </li>`
    )
    .join("");

  const facts = guide.facts
    .slice(0, 4)
    .map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`)
    .join("");

  const archive = briefs
    .slice(0, 6)
    .map(
      (x) =>
        `<li><a href="${u(`/resumen/${x.date}/`)}"${x === b ? ' aria-current="page"' : ""}><time datetime="${x.date}">${esc(fmtDate(x.date, { day: "numeric", month: "short" }))}</time><span>${esc(x.title)}</span></a></li>`
    )
    .join("");

  const HeadingTag = isHome ? "h1" : "h1";
  return `
  <section class="hero">
    <div class="hero__sky" aria-hidden="true"></div>
    <div class="wrap hero__inner">
      <div class="hero__copy">
        <p class="eyebrow"><time datetime="${b.date}">${esc(fmtDate(b.date))}</time> · Resumen matutino</p>
        <${HeadingTag} class="hero__title">${esc(b.title)}</${HeadingTag}>
        <p class="hero__lead">${esc(b.lead || b.summary)}</p>
        <div class="hero__share">${shareLinks(`${b.title} — las 5 noticias de GTA VI de hoy`, pageUrl)}
          <button class="btn btn--ghost" type="button" data-native-share data-title="${esc(b.title)}" data-url="${pageUrl}">Compartir</button></div>
      </div>
      ${countdown("lg")}
    </div>
  </section>

  <div class="wrap">${adUnit("top")}</div>

  <div class="wrap layout">
    <div class="col-main">
      <section class="block" aria-labelledby="top5">
        <div class="block__head">
          <h2 id="top5">Las 5 que importan hoy</h2>
          <div class="aud-toggle" role="group" aria-label="Elige tu nivel">
            <button type="button" data-aud-btn="fans" aria-pressed="true">Sigo cada update</button>
            <button type="button" data-aud-btn="nuevos" aria-pressed="false">Soy nuevo</button>
          </div>
        </div>
        <p class="rules muted small">Solo historias de las últimas 24 horas · nada de rumores sin fuente con nombre · enlace bajo cada noticia.</p>
        <div class="stories">${stories}</div>
      </section>

      ${
        posts
          ? `<section class="block" aria-labelledby="posts">
        <div class="block__head"><h2 id="posts">Listo para publicar</h2></div>
        <p class="muted">Tres publicaciones cortas sobre la historia más grande del día — <em>${esc(big.title)}</em>. Cópialas o compártelas con un toque.</p>
        <div class="posts">${posts}</div>
      </section>`
          : ""
      }
      ${adUnit("bottom")}
      ${
        context
          ? `<section class="block" aria-labelledby="ctx">
        <div class="block__head"><h2 id="ctx">Contexto de la semana</h2></div>
        <p class="muted small">Noticias de días anteriores que siguen marcando la conversación.</p>
        <ul class="ctx-list">${context}</ul>
      </section>`
          : ""
      }

      <nav class="pager" aria-label="Otros días">
        ${older ? `<a href="${u(`/resumen/${older.date}/`)}">← ${esc(fmtDate(older.date, { day: "numeric", month: "long" }))}</a>` : "<span></span>"}
        ${newer ? `<a href="${u(`/resumen/${newer.date}/`)}">${esc(fmtDate(newer.date, { day: "numeric", month: "long" }))} →</a>` : ""}
      </nav>
    </div>

    <aside class="col-side">
      <div class="card">
        <h2 class="card__title">GTA VI en 10 segundos</h2>
        <ul class="facts">${facts}</ul>
        <a class="btn btn--primary btn--block" href="${u("/guia/")}">Guía completa y preguntas frecuentes</a>
      </div>
      ${adUnit("sidebar", "ad--sticky")}
      <div class="card">
        <h2 class="card__title">Resúmenes anteriores</h2>
        <ul class="mini-archive">${archive}</ul>
        <a class="link" href="${u("/archivo/")}">Ver archivo completo →</a>
      </div>
      <div class="card card--cta">
        <h2 class="card__title">Cada mañana, a las 7:00</h2>
        <p class="small">Guarda la web en tu pantalla de inicio o suscríbete por RSS para no perderte ningún resumen.</p>
        <a class="btn btn--ghost btn--block" href="${u("/feed.xml")}">${icon.rss} Suscribirme por RSS</a>
      </div>
    </aside>
  </div>`;
};

const briefJsonLd = (b) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: b.title,
  description: b.summary,
  inLanguage: "es",
  datePublished: `${b.date}T07:00:00+01:00`,
  dateModified: BUILD_TIME,
  mainEntityOfPage: abs(`/resumen/${b.date}/`),
  image: [abs("/assets/og.png")],
  author: { "@type": "Organization", name: cfg.name, url: abs("/acerca/") },
  publisher,
  about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
  citation: b.stories.flatMap((s) => s.sources.map((x) => x.url)),
});

// ---------- construir ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });

// Inicio
write(
  "index.html",
  layout({
    title: cfg.name,
    description: `${latest.summary} ${cfg.description}`.slice(0, 300),
    pathName: "/",
    active: "home",
    body: briefBody(latest, { isHome: true }),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: cfg.name,
        url: abs("/"),
        inLanguage: "es",
        description: cfg.description,
        publisher,
      },
      briefJsonLd(latest),
    ],
  })
);

// Un resumen por día
for (const b of briefs) {
  write(
    `resumen/${b.date}/index.html`,
    layout({
      title: b.title,
      description: b.summary,
      pathName: `/resumen/${b.date}/`,
      active: "archivo",
      type: "article",
      published: `${b.date}T07:00:00+01:00`,
      body: briefBody(b, { isHome: false }),
      jsonLd: [briefJsonLd(b)],
    })
  );
}

// Archivo
write(
  "archivo/index.html",
  layout({
    title: "Archivo de resúmenes de GTA VI",
    description: "Todos los resúmenes matutinos de GTA VI, día a día, con sus fuentes.",
    pathName: "/archivo/",
    active: "archivo",
    body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">Archivo</p><h1>Todos los resúmenes</h1><p class="muted">Un resumen cada mañana. Cada noticia lleva su fuente enlazada.</p></div></section>
  <div class="wrap narrow">
    <ol class="archive">
      ${briefs
        .map(
          (b) => `<li><a href="${u(`/resumen/${b.date}/`)}">
        <time datetime="${b.date}">${esc(fmtDate(b.date))}</time>
        <h2>${esc(b.title)}</h2><p>${esc(b.summary)}</p></a></li>`
        )
        .join("")}
    </ol>
    ${adUnit("bottom")}
  </div>`,
  })
);

// Guía (SEO evergreen: "cuándo sale gta 6", "precio gta 6", etc.)
write(
  "guia/index.html",
  layout({
    title: guide.title,
    description: guide.description,
    pathName: "/guia/",
    active: "guia",
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: guide.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
    body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">Guía · actualizada el ${esc(fmtDate(guide.updated, { day: "numeric", month: "long", year: "numeric" }))}</p><h1>${esc(guide.title)}</h1><p class="muted">${esc(guide.description)}</p></div></section>
  <div class="wrap layout">
    <div class="col-main">
      <ul class="fact-grid">${guide.facts.map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`).join("")}</ul>
      ${adUnit("top")}
      <section class="block" aria-labelledby="faq"><div class="block__head"><h2 id="faq">Preguntas frecuentes</h2></div>
        <div class="faq">
        ${guide.faq
          .map(
            (f, i) => `<details${i < 2 ? " open" : ""}><summary>${esc(f.q)}</summary><div class="faq__a"><p>${esc(f.a)}</p>${sourcesHtml(f.sources)}</div></details>`
          )
          .join("")}
        </div>
      </section>
      ${adUnit("bottom")}
    </div>
    <aside class="col-side">
      <div class="card">${countdown("sm")}</div>
      ${adUnit("sidebar", "ad--sticky")}
      <div class="card card--cta"><h2 class="card__title">Lo último</h2><p class="small">${esc(latest.title)}</p><a class="btn btn--primary btn--block" href="${u("/")}">Leer el resumen de hoy</a></div>
    </aside>
  </div>`,
  })
);

// Acerca
write(
  "acerca/index.html",
  layout({
    title: "Acerca de Leonida Hoy y normas editoriales",
    description: "Quiénes somos, cómo elegimos las noticias de GTA VI y cómo contactar.",
    pathName: "/acerca/",
    active: "acerca",
    body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">Acerca</p><h1>Leonida Hoy</h1><p class="muted">${esc(cfg.description)}</p></div></section>
  <div class="wrap narrow prose">
    <h2>Qué hacemos</h2>
    <p>Cada mañana leemos la actualidad de GTA VI y nos quedamos con las cinco historias que de verdad importan. Una línea por noticia, qué cambió y un enlace a la fuente original. Sin relleno.</p>
    <h2>Nuestras normas</h2>
    <ul>
      <li><strong>Últimas 24 horas.</strong> El resumen del día solo incluye historias recientes. Lo anterior va en «Contexto de la semana», con su fecha.</li>
      <li><strong>Nada de rumores sin fuente con nombre.</strong> Si nadie identificable lo publica, no sale aquí.</li>
      <li><strong>Enlace bajo cada historia.</strong> Siempre puedes leer el original.</li>
      <li><strong>Las estimaciones se marcan como estimaciones.</strong> Las cifras de terceros nunca se presentan como oficiales.</li>
    </ul>
    <h2>Dos niveles de lectura</h2>
    <p>Usa el selector «Sigo cada update / Soy nuevo»: los fans ven el detalle técnico y quien acaba de llegar ve la explicación en palabras simples.</p>
    <h2>Contacto y correcciones</h2>
    <p>¿Ves un error o tienes una pista con fuente? Abre una incidencia en el <a href="https://github.com/RickyJCV/GTAVI-INFO/issues" rel="noopener" target="_blank">repositorio del proyecto</a>. Corregimos rápido y lo indicamos.</p>
    <h2>Aviso</h2>
    <p>Leonida Hoy es una web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive.</p>
  </div>`,
  })
);

// Privacidad (necesaria para AdSense)
write(
  "privacidad/index.html",
  layout({
    title: "Política de privacidad y cookies",
    description: "Cómo usa Leonida Hoy las cookies y la publicidad de Google AdSense.",
    pathName: "/privacidad/",
    active: "",
    body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">Legal</p><h1>Privacidad y cookies</h1><p class="muted">Última actualización: ${esc(fmtDate(BUILD_TIME.slice(0, 10), { day: "numeric", month: "long", year: "numeric" }))}</p></div></section>
  <div class="wrap narrow prose">
    <h2>Datos que recogemos</h2>
    <p>No pedimos registro ni guardamos datos personales en nuestros servidores. La web es estática y está alojada en GitHub Pages, que puede registrar datos técnicos de acceso (como la dirección IP) por motivos de seguridad.</p>
    <h2>Preferencias locales</h2>
    <p>Guardamos en tu navegador (localStorage) tu elección de nivel de lectura. No sale de tu dispositivo.</p>
    <h2>Publicidad</h2>
    <p>Esta web puede mostrar anuncios de Google AdSense. Google y sus socios usan cookies para mostrar anuncios basados en tus visitas a esta y otras webs. Puedes desactivar la publicidad personalizada en <a href="https://adssettings.google.com" target="_blank" rel="noopener">Configuración de anuncios de Google</a> y consultar <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">cómo usa Google los datos de las webs que usan sus servicios</a>.</p>
    <p>Si visitas la web desde el Espacio Económico Europeo, Reino Unido o Suiza, te pediremos tu consentimiento antes de usar cookies publicitarias, mediante una plataforma de gestión de consentimiento certificada por Google.</p>
    ${GA ? `<h2>Analítica</h2><p>Usamos Google Analytics para contar visitas de forma agregada.</p>` : ""}
    <h2>Enlaces externos</h2>
    <p>Cada noticia enlaza a su fuente original. Esas webs tienen sus propias políticas de privacidad.</p>
  </div>`,
  })
);

// 404
write(
  "404.html",
  layout({
    title: "Página no encontrada",
    description: "Esta página no existe.",
    pathName: "/404.html",
    active: "",
    body: `<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Error 404</p><h1>Te has salido del mapa</h1><p class="muted">Esta página no existe en Leonida.</p><p><a class="btn btn--primary" href="${u("/")}">Volver al resumen de hoy</a></p></div></section>`,
  }).replace('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">', '<meta name="robots" content="noindex">')
);

// Sitemap, RSS, robots, ads.txt, manifest
const urls = [
  ["/", latest.date, "daily", "1.0"],
  ["/guia/", guide.updated, "weekly", "0.9"],
  ["/archivo/", latest.date, "daily", "0.6"],
  ...briefs.map((b) => [`/resumen/${b.date}/`, b.date, "monthly", "0.8"]),
  ["/acerca/", latest.date, "yearly", "0.3"],
  ["/privacidad/", latest.date, "yearly", "0.2"],
];
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, d, f, pr]) => `  <url><loc>${abs(p)}</loc><lastmod>${d}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`).join("\n")}
</urlset>
`
);

const rfc822 = (d) => new Date(d + "T06:00:00Z").toUTCString();
write(
  "feed.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(cfg.name)} — ${esc(cfg.tagline)}</title>
  <link>${abs("/")}</link>
  <description>${esc(cfg.description)}</description>
  <language>es</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${abs("/feed.xml")}" rel="self" type="application/rss+xml"/>
${briefs
  .slice(0, 30)
  .map(
    (b) => `  <item>
    <title>${esc(b.title)}</title>
    <link>${abs(`/resumen/${b.date}/`)}</link>
    <guid isPermaLink="true">${abs(`/resumen/${b.date}/`)}</guid>
    <pubDate>${rfc822(b.date)}</pubDate>
    <description>${esc(
      `<p>${b.summary}</p><ol>${b.stories.map((s) => `<li><strong>${s.title}.</strong> ${s.change} <a href="${s.sources[0].url}">${s.sources[0].name}</a></li>`).join("")}</ol>`
    )}</description>
  </item>`
  )
  .join("\n")}
</channel>
</rss>
`
);

write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);
if (ADS) write("ads.txt", `google.com, ${ADS.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`);
write(
  "manifest.webmanifest",
  JSON.stringify(
    {
      name: `${cfg.name} · ${cfg.tagline}`,
      short_name: cfg.name,
      lang: "es",
      start_url: u("/"),
      scope: u("/"),
      display: "standalone",
      background_color: "#0e0722",
      theme_color: "#0e0722",
      icons: [
        { src: u("/assets/icon-192.png"), sizes: "192x192", type: "image/png" },
        { src: u("/assets/icon-512.png"), sizes: "512x512", type: "image/png" },
        { src: u("/assets/favicon.svg"), sizes: "any", type: "image/svg+xml" },
      ],
    },
    null,
    2
  )
);
write(".nojekyll", "");

console.log(`✓ ${briefs.length} resumen(es) · último ${latest.date} · ${ADS ? "AdSense ON" : "AdSense OFF (sin client)"} → ${path.relative(ROOT, OUT)}/`);
