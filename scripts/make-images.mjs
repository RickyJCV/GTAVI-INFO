// Genera los PNG de marca (iconos e imagen para redes) a partir del logo SVG.
// Requiere Playwright: `node scripts/make-images.mjs`. Solo hace falta si cambias el logo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const A = (f) => path.join(ROOT, "assets", f);
const mark = fs.readFileSync(A("logo-mark.svg"), "utf8");
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@600;800&display=block">`;

const browser = await chromium.launch();
const page = await browser.newPage();

for (const [file, size] of [["icon-512.png", 512], ["icon-192.png", 192], ["apple-touch-icon.png", 180]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<style>html,body{margin:0;background:#0e0722}svg{width:${size}px;height:${size}px;display:block}</style>${mark}`);
  await page.screenshot({ path: A(file) });
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`${fonts}
<style>
  html,body{margin:0;width:1200px;height:630px;overflow:hidden;font-family:Inter,sans-serif;color:#fff}
  .bg{position:absolute;inset:0;background:
    radial-gradient(55% 80% at 82% 105%,rgba(255,46,136,.55),transparent 60%),
    radial-gradient(40% 50% at 8% 0%,rgba(45,226,230,.22),transparent 60%),
    linear-gradient(180deg,#1a0b3d,#2b0f4f 55%,#4a1250)}
  .grid{position:absolute;left:-10%;right:-10%;bottom:0;height:42%;
    background:linear-gradient(transparent 0 calc(100% - 2px),rgba(45,226,230,.35) 0) 0 0/100% 34px,
    linear-gradient(90deg,transparent 0 calc(100% - 2px),rgba(45,226,230,.28) 0) 0 0/70px 100%;
    transform:perspective(420px) rotateX(58deg);transform-origin:bottom;
    -webkit-mask-image:linear-gradient(to top,#000 10%,transparent 95%)}
  .sun{position:absolute;right:70px;top:90px;width:400px;height:400px}
  .sun svg{width:100%;height:100%;filter:drop-shadow(0 30px 60px rgba(255,46,136,.5))}
  .copy{position:absolute;left:80px;top:110px;width:660px}
  .kicker{font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#2de2e6;font-size:24px}
  h1{font-family:Anton,sans-serif;font-weight:400;font-size:150px;line-height:.95;margin:18px 0 10px;letter-spacing:.02em}
  h1 em{font-style:normal;background:linear-gradient(100deg,#ffe14d,#ff8a3d 40%,#ff2e88);-webkit-background-clip:text;color:transparent}
  p{font-size:34px;line-height:1.3;color:#e8defd;font-weight:600;margin:0}
</style>
<div class="bg"></div><div class="grid"></div>
<div class="sun">${mark}</div>
<div class="copy"><div class="kicker">El resumen matutino de GTA VI</div><h1>LEONIDA<br><em>HOY</em></h1><p>Las 5 noticias que importan, cada mañana. Con fuente.</p></div>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: A("og.png") });

await browser.close();
console.log("✓ iconos y og.png generados en assets/");
