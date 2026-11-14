// Generador estático de Leonida Hoy. Sin dependencias: `node scripts/build.mjs`.
// Lee site.config.json + content/ y escribe la web completa (español + inglés) en _site/.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { LOCALES } from "./i18n.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.resolve(ROOT, process.env.OUT_DIR || "_site");
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, "site.config.json"), "utf8"));
if (process.env.SITE_URL) cfg.siteUrl = process.env.SITE_URL;
if (process.env.ADSENSE_CLIENT) cfg.adsense.client = process.env.ADSENSE_CLIENT;

const SITE = cfg.siteUrl.replace(/\/$/, "");
const BASE = new URL(SITE + "/").pathname.replace(/\/$/, "");
const ADS = cfg.adsense?.client?.trim() || "";
const GA = cfg.analytics?.ga4?.trim() || "";
const BUILD_TIME = new Date().toISOString();
const ISSUES_URL = "https://github.com/leonidahoy/leonidahoy.github.io/issues";
// Versión de CSS/JS según su contenido: cada cambio obliga al navegador a descargarlos de nuevo.
const assetVer = (f) => crypto.createHash("sha1").update(fs.readFileSync(path.join(ROOT, "assets", f))).digest("hex").slice(0, 8);
const CSS_V = assetVer("styles.css");
const JS_V = assetVer("app.js");

// ---------- utilidades ----------
const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const u = (p = "/") => BASE + p;
const abs = (p = "/") => SITE + p;
const fmtDate = (L, iso, opts = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) => {
  const s = new Intl.DateTimeFormat(L.intl, { ...opts, timeZone: "UTC" }).format(new Date(iso + "T12:00:00Z"));
  return s.charAt(0).toUpperCase() + s.slice(1);
};
const write = (rel, content) => {
  const file = path.join(OUT, rel.replace(/^\//, ""), rel.endsWith("/") ? "index.html" : "");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};
const fail = (msg) => {
  console.error("✗ " + msg);
  process.exit(1);
};

// ---------- contenido ----------
const briefDir = path.join(ROOT, "content/briefs");
const rawBriefs = fs
  .readdirSync(briefDir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .map((f) => JSON.parse(fs.readFileSync(path.join(briefDir, f), "utf8")))
  .sort((a, b) => b.date.localeCompare(a.date));
if (!rawBriefs.length) fail("No hay resúmenes en content/briefs/");

const validate = (b, where) => {
  if (!b.title || !b.summary) fail(`${where}: faltan title/summary`);
  if (!Array.isArray(b.stories) || b.stories.length < 1) fail(`${where}: sin historias`);
  b.stories.forEach((s, i) => {
    if (!s.title || !s.change) fail(`${where}: historia ${i + 1} sin title/change`);
    if (!s.sources?.length) fail(`${where}: historia ${i + 1} sin fuente (regla: nada sin fuente)`);
    s.sources.forEach((src) => /^https?:\/\//.test(src.url) || fail(`${where}: URL inválida ${src.url}`));
  });
};

// Versión de un resumen en un idioma: español = campos principales; otro idioma = bloque `<código>`
// con los textos traducidos (las fuentes y fechas se reutilizan del original).
const localize = (b, code) => {
  if (code === "es") return b;
  const tr = b[code];
  if (!tr) return null;
  const out = {
    ...b,
    title: tr.title,
    summary: tr.summary,
    lead: tr.lead,
    stories: b.stories.map((s, i) => ({ ...s, ...(tr.stories?.[i] || {}), sources: s.sources })),
    posts: tr.posts || [],
    context: (b.context || []).map((c, i) => ({ ...c, ...(tr.context?.[i] || {}), sources: c.sources, date: c.date })),
  };
  if (tr.stories && tr.stories.length !== b.stories.length) fail(`content/briefs/${b.date}.json: «${code}.stories» no tiene las mismas historias`);
  return out;
};

const DATA = {};
for (const code of Object.keys(LOCALES)) {
  const briefs = rawBriefs.map((b) => localize(b, code)).filter(Boolean);
  briefs.forEach((b) => validate(b, `content/briefs/${b.date}.json [${code}]`));
  const gfile = path.join(ROOT, code === "es" ? "content/guide.json" : `content/guide.${code}.json`);
  const guide = fs.existsSync(gfile) ? JSON.parse(fs.readFileSync(gfile, "utf8")) : null;
  DATA[code] = { briefs, guide, dates: new Set(briefs.map((b) => b.date)) };
}
const ACTIVE = Object.keys(LOCALES).filter((c) => DATA[c].briefs.length && DATA[c].guide);

// Equivalencias entre idiomas: clave de página → ruta en cada idioma (si existe)
const counterparts = (key) => {
  const out = {};
  for (const code of ACTIVE) {
    const P = LOCALES[code].paths;
    if (key.startsWith("brief:")) {
      const d = key.slice(6);
      if (DATA[code].dates.has(d)) out[code] = P.brief(d);
    } else if (P[key]) out[code] = P[key];
  }
  return out;
};

// ---------- piezas comunes ----------
const icon = {
  x: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.2 2.3h3.4l-7.4 8.4 8.7 11.5h-6.8l-5.3-7-6.1 7H1.3l7.9-9L.9 2.3h7l4.8 6.4 5.5-6.4Zm-1.2 17.9h1.9L7.1 4.2H5.1l11.9 16Z"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.2-.2-.5-.3Z"/></svg>',
  tg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L6.5 13.2l-4.7-1.5c-1-.3-1-1 .2-1.5L20.5 3c.9-.3 1.6.2 1.4 1.3Z"/></svg>',
  copy: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M9 9h10v12H9zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>',
  ext: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M9 7h8v8"/></svg>',
  rss: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4ZM3 10a11 11 0 0 1 11 11h-3a8 8 0 0 0-8-8v-3Zm0-6a17 17 0 0 1 17 17h-3A14 14 0 0 0 3 7V4Z"/></svg>',
  globe: '<svg viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.8 3.8 5.8 3.8 9s-1.2 6.2-3.8 9c-2.6-2.8-3.8-5.8-3.8-9S9.4 5.8 12 3Z"/></g></svg>',
};
const markSvg = fs
  .readFileSync(path.join(ROOT, "assets/logo-mark.svg"), "utf8")
  .replace(/ id="lh-/g, ' id="m-lh-')
  .replace(/url\(#lh-/g, "url(#m-lh-")
  .replace(/href="#lh-/g, 'href="#m-lh-')
  .replace("<svg ", '<svg class="mark" aria-hidden="true" ')
  .replace(/ role="img" aria-label="[^"]*"/, "");

const palmSvg = (cls) =>
  `<svg class="hero__palm ${cls}" viewBox="-30 -26 60 120" aria-hidden="true"><path d="M-1.6 0 C1 14 3.4 28 4 94 L8.2 94 C7.6 28 4.6 13 1.9 -.6 Z"/><path d="M0 0 C-8 -6 -18 -4 -25 4.5 C-17 -1 -9 -1 0 2.2 Z"/><path d="M0 0 C-6 -10 -15.5 -13.5 -23 -10.5 C-13.5 -9 -7 -5 0 1.2 Z"/><path d="M0 0 C-3 -9 -2 -16.5 2.4 -21.5 C0 -14 .6 -7 1.2 1 Z"/><path d="M0 0 C8 -9.5 18.5 -9.5 25 -3 C16.5 -5.2 9 -3 1 2 Z"/><path d="M0 0 C9.5 -3 18 2 22 10.5 C14.5 4.2 8 2 0 2.6 Z"/><circle cx=".6" cy="2.4" r="1.7"/><circle cx="-1.6" cy="1.6" r="1.4"/></svg>`;

const shareLinks = (L, text, url) => {
  const t = encodeURIComponent(text);
  const full = encodeURIComponent(`${text} ${url}`);
  return `
    <a class="share share--x" href="https://x.com/intent/post?text=${t}&url=${encodeURIComponent(url)}" target="_blank" rel="noopener" aria-label="${esc(L.t.shareOn("X"))}">${icon.x}</a>
    <a class="share share--wa" href="https://wa.me/?text=${full}" target="_blank" rel="noopener" aria-label="${esc(L.t.shareWa)}">${icon.wa}</a>
    <a class="share share--tg" href="https://t.me/share/url?url=${encodeURIComponent(url)}&text=${t}" target="_blank" rel="noopener" aria-label="${esc(L.t.shareOn("Telegram"))}">${icon.tg}</a>`;
};

const adUnit = (L, name, extra = "") => {
  const slot = cfg.adsense?.slots?.[name];
  if (!ADS || !slot) return ""; // sin slot manual: Auto ads coloca los anuncios
  return `<aside class="ad ad--${name} ${extra}" aria-label="${esc(L.t.ads)}"><span class="ad__label">${esc(L.t.ads)}</span>
    <ins class="adsbygoogle" style="display:block" data-ad-client="${esc(ADS)}" data-ad-slot="${esc(slot)}" data-ad-format="auto" data-full-width-responsive="true"></ins></aside>`;
};

const countdown = (L, size = "lg") => `
  <div class="countdown countdown--${size}" data-countdown="${esc(cfg.launchDate)}" role="timer" aria-live="off">
    <div class="countdown__label">${esc(L.t.cdLabel)}</div>
    <div class="countdown__grid">
      ${["d", "h", "m", "s"].map((k, i) => `<div><b data-unit="${k}">–</b><span>${esc(L.t.cdUnits[i])}</span></div>`).join("")}
    </div>
    <div class="countdown__done" hidden>${esc(L.t.cdDone)}</div>
  </div>`;

const langSwitch = (L, alts) => `
      <nav class="lang" aria-label="${esc(L.t.langSwitch)}">${icon.globe}
        ${ACTIVE.map((code) => {
          const href = alts[code] || LOCALES[code].paths.home;
          const cur = code === L.code;
          return `<a href="${u(href)}" hreflang="${code}" lang="${code}" data-lang="${code}"${cur ? ' aria-current="true"' : ""}>${LOCALES[code].label}</a>`;
        }).join("")}
      </nav>`;

const header = (L, active, alts) => {
  const P = L.paths;
  const nav = [
    [P.home, L.t.nav.home, "home"],
    [P.guide, L.t.nav.guide, "guide"],
    [P.archive, L.t.nav.archive, "archive"],
    [P.about, L.t.nav.about, "about"],
  ];
  return `
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="${u(P.home)}" aria-label="${esc(cfg.name)}, ${esc(L.t.home)}">
        ${markSvg}
        <span class="brand__text"><span class="brand__name">LEONIDA<em>Hoy</em></span><span class="brand__tag">${esc(L.t.tagline)}</span></span>
      </a>
      <nav class="nav" aria-label="${esc(L.t.mainNav)}">
        ${nav.map(([href, label, key]) => `<a href="${u(href)}"${key === active ? ' aria-current="page"' : ""}>${esc(label)}</a>`).join("")}
      </nav>
      ${langSwitch(L, alts)}
      <div class="pill-count" data-countdown-mini="${esc(cfg.launchDate)}" data-done="${esc(L.t.miniDone)}" aria-hidden="true"><span class="dot"></span><span class="pill-pre" data-mini-pre>${esc(L.t.miniPre)}</span><span data-mini>19/11</span></div>
      <button class="theme-toggle" type="button" data-theme-toggle data-to-light="${esc(L.t.themeToLight)}" data-to-dark="${esc(L.t.themeToDark)}" aria-label="${esc(L.t.themeTitle)}" title="${esc(L.t.themeTitle)}">
        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></g></svg>
        <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.4 14.6A8.5 8.5 0 0 1 9.4 3.6a.6.6 0 0 0-.8-.7 9.6 9.6 0 1 0 12.5 12.5.6.6 0 0 0-.7-.8Z"/></svg>
      </button>
    </div>
  </header>`;
};

const langHint = (L, alts) => {
  const other = ACTIVE.find((c) => c !== L.code);
  if (!other) return "";
  const href = alts[other] || LOCALES[other].paths.home;
  return `
  <div class="lang-hint" data-lang-hint="${other}" hidden>
    <div class="wrap lang-hint__inner"><span lang="${other}">${esc(L.t.langHint)}</span>
      <a href="${u(href)}" lang="${other}" hreflang="${other}" data-lang="${other}">${esc(L.t.langHintCta)}</a>
      <button type="button" data-lang-hint-close aria-label="${esc(L.t.langHintClose)}">×</button></div>
  </div>`;
};

const footer = (L) => {
  const soc = Object.entries(cfg.social || {}).filter(([, v]) => v);
  const P = L.paths;
  return `
  <footer class="site-footer">
    <div class="wrap site-footer__inner">
      <div>
        <a class="brand brand--sm" href="${u(P.home)}">${markSvg}<span class="brand__name">LEONIDA<em>Hoy</em></span></a>
        <p class="muted small">${esc(L.t.footerNote)}</p>
      </div>
      <nav class="footer-nav" aria-label="${esc(L.t.footerNav)}">
        <a href="${u(P.guide)}">${esc(L.t.footerLinks.guide)}</a>
        <a href="${u(P.archive)}">${esc(L.t.footerLinks.archive)}</a>
        <a href="${u(P.about)}">${esc(L.t.footerLinks.about)}</a>
        <a href="${u(P.privacy)}">${esc(L.t.footerLinks.privacy)}</a>
        <a href="${u(P.feed)}" class="rss">${icon.rss} RSS</a>
        ${soc.map(([k, v]) => `<a href="${esc(v)}" rel="me noopener" target="_blank">${esc(k === "x" ? "X" : k.charAt(0).toUpperCase() + k.slice(1))}</a>`).join("")}
      </nav>
    </div>
  </footer>`;
};

const layout = (L, { title, description, key, body, active, type = "website", jsonLd = [], published, noindex = false }) => {
  const alts = counterparts(key);
  const pathName = alts[L.code];
  const canonical = abs(pathName);
  const fullTitle = title === cfg.name ? `${cfg.name} · ${L.t.tagline}` : `${title} · ${cfg.name}`;
  const hreflang = Object.entries(alts)
    .map(([c, p]) => `<link rel="alternate" hreflang="${c}" href="${abs(p)}">`)
    .concat(alts.es ? [`<link rel="alternate" hreflang="x-default" href="${abs(alts.es)}">`] : [])
    .join("\n");
  const image = L.code === "es" ? "/assets/og.png" : `/assets/og-${L.code}.png`;
  return `<!doctype html>
<html lang="${L.code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${hreflang}
<meta name="robots" content="${noindex ? "noindex" : "index, follow, max-image-preview:large, max-snippet:-1"}">
<meta name="theme-color" content="#0b0618" data-theme-color>
<meta name="referrer" content="strict-origin-when-cross-origin">
${cfg.googleSiteVerification ? `<meta name="google-site-verification" content="${esc(cfg.googleSiteVerification)}">` : ""}
<meta name="color-scheme" content="dark light">
<meta property="og:site_name" content="${esc(cfg.name)}">
<meta property="og:locale" content="${L.ogLocale}">
${ACTIVE.filter((c) => c !== L.code && alts[c]).map((c) => `<meta property="og:locale:alternate" content="${LOCALES[c].ogLocale}">`).join("\n")}
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
<link rel="alternate" type="application/rss+xml" title="${esc(cfg.name)} (${L.label})" href="${u(L.paths.feed)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Yellowtail&family=Inter:wght@400;500;600;700;800&display=swap">
<script>(function(){var r=document.documentElement,t=null;try{if(localStorage.getItem("lh-aud")==="nuevos")r.setAttribute("data-reader","nuevos");t=localStorage.getItem("lh-theme")}catch(e){}if(t==="light"||t==="dark")r.setAttribute("data-theme",t);var n=t==="light"||t==="dark"?t:(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");r.setAttribute("data-theme-now",n);var m=document.querySelector("[data-theme-color]");if(m)m.setAttribute("content",n==="light"?"#fff6fb":"#0b0618")})()</script>
<link rel="stylesheet" href="${u("/assets/styles.css")}?v=${CSS_V}">
${ADS ? `<meta name="google-adsense-account" content="${esc(ADS)}">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${esc(ADS)}" crossorigin="anonymous"></script>` : ""}
${GA ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(GA)}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${esc(GA)}');</script>` : ""}
${jsonLd.map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<a class="skip" href="#main">${esc(L.t.skip)}</a>
${header(L, active, alts)}
${langHint(L, alts)}
<main id="main">
${body}
</main>
<button class="to-top" type="button" aria-label="${esc(L.t.toTop)}" data-to-top><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6"/></svg></button>
${footer(L)}
<script src="${u("/assets/app.js")}?v=${JS_V}" defer></script>
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

const sourcesHtml = (L, sources) =>
  `<div class="sources"><span>${esc(L.t.source(sources.length))}</span> ${sources
    .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}${icon.ext}</a>`)
    .join(" ")}</div>`;

// ---------- página de un resumen ----------
const briefBody = (L, b) => {
  const { briefs, guide } = DATA[L.code];
  const P = L.paths;
  const pageUrl = abs(P.brief(b.date));
  const bigIdx = b.biggest ?? 0;
  const big = b.stories[bigIdx];
  const idx = briefs.indexOf(b);
  const newer = briefs[idx - 1];
  const older = briefs[idx + 1];
  const dShort = (d) => fmtDate(L, d, { day: "numeric", month: "short" });

  const stories = b.stories
    .map(
      (s, i) => `
      <article class="story${i === bigIdx ? " story--big" : ""}" id="h${i + 1}">
        <div class="story__num">${String(i + 1).padStart(2, "0")}</div>
        <div class="story__body">
          <div class="story__meta"><span class="tag">${esc(s.tag || L.t.news)}</span>${i === bigIdx ? `<span class="tag tag--hot">${esc(L.t.biggest)}</span>` : ""}</div>
          <h3 class="story__title">${esc(s.title)}</h3>
          <p class="story__text aud" data-aud="fans"><strong>${esc(L.t.whatChanged)}</strong> ${esc(s.change)}</p>
          <p class="story__text aud" data-aud="nuevos"><strong>${esc(L.t.inShort)}</strong> ${esc(s.plain || s.change)}</p>
          ${sourcesHtml(L, s.sources)}
        </div>
      </article>${i === 1 ? adUnit(L, "inFeed") : ""}`
    )
    .join("");

  const posts = (b.posts || [])
    .map(
      (p, i) => `
      <figure class="post">
        <figcaption class="post__head"><span class="post__n">Post ${i + 1}</span><span class="post__chars">${[...p].length} ${esc(L.t.chars)}</span></figcaption>
        <blockquote class="post__text" id="post-${b.date}-${i}">${esc(p)}</blockquote>
        <div class="post__actions">
          <button class="btn btn--ghost" type="button" data-copy="#post-${b.date}-${i}" data-copied="${esc(L.t.copied)}">${icon.copy}<span>${esc(L.t.copy)}</span></button>
          ${shareLinks(L, p, pageUrl)}
        </div>
      </figure>`
    )
    .join("");

  const context = (b.context || [])
    .map(
      (c) => `
      <li class="ctx">
        <time datetime="${c.date}">${esc(dShort(c.date))}</time>
        <div><h4>${esc(c.title)}</h4><p>${esc(c.text)}</p>${sourcesHtml(L, c.sources)}</div>
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
        `<li><a href="${u(P.brief(x.date))}"${x === b ? ' aria-current="page"' : ""}><time datetime="${x.date}">${esc(dShort(x.date))}</time><span>${esc(x.title)}</span></a></li>`
    )
    .join("");

  return `
  <section class="hero">
    <div class="hero__sky" aria-hidden="true"><div class="hero__sun"></div><div class="hero__sea"></div>${palmSvg("hero__palm--l")}${palmSvg("hero__palm--r")}<div class="hero__veil"></div></div>
    <div class="wrap hero__inner">
      <div class="hero__copy">
        <p class="eyebrow"><time datetime="${b.date}">${esc(fmtDate(L, b.date))}</time> · ${esc(L.t.morning)}</p>
        <h1 class="hero__title">${esc(b.title)}</h1>
        <p class="hero__lead">${esc(b.lead || b.summary)}</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#top5">${esc(L.t.seeFive)}</a>
          ${shareLinks(L, L.t.shareText(b.title), pageUrl)}
          <button class="btn btn--ghost" type="button" data-native-share data-title="${esc(b.title)}" data-url="${pageUrl}">${esc(L.t.share)}</button>
        </div>
      </div>
      ${countdown(L, "lg")}
    </div>
  </section>

  <div class="wrap">${adUnit(L, "top")}</div>

  <div class="wrap layout">
    <div class="col-main">
      <section class="block" aria-labelledby="top5">
        <div class="block__head">
          <h2 id="top5">${esc(L.t.top5)}</h2>
          <div class="reader">
            <span class="reader__label" id="reader-label">${esc(L.t.readerQ)}</span>
            <div class="aud-toggle" role="group" aria-labelledby="reader-label">
              <button type="button" data-aud-btn="fans" aria-pressed="true">${esc(L.t.fans)}</button>
              <button type="button" data-aud-btn="nuevos" aria-pressed="false">${esc(L.t.nuevos)}</button>
            </div>
          </div>
        </div>
        <p class="rules muted small"><span class="aud" data-aud="fans">${esc(L.t.showingFans)}</span><span class="aud" data-aud="nuevos">${esc(L.t.showingNew)}</span> ${esc(L.t.rules)}</p>
        <div class="stories">${stories}</div>
      </section>

      ${
        posts
          ? `<section class="block" aria-labelledby="posts">
        <div class="block__head"><h2 id="posts">${esc(L.t.postsTitle)}</h2></div>
        <p class="muted">${L.t.postsIntro(esc(big.title))}</p>
        <div class="posts">${posts}</div>
      </section>`
          : ""
      }
      ${adUnit(L, "bottom")}
      ${
        context
          ? `<section class="block" aria-labelledby="ctx">
        <div class="block__head"><h2 id="ctx">${esc(L.t.ctxTitle)}</h2></div>
        <p class="muted small">${esc(L.t.ctxIntro)}</p>
        <ul class="ctx-list">${context}</ul>
      </section>`
          : ""
      }

      <nav class="pager" aria-label="${esc(L.t.otherDays)}">
        ${older ? `<a href="${u(P.brief(older.date))}">← ${esc(fmtDate(L, older.date, { day: "numeric", month: "long" }))}</a>` : "<span></span>"}
        ${newer ? `<a href="${u(P.brief(newer.date))}">${esc(fmtDate(L, newer.date, { day: "numeric", month: "long" }))} →</a>` : ""}
      </nav>
    </div>

    <aside class="col-side">
      <div class="card">
        <h2 class="card__title">${esc(L.t.tenSec)}</h2>
        <ul class="facts">${facts}</ul>
        <a class="btn btn--primary btn--block" href="${u(P.guide)}">${esc(L.t.guideCta)}</a>
      </div>
      ${adUnit(L, "sidebar", "ad--sticky")}
      <div class="card">
        <h2 class="card__title">${esc(L.t.prev)}</h2>
        <ul class="mini-archive">${archive}</ul>
        <a class="link" href="${u(P.archive)}">${esc(L.t.fullArchive)}</a>
      </div>
      <div class="card card--cta">
        <h2 class="card__title">${esc(L.t.ctaTitle)}</h2>
        <p class="small">${esc(L.t.ctaText)}</p>
        <a class="btn btn--ghost btn--block" href="${u(P.feed)}">${icon.rss} ${esc(L.t.rss)}</a>
      </div>
    </aside>
  </div>`;
};

const briefJsonLd = (L, b) => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline: b.title,
  description: b.summary,
  inLanguage: L.code,
  datePublished: `${b.date}T07:00:00+01:00`,
  dateModified: BUILD_TIME,
  mainEntityOfPage: abs(L.paths.brief(b.date)),
  image: [abs(L.code === "es" ? "/assets/og.png" : `/assets/og-${L.code}.png`)],
  author: { "@type": "Organization", name: cfg.name, url: abs(L.paths.about) },
  publisher,
  about: { "@type": "VideoGame", name: "Grand Theft Auto VI" },
  citation: b.stories.flatMap((s) => s.sources.map((x) => x.url)),
});

// ---------- construir ----------
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
fs.cpSync(path.join(ROOT, "assets"), path.join(OUT, "assets"), { recursive: true });

const sitemap = []; // [clave, ruta, lastmod, changefreq, priority]

for (const code of ACTIVE) {
  const L = LOCALES[code];
  const P = L.paths;
  const { briefs, guide } = DATA[code];
  const latest = briefs[0];
  const dLong = (d) => fmtDate(L, d, { day: "numeric", month: "long", year: "numeric" });

  // Inicio
  write(
    P.home,
    layout(L, {
      title: cfg.name,
      description: `${latest.summary} ${L.t.description}`.slice(0, 300),
      key: "home",
      active: "home",
      body: briefBody(L, latest),
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebSite", name: cfg.name, url: abs(P.home), inLanguage: code, description: L.t.description, publisher },
        briefJsonLd(L, latest),
      ],
    })
  );
  sitemap.push(["home", P.home, latest.date, "daily", "1.0"]);

  // Un resumen por día
  for (const b of briefs) {
    write(
      P.brief(b.date),
      layout(L, {
        title: b.title,
        description: b.summary,
        key: `brief:${b.date}`,
        active: "archive",
        type: "article",
        published: `${b.date}T07:00:00+01:00`,
        body: briefBody(L, b),
        jsonLd: [briefJsonLd(L, b)],
      })
    );
    sitemap.push([`brief:${b.date}`, P.brief(b.date), b.date, "monthly", "0.8"]);
  }

  // Archivo
  write(
    P.archive,
    layout(L, {
      title: L.t.archiveTitle,
      description: L.t.archiveDesc,
      key: "archive",
      active: "archive",
      body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.archiveEyebrow)}</p><h1>${esc(L.t.archiveH1)}</h1><p class="muted">${esc(L.t.archiveIntro)}</p></div></section>
  <div class="wrap narrow">
    <ol class="archive">
      ${briefs
        .map(
          (b) => `<li><a href="${u(P.brief(b.date))}">
        <time datetime="${b.date}">${esc(fmtDate(L, b.date))}</time>
        <h2>${esc(b.title)}</h2><p>${esc(b.summary)}</p></a></li>`
        )
        .join("")}
    </ol>
    ${adUnit(L, "bottom")}
  </div>`,
    })
  );
  sitemap.push(["archive", P.archive, latest.date, "daily", "0.6"]);

  // Guía (búsquedas evergreen: fecha, precio, PC, tamaño…)
  write(
    P.guide,
    layout(L, {
      title: guide.title,
      description: guide.description,
      key: "guide",
      active: "guide",
      type: "article",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          inLanguage: code,
          mainEntity: guide.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
        },
      ],
      body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.guideUpdated(dLong(guide.updated)))}</p><h1>${esc(guide.title)}</h1><p class="muted">${esc(guide.description)}</p></div></section>
  <div class="wrap layout">
    <div class="col-main">
      <ul class="fact-grid">${guide.facts.map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`).join("")}</ul>
      ${adUnit(L, "top")}
      <section class="block" aria-labelledby="faq"><div class="block__head"><h2 id="faq">${esc(L.t.faq)}</h2></div>
        <div class="faq">
        ${guide.faq.map((f, i) => `<details${i < 2 ? " open" : ""}><summary>${esc(f.q)}</summary><div class="faq__a"><p>${esc(f.a)}</p>${sourcesHtml(L, f.sources)}</div></details>`).join("")}
        </div>
      </section>
      ${adUnit(L, "bottom")}
    </div>
    <aside class="col-side">
      <div class="card">${countdown(L, "sm")}</div>
      ${adUnit(L, "sidebar", "ad--sticky")}
      <div class="card card--cta"><h2 class="card__title">${esc(L.t.latest)}</h2><p class="small">${esc(latest.title)}</p><a class="btn btn--primary btn--block" href="${u(P.home)}">${esc(L.t.readToday)}</a></div>
    </aside>
  </div>`,
    })
  );
  sitemap.push(["guide", P.guide, guide.updated, "weekly", "0.9"]);

  // Acerca
  write(
    P.about,
    layout(L, {
      title: L.t.aboutTitle,
      description: L.t.aboutDesc,
      key: "about",
      active: "about",
      body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.aboutEyebrow)}</p><h1>Leonida Hoy</h1><p class="muted">${esc(L.t.description)}</p></div></section>
  <div class="wrap narrow prose">${L.t.aboutBody(ISSUES_URL)}
  </div>`,
    })
  );
  sitemap.push(["about", P.about, latest.date, "yearly", "0.3"]);

  // Privacidad (necesaria para AdSense)
  write(
    P.privacy,
    layout(L, {
      title: L.t.privacyTitle,
      description: L.t.privacyDesc,
      key: "privacy",
      active: "",
      body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.privacyEyebrow)}</p><h1>${esc(L.t.privacyH1)}</h1><p class="muted">${esc(L.t.privacyUpdated(dLong(BUILD_TIME.slice(0, 10))))}</p></div></section>
  <div class="wrap narrow prose">${L.t.privacyBody(GA)}
  </div>`,
    })
  );
  sitemap.push(["privacy", P.privacy, latest.date, "yearly", "0.2"]);

  // RSS por idioma
  const rfc822 = (d) => new Date(d + "T06:00:00Z").toUTCString();
  write(
    P.feed,
    `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(cfg.name)} — ${esc(L.t.tagline)}</title>
  <link>${abs(P.home)}</link>
  <description>${esc(L.t.description)}</description>
  <language>${code}</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${abs(P.feed)}" rel="self" type="application/rss+xml"/>
${briefs
  .slice(0, 30)
  .map(
    (b) => `  <item>
    <title>${esc(b.title)}</title>
    <link>${abs(P.brief(b.date))}</link>
    <guid isPermaLink="true">${abs(P.brief(b.date))}</guid>
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
}

// 404 bilingüe (GitHub Pages solo admite uno)
{
  const L = LOCALES.es;
  const html = layout(L, {
    title: "Página no encontrada · Page not found",
    description: "Esta página no existe. This page doesn't exist.",
    key: "home",
    active: "",
    noindex: true,
    body: `<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Error 404</p><h1>Te has salido del mapa</h1><p class="muted">Esta página no existe en Leonida. <span lang="en">· You've left the map: this page doesn't exist.</span></p><p class="hero__actions"><a class="btn btn--primary" href="${u("/")}">Volver al resumen de hoy</a> <a class="btn btn--ghost" href="${u(LOCALES.en.paths.home)}" lang="en">Today's briefing in English</a></p></div></section>`,
  }).replace(/<link rel="canonical"[^>]*>\n/, "").replace(/<link rel="alternate" hreflang[^>]*>\n/g, "");
  write("404.html", html);
}

// Sitemap con alternativas de idioma
const altLinks = (key) => {
  const alts = counterparts(key);
  if (Object.keys(alts).length < 2) return "";
  return Object.entries(alts)
    .map(([c, p]) => `<xhtml:link rel="alternate" hreflang="${c}" href="${abs(p)}"/>`)
    .concat(alts.es ? [`<xhtml:link rel="alternate" hreflang="x-default" href="${abs(alts.es)}"/>`] : [])
    .join("");
};
write(
  "sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemap
  .map(([key, p, d, f, pr]) => `  <url><loc>${abs(p)}</loc>${altLinks(key)}<lastmod>${d}</lastmod><changefreq>${f}</changefreq><priority>${pr}</priority></url>`)
  .join("\n")}
</urlset>
`
);

write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\n`);
if (ADS) write("ads.txt", `google.com, ${ADS.replace(/^ca-/, "")}, DIRECT, f08c47fec0942fa0\n`);
write(
  "manifest.webmanifest",
  JSON.stringify(
    {
      name: `${cfg.name} · ${LOCALES.es.t.tagline}`,
      short_name: cfg.name,
      lang: "es",
      start_url: u("/"),
      scope: u("/"),
      display: "standalone",
      background_color: "#0b0618",
      theme_color: "#0b0618",
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
if (cfg.indexNowKey) write(`${cfg.indexNowKey}.txt`, cfg.indexNowKey);

const missing = rawBriefs.filter((b) => !b.en).map((b) => b.date);
console.log(
  `✓ ${rawBriefs.length} resumen(es) · idiomas: ${ACTIVE.join(", ")}${missing.length ? ` · sin inglés: ${missing.join(", ")}` : ""} · ${ADS ? "AdSense ON" : "AdSense OFF"} → ${path.relative(ROOT, OUT)}/`
);
