// Verifica content/descubrimientos.json y content/parches.json antes de publicar.
// Uso: node scripts/check-juego.mjs   (sale con error si hay algo que corregir)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const E = (m) => errors.push(m);
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const today = new Date(Date.now() + 864e5).toISOString().slice(0, 10); // margen de un día por zonas horarias
// Nada de spoilers, trampas online, filtraciones ni contenido que AdSense no admite
const banned = /\b(spoiler|final del juego|ending|muere|dies|asesina a|kills|glitch(?:es)?|exploit|dupe|duplica(?:r|ción)?|mod ?menu|mods?|hack(?:s|eo)?|trainer|dinero infinito online|money glitch|datamin(?:e|ed|ing)|filtrad[oa]s? del código|leaked files|torrent|crack|desnud[oa]|nude|sexo|sex|gore)\b/i;
const riskyHost = /(^|\.)(mega\.nz|mediafire\.com|gofile\.io|pastebin\.com|4chan\.org|discord\.gg|t\.me|archive\.org|archive\.ph|youtube\.com|youtu\.be|tiktok\.com|reddit\.com|x\.com|twitter\.com|instagram\.com|facebook\.com)$/i;

const read = (f) => {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, f), "utf8"));
  } catch (e) {
    E(`${f}: no es JSON válido (${e.message}).`);
    return null;
  }
};
const checkSources = (where, list, min = 1) => {
  if (!Array.isArray(list) || list.length < min) return E(`${where}: hace falta al menos ${min} fuente (un medio identificable).`);
  for (const s of list) {
    let h = "";
    try {
      const u = new URL(s.url);
      if (u.protocol !== "https:") E(`${where}: la fuente ${s.url} debe ser https.`);
      h = u.hostname;
    } catch {
      E(`${where}: URL de fuente no válida («${s?.url}»).`);
      continue;
    }
    if (!s.name) E(`${where}: falta el nombre del medio de ${s.url}.`);
    if (riskyHost.test(h)) E(`${where}: ${h} no sirve como fuente (redes, vídeos, foros o descargas). Enlaza al medio que lo cuenta.`);
  }
};
const checkText = (where, obj, field, max) => {
  for (const lang of ["es", "en"]) {
    const v = obj?.[field]?.[lang];
    if (!v || typeof v !== "string") E(`${where}: falta ${field}.${lang}.`);
    else {
      if (v.length > max) E(`${where}: ${field}.${lang} es demasiado largo (máx. ${max}).`);
      if (banned.test(v)) E(`${where}: ${field}.${lang} contiene «${v.match(banned)[0]}». Sin spoilers, trampas online, filtraciones ni contenido no apto para AdSense.`);
    }
  }
};

// ---------- descubrimientos ----------
const D = read("content/descubrimientos.json");
if (D) {
  const CATS = ["easter", "reference", "curiosity", "tip", "secret", "record", "tech"];
  if (!isoDate.test(D.updated || "")) E("descubrimientos: «updated» debe ser AAAA-MM-DD.");
  const ids = new Set();
  for (const [i, f] of (D.items || []).entries()) {
    const w = `descubrimiento ${i + 1} (${f.id || "sin id"})`;
    if (!/^[a-z0-9-]{3,50}$/.test(f.id || "")) E(`${w}: «id» corto, en minúsculas y con guiones.`);
    if (ids.has(f.id)) E(`${w}: id repetido.`);
    ids.add(f.id);
    if (!isoDate.test(f.date || "") || f.date > today) E(`${w}: «date» debe ser una fecha AAAA-MM-DD que no esté en el futuro.`);
    if (!CATS.includes(f.cat)) E(`${w}: «cat» debe ser una de: ${CATS.join(", ")}.`);
    checkText(w, f, "title", 110);
    checkText(w, f, "text", 420);
    checkSources(w, f.sources);
  }
}

// ---------- parches y problemas ----------
const P = read("content/parches.json");
if (P) {
  if (!isoDate.test(P.updated || "")) E("parches: «updated» debe ser AAAA-MM-DD.");
  if (!["ok", "watch", "bad"].includes(P.status?.level)) E("parches: status.level debe ser ok, watch o bad.");
  for (const lang of ["es", "en"]) if (!P.status?.[lang]) E(`parches: falta status.${lang} (resumen del estado actual).`);
  const ids = new Set();
  for (const [i, e] of (P.entries || []).entries()) {
    const w = `parche/problema ${i + 1} (${e.id || "sin id"})`;
    if (!/^[a-z0-9.-]{3,50}$/.test(e.id || "")) E(`${w}: «id» corto, en minúsculas y con guiones.`);
    if (ids.has(e.id)) E(`${w}: id repetido.`);
    ids.add(e.id);
    if (!isoDate.test(e.date || "") || e.date > today) E(`${w}: «date» debe ser una fecha AAAA-MM-DD que no esté en el futuro.`);
    if (!["update", "issue"].includes(e.type)) E(`${w}: «type» debe ser update o issue.`);
    const states = e.type === "issue" ? ["open", "fixed"] : ["nonotes", "notes"];
    if (!states.includes(e.state)) E(`${w}: «state» debe ser ${states.join(" o ")} para type «${e.type}».`);
    if (!Array.isArray(e.platforms) || !e.platforms.length || !e.platforms.every((p) => ["ps5", "xbox", "pc"].includes(p))) E(`${w}: «platforms» debe ser una lista con ps5, xbox o pc.`);
    checkText(w, e, "title", 110);
    checkText(w, e, "text", 500);
    checkSources(w, e.sources);
  }
}

if (errors.length) {
  for (const e of errors) console.error(`✗ ${e}`);
  console.error(`\n${errors.length} error(es). Corrígelos y vuelve a ejecutar.`);
  process.exit(1);
}
console.log(`✓ juego listo: ${D?.items?.length || 0} descubrimientos, ${P?.entries?.length || 0} entradas de parches y problemas.`);
