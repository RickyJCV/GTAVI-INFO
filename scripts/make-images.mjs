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
const fonts = `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Yellowtail&family=Inter:wght@600;800&display=block">`;

const palm = (x, h, flip) =>
  `<svg class="palm" style="left:${x}px;height:${h}px;transform:scaleX(${flip})" viewBox="-30 -26 60 120"><path d="M-1.6 0 C1 14 3.4 28 4 94 L8.2 94 C7.6 28 4.6 13 1.9 -.6 Z"/><path d="M0 0 C-8 -6 -18 -4 -25 4.5 C-17 -1 -9 -1 0 2.2 Z"/><path d="M0 0 C-6 -10 -15.5 -13.5 -23 -10.5 C-13.5 -9 -7 -5 0 1.2 Z"/><path d="M0 0 C-3 -9 -2 -16.5 2.4 -21.5 C0 -14 .6 -7 1.2 1 Z"/><path d="M0 0 C8 -9.5 18.5 -9.5 25 -3 C16.5 -5.2 9 -3 1 2 Z"/><path d="M0 0 C9.5 -3 18 2 22 10.5 C14.5 4.2 8 2 0 2.6 Z"/></svg>`;

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
  .sky{position:absolute;inset:0;background:linear-gradient(180deg,#0d0626 0%,#2a0b52 38%,#6b1466 66%,#c2266f 84%,#ff7a59 100%)}
  .sun{position:absolute;left:640px;bottom:120px;width:460px;height:460px;border-radius:50%;
    background:linear-gradient(180deg,#ffe066,#ff9a3c 38%,#ff2fa3 72%,#b026ff);
    -webkit-mask:linear-gradient(#000 0 52%,transparent 52% 55%,#000 55% 62%,transparent 62% 66%,#000 66% 72%,transparent 72% 77%,#000 77% 82%,transparent 82% 88%,#000 88%);
    box-shadow:0 0 140px 40px rgba(255,47,163,.4)}
  .sea{position:absolute;left:0;right:0;bottom:0;height:120px;background:linear-gradient(#2a0a4c,#0b0618);border-top:3px solid #26f0f1;box-shadow:0 -3px 24px rgba(38,240,241,.7)}
  .sea:after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 0 calc(100% - 1px),rgba(38,240,241,.35) 0) 0 0/100% 22px,linear-gradient(90deg,transparent 0 calc(100% - 1px),rgba(255,47,163,.3) 0) 0 0/70px 100%;-webkit-mask-image:linear-gradient(#000,transparent)}
  .palm{position:absolute;bottom:110px;fill:#07030f}
  .veil{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,6,24,.85),rgba(11,6,24,.3) 60%,transparent)}
  .copy{position:absolute;left:80px;top:96px;width:640px}
  .kicker{font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#26f0f1;font-size:24px;text-shadow:0 0 12px rgba(38,240,241,.6)}
  h1{font-family:Anton,sans-serif;font-weight:400;font-size:150px;line-height:.95;margin:20px 0 0;letter-spacing:.04em;text-shadow:0 0 30px rgba(255,47,163,.5)}
  .hoy{font-family:Yellowtail,cursive;font-size:150px;line-height:.9;color:#ff7ac6;margin:-10px 0 18px 150px;transform:rotate(-6deg);display:inline-block;
    text-shadow:0 0 8px rgba(255,47,163,.95),0 0 30px rgba(255,47,163,.7),0 0 60px rgba(255,47,163,.5)}
  p{font-size:32px;line-height:1.3;color:#f0e6ff;font-weight:600;margin:0}
</style>
<div class="sky"></div><div class="sun"></div><div class="sea"></div>
${palm(980, 330, 1)}${palm(760, 220, -1)}
<div class="veil"></div>
<div class="copy"><div class="kicker">El resumen matutino de GTA VI</div><h1>LEONIDA</h1><div class="hoy">Hoy</div><p>Las 5 noticias que importan, cada mañana. Con fuente.</p></div>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: A("og.png") });

await browser.close();
console.log("✓ iconos y og.png generados en assets/");
