# Leonida Hoy 🌴 — el resumen matutino de GTA VI

Web estática en español con **las 5 noticias de GTA VI que importan cada día**: una línea por historia, enlace a la fuente debajo de cada una y tres publicaciones listas para redes sobre la noticia más grande.

- **Hoy**: resumen del día + cuenta atrás al lanzamiento (19 nov 2026, 00:00 hora local)
- **Selector de lectura**: «Sigo cada update» (detalle) / «Soy nuevo» (palabras simples)
- **Listo para publicar**: 3 posts con botón de copiar y compartir en X, WhatsApp y Telegram
- **Guía** con preguntas frecuentes (fecha, precio, PC, tamaño, FPS) y datos estructurados `FAQPage`
- **Archivo** con una URL propia por día (`/resumen/AAAA-MM-DD/`)
- SEO: `NewsArticle` JSON-LD, Open Graph, `sitemap.xml`, `robots.txt`, RSS (`/feed.xml`), `max-image-preview:large` para Google Discover
- AdSense listo (se activa con tu ID), página de privacidad y cookies, manifest PWA, 404

## Estructura

```
content/briefs/AAAA-MM-DD.json   ← un archivo por día (lo único que tocas a diario)
content/guide.json               ← guía y FAQ
site.config.json                 ← nombre, URL, AdSense, Analytics, redes
assets/                          ← CSS, JS, logo, iconos, imagen OG
scripts/build.mjs                ← generador (Node 18+, sin dependencias)
scripts/make-images.mjs          ← regenera iconos y og.png desde el logo (Playwright)
.github/workflows/pages.yml      ← construye y publica en GitHub Pages
```

```bash
node scripts/build.mjs   # genera _site/
npm run preview          # http://localhost:8080
```

## Publicar en GitHub Pages

Cada push a `main` construye la web y la publica en la rama `gh-pages` (workflow `.github/workflows/pages.yml`).
GitHub Pages debe servir esa rama: **Settings → Pages → Build and deployment → Source: Deploy from a branch → `gh-pages` / `(root)`**.
La web queda en `https://rickyjcv.github.io/GTAVI-INFO/`.

> Con el plan gratuito de GitHub, Pages solo funciona en repositorios **públicos**.

## Rutina diaria (5 minutos)

1. Con búsqueda web activada, ejecuta el prompt de abajo.
2. Copia `content/briefs/2026-11-14.json` como `content/briefs/<fecha de hoy>.json` y rellénalo con el resultado.
   - `change` = la línea de «qué cambió» (para fans); `plain` = la misma idea en palabras simples (para nuevos).
   - `biggest` = índice (0–4) de la historia más grande; `posts` = las 3 publicaciones.
   - `context` (opcional) = noticias de días anteriores que siguen siendo relevantes, con su fecha.
3. Haz commit y push a `main`. La portada, el archivo, el sitemap y el RSS se actualizan solos.
   El build falla a propósito si alguna historia no lleva fuente.

**Prompt:**

> Busca en la web las noticias de hoy sobre GTA VI.
> Mi audiencia: fans que siguen cada actualización y jugadores nuevos.
> Reglas: usa historias de las últimas 24 horas. Omite rumores sin fuente nombrada. Pon un enlace debajo de cada historia.
> Dame las cinco historias que importan a mi audiencia, con una línea cada una sobre qué cambió (y otra línea en palabras simples para nuevos). Luego escribe tres publicaciones cortas sobre la historia más grande, en palabras simples, listas para publicar. Devuélvelo en el formato JSON de `content/briefs/`.

## Monetizar con Google AdSense

1. **Dominio propio (muy recomendable).** AdSense aprueba sitios por dominio y necesita `ads.txt` en la raíz. En `rickyjcv.github.io/GTAVI-INFO/` el `ads.txt` no queda en la raíz, así que la aprobación es difícil. Compra un dominio (p. ej. `leonidahoy.com`, ~10 €/año), configúralo en **Settings → Pages → Custom domain** y cambia `siteUrl` en `site.config.json`.
2. Solicita AdSense con ese dominio. Cuando te den tu ID (`ca-pub-XXXXXXXXXXXXXXXX`), ponlo en `site.config.json → adsense.client` (o como variable del repo `ADSENSE_CLIENT`). Eso añade el script, la meta de verificación y genera `ads.txt`.
3. Activa **Auto ads** en el panel de AdSense. Si además creas bloques manuales, pega sus IDs en `adsense.slots` (`top`, `inFeed`, `sidebar`, `bottom`); los huecos ya están colocados y reservan espacio para no mover el diseño.
4. Para visitantes de la UE/Reino Unido, activa el mensaje de consentimiento en **AdSense → Privacidad y mensajes → RGPD** (es obligatorio un CMP certificado; el de Google es gratis).
5. Requisitos que AdSense revisa y que ya están cubiertos: contenido original, página «Acerca», política de privacidad, navegación clara. Publica a diario unas 2–3 semanas antes de solicitarlo para tener contenido suficiente.

## Estrategia de tráfico

- **Español = menos competencia.** Casi toda la cobertura de GTA VI está en inglés; aquí resumimos fuentes en inglés para el público hispanohablante.
- **Una URL por día** en `/resumen/fecha/`: cada día es una página nueva indexable para búsquedas de actualidad («GTA 6 parche», «GTA 6 hoy»).
- **Guía evergreen** para las búsquedas masivas de la semana de lanzamiento: «cuándo sale GTA 6», «precio GTA 6», «GTA 6 PC», «cuánto ocupa GTA 6». Actualiza `content/guide.json` cuando cambie algo.
- **Google Search Console + Bing Webmaster**: da de alta la web y envía `sitemap.xml` el primer día.
- **Hora fija**: publica antes de las 7:00 (hora de España) para captar el tráfico del desayuno y de América Latina por la noche.
- **Redes**: los 3 posts diarios llevan el enlace a la web. Lo más eficaz es un **canal de WhatsApp y otro de Telegram** (rellena `social` en la config para que aparezcan en el pie) y X/TikTok con el post 1.
- **Semana de lanzamiento (19 nov)**: es el pico de búsquedas. Publica también la tarde del 18 y la mañana del 19 (hora de desbloqueo, descarga, emisión de YouTube).
- **Confianza**: fuentes siempre enlazadas y estimaciones marcadas como tales. Esto también ayuda a entrar en Google Discover y Noticias.

---

Web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive.
