# Manual de Leónida Hoy

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

1. La web está en la raíz de `leonidahoy.github.io`, así que `ads.txt` se publica en `https://leonidahoy.github.io/ads.txt`. Si algún día usas dominio propio, configúralo en **Settings → Pages → Custom domain** y cambia `siteUrl` en `site.config.json`.
2. Solicita AdSense con ese dominio. Cuando te den tu ID (`ca-pub-XXXXXXXXXXXXXXXX`), ponlo en `site.config.json → adsense.client` (o como variable del repo `ADSENSE_CLIENT`). Eso añade el script, la meta de verificación y genera `ads.txt`.
3. Activa **Auto ads** en el panel de AdSense. Si además creas bloques manuales, pega sus IDs en `adsense.slots` (`top`, `inFeed`, `sidebar`, `bottom`); los huecos ya están colocados y reservan espacio para no mover el diseño.
4. Para visitantes de la UE/Reino Unido, activa el mensaje de consentimiento en **AdSense → Privacidad y mensajes → RGPD** (es obligatorio un CMP certificado; el de Google es gratis).
5. Requisitos que AdSense revisa y que ya están cubiertos: contenido original, página «Acerca», política de privacidad, navegación clara. Publica a diario unas 2–3 semanas antes de solicitarlo para tener contenido suficiente.

## Buscadores

- **Bing, Yandex y otros (IndexNow):** automático. Cada publicación avisa de todas las URLs del sitemap.
- **Google Search Console:** añade una propiedad «Prefijo de la URL» con `https://leonidahoy.github.io/`, elige verificación «Etiqueta HTML», copia el valor de `content="…"` en `googleSiteVerification` de `site.config.json`, publica, pulsa «Verificar» y envía `sitemap.xml` en «Sitemaps».

## Resumen automático

Una tarea programada de Claude se ejecuta cada mañana: busca las noticias de GTA VI de las últimas 24 horas, crea `content/briefs/<fecha>.json`, comprueba que la web se construye y lo sube a `main`.

## Pendiente

- [ ] AdSense → Privacidad y mensajes → Normativa europea (RGPD): crear y publicar el mensaje de consentimiento (política: `https://leonidahoy.github.io/privacidad/`; opciones Consentir, Gestionar opciones y No consentir).
- [ ] Esperar la aprobación de AdSense y activar «Anuncios automáticos».
- [ ] Search Console: añadir la propiedad `https://leonidahoy.github.io/` (etiqueta HTML, el código ya está en la web) y enviar `sitemap.xml`.
- [ ] AdSense: añadir el sitio `leonidahoy.github.io` en «Sitios» y solicitar revisión.

## Inglés

- La web se publica en español (`/`) y en inglés (`/en/`), enlazadas entre sí con `hreflang` para que Google muestre a cada visitante su idioma.
- Cada resumen diario lleva un bloque `"en"` con la traducción de `title`, `summary`, `lead`, `stories` (mismo número y orden: `tag`, `title`, `change`, `plain`), `posts` y `context` (`title`, `text`). Las fuentes y fechas no se repiten: se toman del original.
- La guía en inglés está en `content/guide.en.json` (misma estructura que `content/guide.json`).
- Textos de la interfaz: `scripts/i18n.mjs`. Para añadir otro idioma basta con otro bloque ahí, su guía y su bloque en cada resumen.
- La tarea diaria escribe los dos idiomas en el mismo paso.

## Más noticias y rumores

- `more` (opcional): noticias extra del día, mismo formato que `stories` (`tag`, `title`, `change`, `plain`, `sources`).
- `rumors` (opcional): solo los rumores más comentados y siempre con fuente con nombre. Cada uno lleva `title`, `change`, `plain`, `sources`, `who` (quién lo dice) y `reliability`: `alta` (insider con buen historial y verificado por un medio), `media` (medio fiable con fuentes anónimas) o `baja` (filtrador sin historial o dataminers).
- En el bloque `en`, `more` y `rumors` van en el mismo orden con `title`, `change`, `plain` (y `tag` / `who`).

## Secciones y páginas de detalle

- Menú: Hoy (`/`), Noticias (`/noticias/`), Rumores (`/rumores/`), Guía y Archivo; en inglés bajo `/en/`.
- Cada noticia (`stories` + `more`) y cada rumor tiene página propia, generada sola a partir del título. No cambies un título ya publicado: cambiaría su dirección.
- Campos opcionales por noticia o rumor para esa página: `detail` (2–3 frases con los detalles, redacción propia, nunca texto copiado del medio) y `why` (una frase: por qué importa). También en el bloque `en`.

## App en el móvil (iPhone y Android)
- La web se instala como app desde el navegador (no hace falta App Store ni Google Play). Guía para la gente: `/app/` y `/en/app/`.
- En el móvil hay una **barra de pestañas abajo** (Hoy, Noticias, Rumores, Notas, Guía). En las secciones se puede **deslizar a izquierda o derecha** para cambiar de pestaña; tocar la pestaña activa sube arriba del todo.
- Al entrar desde un móvil, a los pocos segundos (o en la segunda página vista) sale un panel **«Instala Leónida Hoy»** con los pasos de **su** dispositivo: iPhone con Safari, iPhone con Chrome/Firefox/Edge, Android (botón de instalar directo si el navegador lo permite) o aviso de «ábrelo en el navegador» si viene de Instagram, TikTok, Facebook…
- Si alguien pulsa «Ahora no», no vuelve a salir en 14 días. Nunca sale en ordenador, dentro de la app ya instalada ni en la página `/app/`.
- Dentro de la app: deslizar hacia abajo arriba del todo para actualizar, aviso cuando hay noticias nuevas y lectura sin conexión.

## Trucos (`/trucos-gta-6/` y `/en/gta-6-cheats/`)
- Los datos están en `content/trucos.json`. Cada truco lleva su secuencia de cruceta (`U`, `D`, `L`, `R`), qué hace, cómo se desbloquea y su estado: **coincide** (al menos 2 guías dan el mismo código) o **pendiente** (aún no está claro; sale sin código).
- La página dibuja cada botón con iconos propios. Tiene un selector **PS5 / Xbox** que se recuerda y que en el navegador de la Xbox se elige solo.
- La tarea programada busca trucos nuevos **cada lunes por la mañana** (instrucciones en `docs/TAREA-DIARIA.md`).
- `node scripts/check-trucos.mjs` valida el archivo: formato, fuentes, y bloquea fallos, trucos online, mods o hacks. Se ejecuta también al publicar, así que un truco mal escrito nunca llega a la web.
- En el móvil, **Trucos** ocupa la pestaña que antes era **Notas**. Notas sigue en la portada, en el menú de ordenador, en el pie y en la tarjeta «Guía».
