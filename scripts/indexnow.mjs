// Avisa a Bing, Yandex y demás buscadores IndexNow de las URLs del sitemap.
// Se ejecuta en el workflow tras publicar. No falla el job si el servicio no responde.
import fs from "node:fs";
const cfg = JSON.parse(fs.readFileSync(new URL("../site.config.json", import.meta.url), "utf8"));
const site = (process.env.SITE_URL || cfg.siteUrl).replace(/\/$/, "");
const key = cfg.indexNowKey;
if (!key) process.exit(0);
const sitemap = fs.readFileSync("_site/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const body = { host: new URL(site).host, key, keyLocation: `${site}/${key}.txt`, urlList };
try {
  const r = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  });
  console.log(`IndexNow: HTTP ${r.status} · ${urlList.length} URLs`);
} catch (e) {
  console.log("IndexNow: sin respuesta", e.message);
}
