// Generador estático de Leónida Hoy. Sin dependencias: `node scripts/build.mjs`.
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
const FONTS_V = assetVer("fonts.css");

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
  for (const [k, list] of [["more", b.more || []], ["rumors", b.rumors || []]]) {
    list.forEach((s, i) => {
      if (!s.title || !s.change) fail(`${where}: ${k} ${i + 1} sin title/change`);
      if (!s.sources?.length) fail(`${where}: ${k} ${i + 1} sin fuente (regla: nada sin fuente con nombre)`);
      if (k === "rumors" && !["alta", "media", "baja"].includes(s.reliability)) fail(`${where}: rumor ${i + 1} sin reliability (alta|media|baja)`);
    });
  }
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
    more: (b.more || []).map((s, i) => ({ ...s, ...(tr.more?.[i] || {}), sources: s.sources })),
    rumors: (b.rumors || []).map((s, i) => ({ ...s, ...(tr.rumors?.[i] || {}), sources: s.sources, reliability: s.reliability })),
  };
  if (tr.stories && tr.stories.length !== b.stories.length) fail(`content/briefs/${b.date}.json: «${code}.stories» no tiene las mismas historias`);
  return out;
};

const slugify = (t) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 70).replace(/-+$/, "");
const DATA = {};
for (const code of Object.keys(LOCALES)) {
  const briefs = rawBriefs.map((b) => localize(b, code)).filter(Boolean);
  briefs.forEach((b) => validate(b, `content/briefs/${b.date}.json [${code}]`));
  const gfile = path.join(ROOT, code === "es" ? "content/guide.json" : `content/guide.${code}.json`);
  const guide = fs.existsSync(gfile) ? JSON.parse(fs.readFileSync(gfile, "utf8")) : null;
  // Cada noticia y cada rumor es un elemento con página propia
  const P = LOCALES[code].paths;
  const items = [];
  for (const b of briefs) {
    [...b.stories, ...(b.more || [])].forEach((s, i) =>
      items.push({ ...s, kind: "news", date: b.date, key: `item:news:${b.date}:${i}`, top: i < b.stories.length, big: i === (b.biggest ?? 0), path: P.newsItem(b.date, slugify(s.title)) })
    );
    (b.rumors || []).forEach((s, i) => items.push({ ...s, kind: "rumor", date: b.date, key: `item:rumor:${b.date}:${i}`, path: P.rumorItem(b.date, slugify(s.title)) }));
  }
  const paths = new Set(items.map((i) => i.path));
  if (paths.size !== items.length) fail(`[${code}] hay dos noticias o rumores con el mismo título el mismo día`);
  DATA[code] = { briefs, guide, dates: new Set(briefs.map((b) => b.date)), items, byKey: new Map(items.map((i) => [i.key, i])) };
}
const ACTIVE = Object.keys(LOCALES).filter((c) => DATA[c].briefs.length && DATA[c].guide);
const LEONIDA = JSON.parse(fs.readFileSync(path.join(ROOT, "content/leonida.json"), "utf8"));
const REVIEWS = JSON.parse(fs.readFileSync(path.join(ROOT, "content/reviews.json"), "utf8"));
(REVIEWS.reviews || []).forEach((r, i) => {
  const w = `content/reviews.json: reviews[${i}]`;
  if (!r.outlet || typeof r.score !== "number" || typeof r.max !== "number" || r.max <= 0 || r.score < 0 || r.score > r.max) fail(`${w}: necesita outlet, score y max (número, score ≤ max)`);
  if (!/^https?:\/\//.test(r.url || "")) fail(`${w}: url inválida`);
});
const reviewList = (REVIEWS.reviews || []).map((r) => ({ ...r, pct: Math.round((r.score / r.max) * 100) })).sort((a, b) => b.pct - a.pct);
const reviewAvg = reviewList.length ? Math.round(reviewList.reduce((t, r) => t + r.pct, 0) / reviewList.length) : null;
const LAUNCH_UTC_CLOUD = "2026-11-19T06:00:00Z"; // 1:00 ET del 19 (Xbox Cloud, según Microsoft)
const crumbsLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map(([name, p], i) => ({ "@type": "ListItem", position: i + 1, name, item: abs(p) })),
});

// Equivalencias entre idiomas: clave de página → ruta en cada idioma (si existe)
const counterparts = (key) => {
  const out = {};
  for (const code of ACTIVE) {
    const P = LOCALES[code].paths;
    if (key.startsWith("brief:")) {
      const d = key.slice(6);
      if (DATA[code].dates.has(d)) out[code] = P.brief(d);
    } else if (key.startsWith("item:")) {
      const it = DATA[code].byKey.get(key);
      if (it) out[code] = it.path;
    } else if (typeof P[key] === "string") out[code] = P[key];
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
    [P.news, L.t.nav.news, "news"],
    [P.rumors, L.t.nav.rumors, "rumors"],
    [P.guide, L.t.nav.guide, "guide"],
    [P.archive, L.t.nav.archive, "archive"],
  ];
  return `
  <header class="site-header">
    <div class="wrap site-header__inner">
      <a class="brand" href="${u(P.home)}" aria-label="${esc(cfg.name)}, ${esc(L.t.home)}">
        ${markSvg}
        <span class="brand__text"><span class="brand__name">LEÓNIDA<em>Hoy</em></span><span class="brand__tag">${esc(L.t.tagline)}</span></span>
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
    <div class="progress" aria-hidden="true"><span data-progress></span></div>
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
        <a class="brand brand--sm" href="${u(P.home)}">${markSvg}<span class="brand__name">LEÓNIDA<em>Hoy</em></span></a>
        <p class="muted small">${esc(L.t.footerNote)}</p>
      </div>
      <nav class="footer-nav" aria-label="${esc(L.t.footerNav)}">
        <a href="${u(P.news)}">${esc(L.t.nav.news)}</a>
        <a href="${u(P.rumors)}">${esc(L.t.nav.rumors)}</a>
        <a href="${u(P.guide)}">${esc(L.t.footerLinks.guide)}</a>
        <a href="${u(P.archive)}">${esc(L.t.footerLinks.archive)}</a>
        <a href="${u(P.about)}">${esc(L.t.footerLinks.about)}</a>
        <a href="${u(P.privacy)}">${esc(L.t.footerLinks.privacy)}</a>
        <a href="${u(P.legal)}">${esc(L.t.footerLinks.legal)}</a>
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
<link rel="preload" href="${u("/assets/fonts/inter-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${u("/assets/fonts/anton-latin.woff2")}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u("/assets/fonts.css")}?v=${FONTS_V}">
<script>(function(){var r=document.documentElement,t=null;r.className+=" js";try{if(localStorage.getItem("lh-aud")==="nuevos")r.setAttribute("data-reader","nuevos");t=localStorage.getItem("lh-theme")}catch(e){}if(t==="light"||t==="dark")r.setAttribute("data-theme",t);var n=t==="light"||t==="dark"?t:(window.matchMedia&&matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");r.setAttribute("data-theme-now",n);var m=document.querySelector("[data-theme-color]");if(m)m.setAttribute("content",n==="light"?"#fff6fb":"#0b0618")})()</script>
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
<div class="launch-bar" data-launch-bar data-launch="${esc(cfg.launchDate)}">
  <div class="wrap launch-bar__inner">
    <span data-lb="pre">🗓️ ${esc(L.t.launchBarPre(""))} <a href="${u(L.paths.release)}">${esc(L.t.launchBarPreCta)}</a></span>
    <span data-lb="out" hidden>🎮 ${esc(L.t.launchBarOut)} <a href="${u(L.paths.reviews)}">${esc(L.t.launchBarOutCta)}</a></span>
  </div>
</div>
<main id="main">
${body}
</main>
<button class="to-top" type="button" aria-label="${esc(L.t.toTop)}" data-to-top><svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="track" cx="24" cy="24" r="22.5" pathLength="100"/><circle class="bar" cx="24" cy="24" r="22.5" pathLength="100" data-progress-ring/></svg><svg class="to-top__arrow" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M6 15l6-6 6 6"/></svg></button>
${footer(L)}
<script src="${u("/assets/app.js")}?v=${JS_V}" defer></script>
<script type="speculationrules">{"prefetch":[{"where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":"/*.xml"}}]},"eagerness":"moderate"}]}</script>
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

// ---------- tarjetas, portada, listados y páginas de detalle ----------
const relLevel = { alta: 3, media: 2, baja: 1 };
const relMeter = (L, r) =>
  `<span class="rel rel--${r}"><span class="rel__bars" aria-hidden="true">${[1, 2, 3].map((n) => `<i${n <= relLevel[r] ? ' class="on"' : ""}></i>`).join("")}</span>${esc(L.t.reliability[r])}</span>`;
const via = (L, sources) =>
  `<span class="via">${esc(L.t.via)} ${sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener nofollow">${esc(s.name)}</a>`).join(", ")}</span>`;
const metaTags = (L, it) =>
  it.kind === "rumor"
    ? `<span class="tag tag--rumor">${esc(L.t.rumor)}</span>${relMeter(L, it.reliability)}`
    : `<span class="tag">${esc(it.tag || L.t.news)}</span>${it.big ? `<span class="tag tag--hot">${esc(L.t.biggest)}</span>` : ""}`;
const readerHtml = (L) => `
          <div class="reader">
            <span class="reader__label" id="reader-label">${esc(L.t.readerQ)}</span>
            <div class="aud-toggle" role="group" aria-labelledby="reader-label">
              <button type="button" data-aud-btn="fans" aria-pressed="true">${esc(L.t.fans)}</button>
              <button type="button" data-aud-btn="nuevos" aria-pressed="false">${esc(L.t.nuevos)}</button>
            </div>
          </div>`;

// Tarjeta de noticia o rumor: toda la tarjeta lleva a su página de detalle
const itemCard = (L, it, { num, variant = "mini" } = {}) => {
  const rumor = it.kind === "rumor";
  const story = variant === "story";
  return `
      <article class="${story ? "story" : "mini-story"} item item--${it.kind}${it.big && story ? " story--big" : ""}${rumor ? ` rumor rumor--${it.reliability}` : ""}"${rumor ? ` data-rel="${it.reliability}"` : ""}>
        ${num ? `<div class="story__num">${num}</div>` : ""}
        <div class="story__body">
          <div class="story__meta">${metaTags(L, it)}</div>
          <h3 class="story__title"><a href="${u(it.path)}">${esc(it.title)}</a></h3>
          <p class="story__text aud" data-aud="fans">${story ? `<strong>${esc(L.t.whatChanged)}</strong> ` : ""}${esc(it.change)}</p>
          <p class="story__text aud" data-aud="nuevos">${story ? `<strong>${esc(L.t.inShort)}</strong> ` : ""}${esc(it.plain || it.change)}</p>
          ${rumor && it.who ? `<p class="rumor__who small"><strong>${esc(L.t.who)}</strong> ${esc(it.who)}</p>` : ""}
          <div class="item__foot"><span class="more-link">${esc(L.t.readMore)}</span>${via(L, it.sources)}</div>
        </div>
      </article>`;
};

const guidesCard = (L) => {
  const P = L.paths;
  const link = (href, emoji, [name, sub]) => `<li><a href="${u(href)}"><span aria-hidden="true">${emoji}</span><span><b>${esc(name)}</b><small>${esc(sub)}</small></span></a></li>`;
  return `<div class="card"><h2 class="card__title">${esc(L.t.nav.guide)}</h2><ul class="guide-links">
    ${link(P.release, "⏰", L.t.tiles.release)}${link(P.reviews, "⭐", L.t.tiles.reviews)}${link(P.leonida, "🌴", L.t.tiles.leonida)}${link(P.guide, "🧭", [L.t.nav.guide, L.t.hubGuideSub])}
  </ul></div>`;
};
const sideCards = (L, { facts = true } = {}) => {
  const { guide } = DATA[L.code];
  const P = L.paths;
  return `
      ${guidesCard(L)}
      <div class="card">${countdown(L, "sm")}</div>
      ${adUnit(L, "sidebar", "ad--sticky")}
      ${
        facts
          ? `<div class="card">
        <h2 class="card__title">${esc(L.t.tenSec)}</h2>
        <ul class="facts">${guide.facts.slice(0, 4).map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`).join("")}</ul>
        <a class="btn btn--primary btn--block" href="${u(P.guide)}">${esc(L.t.guideCta)}</a>
      </div>`
          : ""
      }`;
};

// ---------- portada / resumen de un día ----------
const briefBody = (L, b) => {
  const { briefs, guide, items } = DATA[L.code];
  const P = L.paths;
  const pageUrl = abs(P.brief(b.date));
  const today = items.filter((i) => i.date === b.date);
  const top = today.filter((i) => i.kind === "news" && i.top);
  const more = today.filter((i) => i.kind === "news" && !i.top);
  const rumors = today.filter((i) => i.kind === "rumor");
  const big = top.find((i) => i.big) || top[0];
  const idx = briefs.indexOf(b);
  const newer = briefs[idx - 1];
  const older = briefs[idx + 1];
  const dShort = (d) => fmtDate(L, d, { day: "numeric", month: "short" });

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

  const archive = briefs
    .slice(0, 6)
    .map(
      (x) =>
        `<li><a href="${u(P.brief(x.date))}"${x === b ? ' aria-current="page"' : ""}><time datetime="${x.date}">${esc(dShort(x.date))}</time><span>${esc(x.title)}</span></a></li>`
    )
    .join("");

  const tile = (cls, href, emoji, name, sub) =>
    `<a class="hub__tile hub__tile--${cls}" href="${u(href)}"><span class="hub__icon" aria-hidden="true">${emoji}</span><span class="hub__txt"><b>${esc(name)}</b><small>${esc(sub)}</small></span></a>`;

  return `
  <section class="hero">
    <div class="hero__sky" aria-hidden="true"><div class="hero__sun"></div><div class="hero__sea"></div>${palmSvg("hero__palm--l")}${palmSvg("hero__palm--r")}<div class="hero__veil"></div></div>
    <div class="wrap hero__inner">
      <div class="hero__copy">
        <p class="eyebrow"><time datetime="${b.date}">${esc(fmtDate(L, b.date))}</time><span class="eyebrow__extra"> · ${esc(L.t.morning)}</span></p>
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

  <div class="wrap">
    <nav class="hub" aria-label="${esc(L.t.jumpsLabel)}">
      ${tile("news", P.news, "📰", L.t.nav.news, L.t.hubNewsSub(top.length + more.length))}
      ${tile("rumors", P.rumors, "🕵️", L.t.nav.rumors, L.t.hubRumorsSub(rumors.length))}
      ${tile("reviews", P.reviews, "⭐", L.t.tiles.reviews[0], reviewAvg !== null ? `${L.t.reviewsAvg}: ${reviewAvg} · ${L.t.reviewsCount(reviewList.length)}` : L.t.tiles.reviews[1])}
      ${tile("release", P.release, "⏰", L.t.tiles.release[0], L.t.tiles.release[1])}
      ${tile("leonida", P.leonida, "🌴", L.t.tiles.leonida[0], L.t.tiles.leonida[1])}
      ${tile("guide", P.guide, "🧭", L.t.nav.guide, L.t.hubGuideSub)}
    </nav>
    ${adUnit(L, "top")}
  </div>

  <div class="wrap layout">
    <div class="col-main">
      <section class="block zone zone--news" aria-labelledby="top5">
        <span class="kicker kicker--news">✔ ${esc(L.t.kickerNews)}</span>
        <div class="block__head">
          <h2 id="top5">${esc(L.t.top5)}</h2>
          ${readerHtml(L)}
        </div>
        <p class="rules muted small"><span class="aud" data-aud="fans">${esc(L.t.showingFans)}</span><span class="aud" data-aud="nuevos">${esc(L.t.showingNew)}</span> ${esc(L.t.rules)}</p>
        <div class="stories">${top.map((it, i) => itemCard(L, it, { num: String(i + 1).padStart(2, "0"), variant: "story" }) + (i === 1 ? adUnit(L, "inFeed") : "")).join("")}</div>
        ${more.length ? `<h3 class="sub" id="more">${esc(L.t.moreTitle)}</h3><div class="briefs-grid">${more.map((it) => itemCard(L, it)).join("")}</div>` : ""}
        <p class="zone__more"><a class="btn btn--ghost" href="${u(P.news)}">${esc(L.t.allNews)}</a></p>
      </section>

      ${
        rumors.length
          ? `<section class="block zone zone--rumor" aria-labelledby="rumors">
        <span class="kicker kicker--rumor">⚠ ${esc(L.t.kickerRumor)}</span>
        <div class="block__head"><h2 id="rumors">${esc(L.t.rumorsTitle)}</h2></div>
        <p class="rumor-note small">${esc(L.t.rumorsIntro)}</p>
        <div class="briefs-grid">${rumors.map((it) => itemCard(L, it)).join("")}</div>
        <p class="zone__more"><a class="btn btn--ghost" href="${u(P.rumors)}">${esc(L.t.allRumors)}</a></p>
      </section>`
          : ""
      }

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
        <ul class="facts">${guide.facts.slice(0, 4).map((f) => `<li><span>${esc(f.label)}</span><b>${esc(f.value)}</b></li>`).join("")}</ul>
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

// ---------- listado de noticias o de rumores ----------
const listBody = (L, kind) => {
  const { items } = DATA[L.code];
  const P = L.paths;
  const rumor = kind === "rumor";
  const list = items.filter((i) => i.kind === kind);
  const days = new Map();
  list.forEach((i) => days.set(i.date, [...(days.get(i.date) || []), i]));
  return `
  <section class="page-head page-head--${kind}"><div class="wrap">
    <span class="kicker kicker--${kind}">${rumor ? "⚠ " + esc(L.t.kickerRumor) : "✔ " + esc(L.t.kickerNews)}</span>
    <h1>${esc(rumor ? L.t.rumorsH1 : L.t.newsH1)}</h1><p class="muted">${esc(rumor ? L.t.rumorsIntro : L.t.newsIntro)}</p></div></section>
  <div class="wrap layout">
    <div class="col-main">
      ${
        rumor
          ? `<div class="legend"><b>${esc(L.t.legendTitle)}</b><ul>${["alta", "media", "baja"].map((r) => `<li>${relMeter(L, r)}<span>${esc(L.t.legend[r])}</span></li>`).join("")}</ul></div>`
          : ""
      }
      <div class="toolbar">
        ${
          rumor
            ? `<div class="reader"><span class="reader__label">${esc(L.t.filterLabel)}</span><div class="filter" role="group" aria-label="${esc(L.t.filterLabel)}">
          <button type="button" data-rel-filter="all" aria-pressed="true">${esc(L.t.filterAll)}</button>
          ${["alta", "media", "baja"].map((r) => `<button type="button" data-rel-filter="${r}" aria-pressed="false">${esc(L.t.reliabilityShort[r])}</button>`).join("")}
        </div></div>`
            : ""
        }
        ${readerHtml(L)}
      </div>
      ${list.length ? "" : `<p class="muted">${esc(L.t.emptyList)}</p>`}
      ${[...days]
        .map(
          ([d, arr]) => `
      <section class="day" data-day>
        <h2 class="day__title"><time datetime="${d}">${esc(fmtDate(L, d))}</time></h2>
        <div class="briefs-grid">${arr.map((it) => itemCard(L, it)).join("")}</div>
      </section>`
        )
        .join("")}
      ${adUnit(L, "bottom")}
    </div>
    <aside class="col-side">
      <a class="hub__tile hub__tile--${rumor ? "news" : "rumors"}" href="${u(rumor ? P.news : P.rumors)}"><span class="hub__icon" aria-hidden="true">${rumor ? "📰" : "🕵️"}</span><span class="hub__txt"><b>${esc(rumor ? L.t.nav.news : L.t.nav.rumors)}</b><small>${esc(rumor ? L.t.kickerNews : L.t.kickerRumor)}</small></span></a>
      ${sideCards(L)}
    </aside>
  </div>`;
};

// ---------- página de detalle de una noticia o un rumor ----------
const itemBody = (L, it) => {
  const { items } = DATA[L.code];
  const P = L.paths;
  const rumor = it.kind === "rumor";
  const pageUrl = abs(it.path);
  const listPath = rumor ? P.rumors : P.news;
  const same = items.filter((i) => i.kind === it.kind);
  const idx = same.indexOf(it);
  const newer = same[idx - 1];
  const older = same[idx + 1];
  const related = items
    .filter((i) => i.date === it.date && i !== it)
    .sort((a, b) => (a.kind === it.kind ? 0 : 1) - (b.kind === it.kind ? 0 : 1))
    .slice(0, 4);
  const paras = (x) => (Array.isArray(x) ? x : String(x).split(/\n\s*\n/)).map((p) => `<p>${esc(p)}</p>`).join("");
  return `
  <section class="page-head page-head--${it.kind}"><div class="wrap">
    <nav class="crumbs" aria-label="${esc(L.t.crumbs)}"><a href="${u(P.home)}">${esc(L.t.nav.home)}</a><span aria-hidden="true">›</span><a href="${u(listPath)}">${esc(rumor ? L.t.nav.rumors : L.t.nav.news)}</a></nav>
    <div class="story__meta">${metaTags(L, it)}</div>
    <h1 class="article__title">${esc(it.title)}</h1>
    <p class="muted small"><time datetime="${it.date}">${esc(fmtDate(L, it.date))}</time></p>
  </div></section>
  <div class="wrap layout">
    <div class="col-main">
      <article class="article">
        ${
          rumor
            ? `<div class="rumor-banner"><b>⚠ ${esc(L.t.rumorBannerTitle)}</b><p>${esc(L.t.rumorBanner)}</p>
          ${it.who ? `<p><strong>${esc(L.t.who)}</strong> ${esc(it.who)}</p>` : ""}
          <p class="rumor-banner__rel">${relMeter(L, it.reliability)}<span>${esc(L.t.legend[it.reliability])}</span></p></div>`
            : ""
        }
        <p class="article__lead">${esc(it.change)}</p>
        <div class="plainbox"><b>${esc(L.t.plainTitle)}</b><p>${esc(it.plain || it.change)}</p></div>
        ${it.detail ? `<h2>${esc(L.t.details)}</h2>${paras(it.detail)}` : ""}
        ${it.why ? `<h2>${esc(L.t.why)}</h2>${paras(it.why)}` : ""}
        <h2>${esc(L.t.originals)}</h2>
        <p class="muted small">${esc(L.t.originalsNote)}</p>
        ${sourcesHtml(L, it.sources)}
        <div class="article__share">${shareLinks(L, it.title, pageUrl)}
          <button class="btn btn--ghost" type="button" data-native-share data-title="${esc(it.title)}" data-url="${pageUrl}">${esc(L.t.share)}</button></div>
      </article>
      ${adUnit(L, "bottom")}
      ${
        related.length
          ? `<section class="block block--related" aria-labelledby="rel"><div class="block__head"><h2 id="rel">${esc(L.t.moreToday)}</h2></div>
        <div class="briefs-grid">${related.map((r) => itemCard(L, r)).join("")}</div></section>`
          : ""
      }
      <nav class="pager pager--items" aria-label="${esc(rumor ? L.t.nav.rumors : L.t.nav.news)}">
        ${older ? `<a href="${u(older.path)}">← ${esc(older.title)}</a>` : "<span></span>"}
        ${newer ? `<a href="${u(newer.path)}">${esc(newer.title)} →</a>` : ""}
      </nav>
      <p><a class="btn btn--ghost" href="${u(listPath)}">${esc(rumor ? L.t.allRumors : L.t.allNews)}</a></p>
    </div>
    <aside class="col-side">${sideCards(L)}</aside>
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
      title: L.t.homeTitle,
      description: L.t.homeDesc,
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

  // Noticias y rumores: listados y una página de detalle por elemento
  for (const [kind, key] of [["news", "news"], ["rumor", "rumors"]]) {
    write(P[key], layout(L, { title: kind === "rumor" ? L.t.rumorsPageTitle : L.t.newsTitle, description: kind === "rumor" ? L.t.rumorsDesc : L.t.newsDesc, key, active: key, body: listBody(L, kind) }));
    sitemap.push([key, P[key], latest.date, "daily", "0.9"]);
  }
  for (const it of DATA[code].items) {
    const rumor = it.kind === "rumor";
    const title = rumor ? `${L.t.rumor}: ${it.title}` : it.title;
    write(
      it.path,
      layout(L, {
        title,
        description: it.plain || it.change,
        key: it.key,
        active: rumor ? "rumors" : "news",
        type: "article",
        published: `${it.date}T07:00:00+01:00`,
        body: itemBody(L, it),
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: title.slice(0, 110),
            description: it.change,
            inLanguage: code,
            datePublished: `${it.date}T07:00:00+01:00`,
            dateModified: BUILD_TIME,
            mainEntityOfPage: abs(it.path),
            image: [abs(code === "es" ? "/assets/og.png" : `/assets/og-${code}.png`)],
            author: { "@type": "Organization", name: cfg.name, url: abs(P.about) },
            publisher,
            citation: it.sources.map((x) => x.url),
          },
          crumbsLd([[L.t.crumbHome, P.home], [rumor ? L.t.nav.rumors : L.t.nav.news, rumor ? P.rumors : P.news], [it.title, it.path]]),
        ],
      })
    );
    sitemap.push([it.key, it.path, it.date, "monthly", "0.7"]);
  }

  // ¿A qué hora sale? (búsqueda clave de la semana de lanzamiento)
  {
    const zones = code === "es"
      ? [["España (peninsular)", "Europe/Madrid"], ["Canarias", "Atlantic/Canary"], ["México (centro)", "America/Mexico_City"], ["Colombia", "America/Bogota"], ["Perú", "America/Lima"], ["Venezuela", "America/Caracas"], ["Chile", "America/Santiago"], ["Argentina", "America/Argentina/Buenos_Aires"], ["EE. UU. (Este)", "America/New_York"], ["EE. UU. (Pacífico)", "America/Los_Angeles"]]
      : [["US (Eastern)", "America/New_York"], ["US (Central)", "America/Chicago"], ["US (Mountain)", "America/Denver"], ["US (Pacific)", "America/Los_Angeles"], ["Canada (Toronto)", "America/Toronto"], ["UK", "Europe/London"], ["Spain", "Europe/Madrid"], ["Mexico (Central)", "America/Mexico_City"], ["Australia (Sydney)", "Australia/Sydney"]];
    const cloudFmt = (tz) => new Intl.DateTimeFormat(L.intl, { timeZone: tz, weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(LAUNCH_UTC_CLOUD));
    write(
      P.release,
      layout(L, {
        title: L.t.releaseTitle,
        description: L.t.releaseDesc,
        key: "release",
        active: "guide",
        type: "article",
        jsonLd: [
          { "@context": "https://schema.org", "@type": "FAQPage", inLanguage: code, mainEntity: L.t.releaseFaq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
          crumbsLd([[L.t.crumbHome, P.home], [L.t.nav.guide, P.guide], [L.t.releaseH1, P.release]]),
        ],
        body: `
  <section class="page-head page-head--release"><div class="wrap">
    <p class="eyebrow">${esc(L.t.releaseEyebrow)}</p><h1>${esc(L.t.releaseH1)}</h1><p class="lead-text">${esc(L.t.releaseLead)}</p>
    <div class="release-cd">${countdown(L, "lg")}</div>
    <p class="your-tz muted small" data-your-tz="${esc(L.t.releaseYourTz("{tz}"))}"></p>
  </div></section>
  <div class="wrap layout">
    <div class="col-main">
      <section class="block" aria-labelledby="by-country"><div class="block__head"><h2 id="by-country">${esc(L.t.releaseTable)}</h2></div>
        <div class="table-wrap"><table class="tz-table">
          <thead><tr><th scope="col">${esc(L.t.releaseCountry)}</th><th scope="col">${esc(L.t.releaseConsole)}</th><th scope="col">${esc(L.t.releaseCloud)}</th></tr></thead>
          <tbody>${zones.map(([n, tz]) => `<tr><th scope="row">${esc(n)}</th><td>${esc(L.t.releaseMidnight)}</td><td>${esc(cloudFmt(tz))}</td></tr>`).join("")}</tbody>
        </table></div>
        <p class="muted small">${esc(L.t.releaseCloudNote)}</p>
      </section>
      ${adUnit(L, "top")}
      <section class="block" aria-labelledby="before"><div class="block__head"><h2 id="before">${esc(L.t.releaseBefore)}</h2></div>
        <ul class="checklist">${L.t.releaseChecklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
      </section>
      <section class="block" aria-labelledby="faq"><div class="block__head"><h2 id="faq">${esc(L.t.faq)}</h2></div>
        <div class="faq">${L.t.releaseFaq.map(([q, a], i) => `<details${i < 2 ? " open" : ""}><summary>${esc(q)}</summary><div class="faq__a"><p>${esc(a)}</p></div></details>`).join("")}</div>
        ${sourcesHtml(L, [
          { name: "Variety", url: "https://variety.com/2026/gaming/news/gta-6-preorders-expectations-launch-1236943278/" },
          { name: "Windows Central", url: "https://www.windowscentral.com/gaming/xbox/grand-theft-auto-6-will-be-playable-on-xbox-cloud-gaming-but-there-are-a-few-catches" },
          { name: "tbreak", url: "https://tbreak.com/gta-6-update-1-002-000/" },
        ])}
      </section>
      ${adUnit(L, "bottom")}
    </div>
    <aside class="col-side">${sideCards(L)}</aside>
  </div>`,
      })
    );
    sitemap.push(["release", P.release, latest.date, "daily", "0.9"]);
  }

  // Leonida: mapa y personajes (búsquedas «Leonida», «mapa GTA 6», «personajes GTA 6»)
  write(
    P.leonida,
    layout(L, {
      title: L.t.leonidaTitle,
      description: L.t.leonidaDesc,
      key: "leonida",
      active: "guide",
      type: "article",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "Article", headline: L.t.leonidaTitle, description: L.t.leonidaDesc, inLanguage: code, dateModified: LEONIDA.updated, mainEntityOfPage: abs(P.leonida), author: { "@type": "Organization", name: cfg.name }, publisher, about: { "@type": "VideoGame", name: "Grand Theft Auto VI" }, image: [abs(code === "es" ? "/assets/og.png" : `/assets/og-${code}.png`)] },
        crumbsLd([[L.t.crumbHome, P.home], [L.t.nav.guide, P.guide], [L.t.leonidaH1, P.leonida]]),
      ],
      body: `
  <section class="page-head page-head--leonida"><div class="wrap"><p class="eyebrow">${esc(L.t.leonidaEyebrow)}</p><h1>${esc(L.t.leonidaH1)}</h1><p class="lead-text">${esc(L.t.leonidaLead)}</p></div></section>
  <div class="wrap layout">
    <div class="col-main">
      <section class="block" aria-labelledby="regions"><div class="block__head"><h2 id="regions">${esc(L.t.leonidaRegions)}</h2></div>
        <div class="region-grid">${LEONIDA.regions.map((r, i) => `<article class="region"><span class="region__n">${String(i + 1).padStart(2, "0")}</span><span class="region__icon" aria-hidden="true">${r.icon}</span><h3>${esc(r.name)}</h3><p>${esc(r[code] || r.es)}</p></article>`).join("")}</div>
      </section>
      ${adUnit(L, "top")}
      <section class="block" aria-labelledby="chars"><div class="block__head"><h2 id="chars">${esc(L.t.leonidaCharacters)}</h2></div>
        <div class="char-grid">${LEONIDA.characters.map((c) => `<article class="char"><span class="char__av" aria-hidden="true">${esc(c.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2))}</span><div><h3>${esc(c.name)}</h3><span class="tag">${esc(c["role_" + code] || c.role_es)}</span><p>${esc(c[code] || c.es)}</p></div></article>`).join("")}</div>
      </section>
      <p class="callout"><span>⚠ ${esc(L.t.leonidaRumor)}</span> <a href="${u(P.rumors)}">${esc(L.t.leonidaRumorCta)}</a></p>
      ${sourcesHtml(L, LEONIDA.sources)}
      ${adUnit(L, "bottom")}
    </div>
    <aside class="col-side">${sideCards(L)}</aside>
  </div>`,
    })
  );
  sitemap.push(["leonida", P.leonida, LEONIDA.updated, "weekly", "0.9"]);

  // Notas de la prensa
  write(
    P.reviews,
    layout(L, {
      title: L.t.reviewsTitle,
      description: L.t.reviewsDesc,
      key: "reviews",
      active: "guide",
      type: "article",
      jsonLd: [crumbsLd([[L.t.crumbHome, P.home], [L.t.nav.guide, P.guide], [L.t.reviewsH1, P.reviews]])],
      body: `
  <section class="page-head page-head--reviews"><div class="wrap"><p class="eyebrow">${esc(L.t.reviewsEyebrow)}</p><h1>${esc(L.t.reviewsH1)}</h1><p class="lead-text">${esc(L.t.reviewsLead)}</p></div></section>
  <div class="wrap layout">
    <div class="col-main">
      ${
        reviewList.length
          ? `<div class="score-hero"><div class="score-ring" style="--p:${reviewAvg}"><b>${reviewAvg}</b><small>/100</small></div><div><h2>${esc(L.t.reviewsAvg)}</h2><p class="muted">${esc(L.t.reviewsCount(reviewList.length))}</p></div></div>
      <div class="table-wrap"><table class="tz-table score-table"><thead><tr><th scope="col">${esc(L.t.reviewsOutlet)}</th><th scope="col">${esc(L.t.reviewsScore)}</th><th scope="col"></th></tr></thead>
        <tbody>${reviewList.map((r) => `<tr><th scope="row">${esc(r.outlet)}</th><td><span class="score score--${r.pct >= 90 ? "hi" : r.pct >= 75 ? "mid" : "lo"}">${esc(String(r.score))}${r.max !== 100 ? `/${esc(String(r.max))}` : ""}</span></td><td><a href="${esc(r.url)}" target="_blank" rel="noopener nofollow">${esc(L.t.reviewsRead)} ↗</a></td></tr>`).join("")}</tbody></table></div>`
          : `<div class="empty-state"><span aria-hidden="true">⏳</span><p>${esc(L.t.reviewsEmpty)}</p><div class="release-cd">${countdown(L, "sm")}</div></div>`
      }
      <p class="muted small">${esc(L.t.reviewsNote)}</p>
      ${adUnit(L, "bottom")}
    </div>
    <aside class="col-side">${sideCards(L)}</aside>
  </div>`,
    })
  );
  sitemap.push(["reviews", P.reviews, REVIEWS.updated, "daily", "0.9"]);

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
      ${guidesCard(L)}
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
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.aboutEyebrow)}</p><h1>Leónida Hoy</h1><p class="muted">${esc(L.t.description)}</p></div></section>
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

  // Aviso legal
  write(
    P.legal,
    layout(L, {
      title: L.t.legalTitle,
      description: L.t.legalDesc,
      key: "legal",
      active: "",
      body: `
  <section class="page-head"><div class="wrap"><p class="eyebrow">${esc(L.t.privacyEyebrow)}</p><h1>${esc(L.t.legalTitle)}</h1><p class="muted">${esc(L.t.privacyUpdated(dLong(BUILD_TIME.slice(0, 10))))}</p></div></section>
  <div class="wrap narrow prose">${L.t.legalBody({ owner: esc(cfg.legal?.owner || ""), email: esc(cfg.legal?.email || ""), issues: ISSUES_URL })}
  </div>`,
    })
  );
  sitemap.push(["legal", P.legal, latest.date, "yearly", "0.2"]);

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
    body: `<section class="page-head"><div class="wrap narrow"><p class="eyebrow">Error 404</p><h1>Te has salido del mapa</h1><p class="muted">Esta página no existe en Leónida. <span lang="en">· You've left the map: this page doesn't exist.</span></p><p class="hero__actions"><a class="btn btn--primary" href="${u("/")}">Volver al resumen de hoy</a> <a class="btn btn--ghost" href="${u(LOCALES.en.paths.home)}" lang="en">Today's briefing in English</a></p></div></section>`,
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

// Sitemap de Google Noticias: artículos de los últimos 2 días
{
  const newest = rawBriefs[0].date;
  const cutoff = new Date(new Date(newest + "T12:00:00Z").getTime() - 2 * 864e5).toISOString().slice(0, 10);
  const entries = [];
  for (const code of ACTIVE) for (const it of DATA[code].items) if (it.date >= cutoff) entries.push([code, it]);
  write(
    "news-sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries
  .map(([code, it]) => `  <url><loc>${abs(it.path)}</loc><news:news><news:publication><news:name>${esc(cfg.name)}</news:name><news:language>${code}</news:language></news:publication><news:publication_date>${it.date}T07:00:00+01:00</news:publication_date><news:title>${esc(it.title)}</news:title></news:news></url>`)
  .join("\n")}
</urlset>
`
  );
}
write("robots.txt", `User-agent: *\nAllow: /\n\nSitemap: ${abs("/sitemap.xml")}\nSitemap: ${abs("/news-sitemap.xml")}\n`);
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
