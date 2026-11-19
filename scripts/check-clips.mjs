// Verifica content/clips.json antes de publicar (formato, enlaces admitidos y contenido apto).
// La comprobación de que cada vídeo existe y se puede insertar la hace build.mjs al publicar (CLIPS_VERIFY=1).
// Uso: node scripts/check-clips.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const E = (m) => errors.push(m);
let d;
try {
  d = JSON.parse(fs.readFileSync(path.join(ROOT, "content/clips.json"), "utf8"));
} catch (e) {
  console.error(`✗ content/clips.json no es JSON válido: ${e.message}`);
  process.exit(1);
}
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
const CATS = ["humor", "stunts", "graphics", "explore", "easter", "tips", "music", "review"];
// Enlaces admitidos: solo vídeos concretos de plataformas con reproductor oficial
const okUrl = [
  /^https:\/\/(www\.|m\.)?youtube\.com\/watch\?v=[\w-]{11}(&[\w=&%.-]*)?$/,
  /^https:\/\/(www\.)?youtube\.com\/shorts\/[\w-]{11}\/?(\?[\w=&%.-]*)?$/,
  /^https:\/\/youtu\.be\/[\w-]{11}(\?[\w=&%.-]*)?$/,
  /^https:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d{8,25}\/?(\?[\w=&%.-]*)?$/,
  /^https:\/\/(www\.)?(x|twitter)\.com\/\w{1,15}\/status\/\d{5,25}\/?(\?[\w=&%.-]*)?$/,
];
const banned = /\b(spoilers?|final del juego|ending|leak(?:ed|s)?|filtrad[oa]s?|filtración|glitch(?:es)?|exploit|money glitch|dinero infinito|mod ?menu|mods?|hack(?:s|eo)?|trainer|torrent|crack|gratis|free download|descarga|desnud[oa]|nude|sexo|sex|gore|nsfw|\+18|18\+)\b/i;

if (!isoDate.test(d.updated || "")) E("«updated» debe ser AAAA-MM-DD.");
const ids = new Set();
const urls = new Set();
for (const [i, c] of (d.items || []).entries()) {
  const w = `clip ${i + 1} (${c.id || "sin id"})`;
  if (!/^[a-z0-9-]{3,60}$/.test(c.id || "")) E(`${w}: «id» corto, en minúsculas y con guiones.`);
  if (ids.has(c.id)) E(`${w}: id repetido.`);
  ids.add(c.id);
  if (!okUrl.some((re) => re.test(c.url || ""))) E(`${w}: el enlace debe ser un vídeo concreto de YouTube (watch, shorts o youtu.be), TikTok (@usuario/video/…) o X (usuario/status/…). Copia la URL exacta del resultado de búsqueda.`);
  // mismo vídeo aunque cambie el formato del enlace (watch, youtu.be, shorts…)
  const idm = (c.url || "").match(/(?:v=|youtu\.be\/|shorts\/)([\w-]{11})|\/video\/(\d+)|\/status\/(\d+)/);
  const key = idm ? idm[1] || idm[2] || idm[3] : c.url;
  if (urls.has(key)) E(`${w}: ese vídeo ya está en la lista.`);
  urls.add(key);
  if (!["es", "en"].includes(c.lang)) E(`${w}: «lang» debe ser es o en (idioma del vídeo).`);
  if (!isoDate.test(c.date || "") || c.date > today) E(`${w}: «date» debe ser la fecha en que lo añades (AAAA-MM-DD), no futura.`);
  if (!CATS.includes(c.cat)) E(`${w}: «cat» debe ser una de: ${CATS.join(", ")}.`);
  for (const lang of ["es", "en"]) {
    const v = c.note?.[lang];
    if (!v || typeof v !== "string") E(`${w}: falta note.${lang} (una frase tuya sobre qué se ve).`);
    else if (v.length > 180) E(`${w}: note.${lang} es demasiado larga (máx. 180).`);
  }
  // «sin spoilers» / «no spoilers» es buena señal, no un motivo para rechazar
  const txt = [c.title, c.note?.es, c.note?.en].filter(Boolean).join(" · ").replace(/\b(sin|no|without|zero|0)\s+(story\s+)?spoilers?\b/gi, "").replace(/\bspoiler[- ]?free\b/gi, "");
  if (banned.test(txt)) E(`${w}: contiene «${txt.match(banned)[0]}». Solo clips sin spoilers, sin filtraciones, sin trampas para el online y aptos para todos.`);
  if (c.title && c.title.length > 160) E(`${w}: «title» demasiado largo.`);
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error(es) en content/clips.json. Corrígelos y vuelve a ejecutar.`);
  process.exit(1);
}
console.log(`✓ clips.json listo: ${(d.items || []).length} clips (el título y el autor reales se comprueban en cada plataforma al publicar).`);
