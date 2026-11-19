// Verifica content/trucos.json antes de publicar: formato, fuentes y nada que incumpla normas.
// Uso: node scripts/check-trucos.mjs   (sale con error si hay algo que corregir)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const file = path.join(ROOT, "content/trucos.json");
const errors = [];
const warns = [];
const E = (m) => errors.push(m);
const W = (m) => warns.push(m);

let d;
try {
  d = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (e) {
  console.error(`✗ content/trucos.json no es JSON válido: ${e.message}`);
  process.exit(1);
}

const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const CATS = ["money", "player", "armor", "ammo", "police", "vehicles", "world", "combat"];
const DIRS = ["U", "D", "L", "R"];
// Solo trucos oficiales del modo historia: nada de fallos, online, mods ni trampas que rompan normas
const banned = /\b(glitch(?:es)?|exploit|bug de dinero|money glitch|duplica(?:r|ción)?|dupe|mod ?menu|menú de mods|mods?|hack(?:s|eo)?|trainer|online|gta online|multijugador|multiplayer|modded|cheat engine|jailbreak|torrent|crack)\b/i;
const riskyHost = /(^|\.)(mega\.nz|mediafire\.com|gofile\.io|pastebin\.com|4chan\.org|discord\.gg|t\.me|archive\.org|archive\.ph|youtube\.com|youtu\.be|tiktok\.com|reddit\.com|x\.com|twitter\.com)$/i;

if (!isoDate.test(d.updated || "")) E("«updated» debe ser la fecha de hoy en formato AAAA-MM-DD.");
for (const lang of ["es", "en"]) {
  if (!Array.isArray(d.howTo?.[lang]) || d.howTo[lang].length < 2) E(`howTo.${lang}: faltan los pasos de cómo activar trucos.`);
}

if (!Array.isArray(d.cheats) || !d.cheats.length) E("No hay trucos en «cheats».");
const ids = new Set();
const seqs = new Map();
for (const [i, c] of (d.cheats || []).entries()) {
  const w = `truco ${i + 1} (${c.id || "sin id"})`;
  if (!/^[a-z0-9-]{3,40}$/.test(c.id || "")) E(`${w}: «id» debe ser corto, en minúsculas y con guiones (ej. «dinero»).`);
  if (ids.has(c.id)) E(`${w}: el id está repetido.`);
  ids.add(c.id);
  if (!["coincide", "pendiente"].includes(c.status)) E(`${w}: «status» debe ser «coincide» o «pendiente».`);
  if (!CATS.includes(c.cat)) E(`${w}: «cat» debe ser una de: ${CATS.join(", ")}.`);
  if (!isoDate.test(c.added || "")) E(`${w}: «added» debe ser la fecha en que se añadió (AAAA-MM-DD).`);
  for (const f of ["name", "effect"]) {
    for (const lang of ["es", "en"]) {
      const v = c[f]?.[lang];
      if (!v || typeof v !== "string") E(`${w}: falta ${f}.${lang}.`);
      else if (v.length > (f === "name" ? 40 : 140)) E(`${w}: ${f}.${lang} es demasiado largo.`);
    }
  }
  const texts = [c.name?.es, c.name?.en, c.effect?.es, c.effect?.en, c.unlock?.es, c.unlock?.en].filter(Boolean).join(" · ");
  if (banned.test(texts)) E(`${w}: contiene «${texts.match(banned)[0]}». Solo se publican trucos oficiales del modo historia: nada de fallos, online, mods ni hacks.`);
  if (c.status === "coincide") {
    if (!Array.isArray(c.seq) || c.seq.length < 4 || c.seq.length > 20 || !c.seq.every((x) => DIRS.includes(x)))
      E(`${w}: «seq» debe ser una lista de 4 a 20 direcciones con U, D, L o R.`);
    if (!c.unlock?.es || !c.unlock?.en) E(`${w}: falta cómo se desbloquea (unlock.es y unlock.en). Si no se sabe, márcalo «pendiente».`);
    const key = (c.seq || []).join("");
    if (seqs.has(key)) E(`${w}: tiene la misma secuencia que «${seqs.get(key)}». Revisa las fuentes.`);
    seqs.set(key, c.id);
  } else if (c.status === "pendiente") {
    if (c.seq !== null) E(`${w}: un truco «pendiente» no lleva secuencia (seq: null) hasta que las guías coincidan.`);
  }
}

if (!Array.isArray(d.sources) || d.sources.length < 2) E("Hacen falta al menos 2 fuentes (medios o guías especializadas) en «sources».");
for (const s of d.sources || []) {
  let h = "";
  try {
    const u = new URL(s.url);
    if (u.protocol !== "https:") E(`fuente ${s.url}: debe ser https.`);
    h = u.hostname;
  } catch {
    E(`fuente «${s.name}»: la URL no es válida.`);
    continue;
  }
  if (!s.name) E(`fuente ${s.url}: falta el nombre del medio.`);
  if (riskyHost.test(h)) E(`fuente ${s.url}: ${h} no sirve como fuente (redes, vídeos, foros o descargas). Enlaza a una guía de un medio especializado.`);
}

const withCode = (d.cheats || []).filter((c) => c.status === "coincide").length;
if (!withCode) W("No hay ningún truco confirmado: la página mostrará solo los pendientes.");

for (const w of warns) console.log(`⚠ ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error(es) en content/trucos.json. Corrígelos y vuelve a ejecutar.`);
  process.exit(1);
}
console.log(`✓ trucos.json listo: ${withCode} trucos con código, ${(d.cheats || []).length - withCode} pendientes, ${(d.sources || []).length} fuentes.`);
