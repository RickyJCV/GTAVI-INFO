# Manual de Leonida Hoy

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

## Buscadores

- **Bing, Yandex y otros (IndexNow):** automático. Cada publicación avisa de todas las URLs del sitemap.
- **Google Search Console:** añade una propiedad «Prefijo de la URL» con `https://rickyjcv.github.io/GTAVI-INFO/`, elige verificación «Etiqueta HTML», copia el valor de `content="…"` en `googleSiteVerification` de `site.config.json`, publica, pulsa «Verificar» y envía `sitemap.xml` en «Sitemaps».

## Resumen automático

Una tarea programada de Claude se ejecuta cada mañana: busca las noticias de GTA VI de las últimas 24 horas, crea `content/briefs/<fecha>.json`, comprueba que la web se construye y lo sube a `main`.
