// Verificador del resumen diario. Uso: node scripts/check-brief.mjs content/briefs/AAAA-MM-DD.json
// Sale con código 1 y una lista de errores concretos si algo no cumple las reglas; 0 si está listo para publicar.
import fs from "node:fs";
import path from "node:path";

const file = process.argv[2];
if (!file) { console.error("Uso: node scripts/check-brief.mjs content/briefs/AAAA-MM-DD.json"); process.exit(2); }
const errs = [];
const warns = [];
const E = (m) => errs.push(m);
const W = (m) => warns.push(m);

let d;
try { d = JSON.parse(fs.readFileSync(file, "utf8")); }
catch (e) { console.error(`✗ JSON inválido: ${e.message}`); process.exit(1); }

const len = (s) => [...String(s || "")].length;
const words = (s) => String(s || "").trim().split(/\s+/).filter(Boolean).length;
const str = (v, where, max) => {
  if (typeof v !== "string" || !v.trim()) { E(`${where}: falta o está vacío`); return; }
  if (max && len(v) > max) E(`${where}: ${len(v)} caracteres, máximo ${max}. Acórtalo.`);
  if (/\b(TODO|TBD|XXX)\b|lorem ipsum|\[[^\]]*\]|\{\{/.test(v)) E(`${where}: contiene texto de relleno o corchetes`);
};
const slug = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const badHost = /(^|\.)((google|bing|duckduckgo)\.[a-z.]+|t\.co|bit\.ly|tinyurl\.com|example\.com|localhost)$/i;
const sources = (arr, where) => {
  if (!Array.isArray(arr) || !arr.length) { E(`${where}.sources: necesita al menos una fuente`); return; }
  arr.forEach((s, i) => {
    const w = `${where}.sources[${i}]`;
    str(s?.name, `${w}.name`, 40);
    let u;
    try { u = new URL(s?.url); } catch { E(`${w}.url: no es una URL válida`); return; }
    if (u.protocol !== "https:" && u.protocol !== "http:") E(`${w}.url: debe empezar por https://`);
    if (badHost.test(u.hostname)) E(`${w}.url: ${u.hostname} no es la fuente original (buscador, acortador o ejemplo)`);
    if (u.pathname === "/" || u.pathname === "") W(`${w}.url: apunta a la portada del medio, mejor el artículo concreto`);
  });
};

// --- fecha y nombre ---
const base = path.basename(file, ".json");
if (!/^\d{4}-\d{2}-\d{2}$/.test(base)) E(`nombre de archivo: debe ser AAAA-MM-DD.json`);
if (d.date !== base) E(`date: "${d.date}" no coincide con el nombre del archivo (${base})`);
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(new Date());
if (process.env.CHECK_TODAY !== "0" && d.date !== today) W(`date: ${d.date} no es hoy en Madrid (${today})`);

// --- español ---
str(d.title, "title", 110);
str(d.summary, "summary", 200);
str(d.lead, "lead", 320);
const NEWS = ["tag", "title", "change", "plain", "detail", "why"];
const item = (it, where, kind) => {
  if (kind === "news") str(it?.tag, `${where}.tag`, 20);
  str(it?.title, `${where}.title`, 110);
  str(it?.change, `${where}.change`, 330);
  str(it?.plain, `${where}.plain`, 220);
  str(it?.detail, `${where}.detail`, 420);
  if (it?.detail && words(it.detail) > 60) E(`${where}.detail: ${words(it.detail)} palabras, máximo 60`);
  str(it?.why, `${where}.why`, 200);
  sources(it?.sources, where);
  if (kind === "rumor") {
    str(it?.who, `${where}.who`, 80);
    if (!["alta", "media", "baja"].includes(it?.reliability)) E(`${where}.reliability: debe ser "alta", "media" o "baja"`);
  }
};
if (!Array.isArray(d.stories) || d.stories.length < 1 || d.stories.length > 5) E(`stories: debe tener entre 1 y 5 noticias (tiene ${d.stories?.length ?? 0})`);
else if (d.stories.length < 5) W(`stories: solo ${d.stories.length}; lo ideal son 5 si hay noticias reales suficientes`);
(d.stories || []).forEach((s, i) => item(s, `stories[${i}]`, "news"));
if (!Number.isInteger(d.biggest) || d.biggest < 0 || d.biggest >= (d.stories?.length || 0)) E(`biggest: debe ser el índice (0–${(d.stories?.length || 1) - 1}) de la historia más grande`);
if (d.more !== undefined && !Array.isArray(d.more)) E("more: debe ser una lista");
if ((d.more || []).length > 4) E(`more: máximo 4 (tiene ${d.more.length})`);
(d.more || []).forEach((s, i) => item(s, `more[${i}]`, "news"));
if (d.rumors !== undefined && !Array.isArray(d.rumors)) E("rumors: debe ser una lista");
if ((d.rumors || []).length > 4) E(`rumors: máximo 4 (tiene ${d.rumors.length})`);
(d.rumors || []).forEach((s, i) => item(s, `rumors[${i}]`, "rumor"));
if (!Array.isArray(d.posts) || d.posts.length !== 3) E(`posts: deben ser exactamente 3 (hay ${d.posts?.length ?? 0})`);
(d.posts || []).forEach((p, i) => str(p, `posts[${i}]`, 220));
if ((d.context || []).length > 3) E("context: máximo 3");
(d.context || []).forEach((c, i) => {
  str(c?.title, `context[${i}].title`, 110);
  str(c?.text, `context[${i}].text`, 300);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c?.date || "")) E(`context[${i}].date: formato AAAA-MM-DD`);
  else if (c.date >= d.date) E(`context[${i}].date: el contexto es de días ANTERIORES, no de hoy`);
  sources(c?.sources, `context[${i}]`);
});

// --- títulos repetidos (mismo día o días anteriores) ---
const all = [...(d.stories || []), ...(d.more || []), ...(d.rumors || [])];
const seen = new Set();
all.forEach((it) => { const k = slug(it?.title || ""); if (seen.has(k)) E(`título repetido hoy: "${it.title}"`); seen.add(k); });
const dir = path.dirname(file);
for (const f of fs.readdirSync(dir).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f) && f < path.basename(file))) {
  try {
    const old = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const olds = new Set([...(old.stories || []), ...(old.more || []), ...(old.rumors || [])].map((x) => slug(x.title)));
    all.forEach((it) => { if (olds.has(slug(it?.title || ""))) E(`"${it.title}" ya se publicó el ${old.date}. Si hay novedad real, usa un título nuevo que la cuente; si no, quítala.`); });
  } catch {}
}

// --- inglés ---
const en = d.en;
if (!en || typeof en !== "object") E('en: falta el bloque "en" con la versión en inglés');
else {
  str(en.title, "en.title", 110);
  str(en.summary, "en.summary", 200);
  str(en.lead, "en.lead", 320);
  for (const k of ["stories", "more", "rumors", "context"]) {
    const a = d[k] || [], b = en[k] || [];
    if (a.length !== b.length) E(`en.${k}: tiene ${b.length} elementos y en español hay ${a.length}. Deben coincidir en número y orden.`);
  }
  for (const [k, kind] of [["stories", "news"], ["more", "news"], ["rumors", "rumor"]]) {
    (en[k] || []).forEach((it, i) => {
      const w = `en.${k}[${i}]`;
      const fields = kind === "rumor" ? ["title", "change", "plain", "detail", "why", "who"] : NEWS;
      fields.forEach((f) => str(it?.[f], `${w}.${f}`, f === "detail" ? 420 : f === "title" ? 110 : f === "change" ? 330 : f === "tag" ? 20 : 220));
      if (it?.sources || it?.reliability || it?.date) E(`${w}: no repitas sources, reliability ni date en "en" (se toman del español)`);
    });
  }
  if (!Array.isArray(en.posts) || en.posts.length !== 3) E("en.posts: deben ser exactamente 3");
  (en.posts || []).forEach((p, i) => str(p, `en.posts[${i}]`, 220));
  (en.context || []).forEach((c, i) => { str(c?.title, `en.context[${i}].title`, 110); str(c?.text, `en.context[${i}].text`, 300); });
}

for (const w of warns) console.log("⚠ " + w);
if (errs.length) {
  console.log(`✗ ${errs.length} error(es) — corrígelos y vuelve a ejecutar:`);
  for (const e of errs) console.log("  - " + e);
  process.exit(1);
}
console.log(`✓ ${base}: listo (${d.stories.length} noticias, ${(d.more || []).length} extra, ${(d.rumors || []).length} rumores, inglés completo)`);
