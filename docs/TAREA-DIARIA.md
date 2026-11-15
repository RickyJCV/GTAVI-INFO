# Tarea diaria: resumen de GTA VI

Instrucciones para el agente que publica cada mañana el resumen de **Leónida Hoy** (https://leonidahoy.github.io/, español en `/` e inglés en `/en/`).
El dueño del repositorio autoriza **commit y push directo a `main`** (así se publica la web). Nada de pull requests ni otras ramas.

**Ahorra cuota:** sin subagentes, sin leer archivos que aquí no se indican, máximo 6 búsquedas web, sin abrir páginas web salvo que una búsqueda no aclare un dato, respuestas cortas.

## Pasos

1. **Repo.** (Ambos modos.) Si ya tienes el repo en tu directorio de trabajo (la sesión dedicada lo trae), usa esa copia: `git checkout main && git pull --ff-only origin main`. Si no, llama a `add_repo` (owner `leonidahoy`, repo `leonidahoy.github.io`, access `push`). Si no la ves entre tus herramientas, búscala con ToolSearch (consulta `add_repo`) y llámala: sin ella el `git push` final falla. Si no hay copia local: `git clone --depth 20 https://github.com/leonidahoy/leonidahoy.github.io && cd leonidahoy.github.io`. Trabaja en `main`.
2. **Elige el modo.** `HOY=$(TZ=Europe/Madrid date +%F)`.
   - Si **no existe** `content/briefs/$HOY.json` → **modo MAÑANA**: crea el resumen del día (pasos 3–11).
   - Si **ya existe** → **modo TARDE** (ver sección «Modo TARDE» más abajo): añade solo lo nuevo de las últimas 12 horas.
3. **Qué se publicó ya.** Lee solo el JSON más reciente de `content/briefs/` (es la referencia del formato y del tono) y lista títulos anteriores: `grep -h '"title"' content/briefs/*.json | tail -60`.
4. **Busca.** Calcula las fechas en inglés: `HOY_EN=$(TZ=Europe/Madrid date +'%B %-d %Y')` y `AYER_EN=$(TZ=Europe/Madrid date -d yesterday +'%B %-d %Y')`. Lanza estas 4 en el mismo turno, en modo `extended` (las genéricas tipo «news today» devuelven páginas viejas):
   - `GTA 6 news $HOY_EN`
   - `GTA 6 news $AYER_EN`
   - `GTA 6 Rockstar update OR announcement OR trailer $AYER_EN`
   - `GTA 6 leak OR rumor OR insider November` (rumores)
   Con lo que encuentres, como mucho 2 búsquedas más (`standard`): una para confirmar el tema más fuerte y otra de rumores en español (`GTA 6 rumores filtración`). Fuentes que suelen tener la actualidad con fecha: Insider Gaming, VGC, IGN, GameSpot, Kotaku, Eurogamer, PC Gamer, Dexerto, VideoCardz, VGTimes, GamePro (directo), 3DJuegos, Vandal, Rockstar Newswire.
   **Objetivo: que la web tenga movimiento cada día.** Publica siempre que tengas al menos 1 noticia o 1 rumor nuevos para la web (ver «Qué cuenta como nuevo»). Solo si de verdad no hay nada nuevo, no publiques y explica qué buscaste.
5. **Escribe** `content/briefs/$HOY.json` siguiendo el esquema de abajo.
6. **Verifica:** `node scripts/check-brief.mjs content/briefs/$HOY.json`. Si da errores, corrige exactamente lo que dice y repite hasta que diga «✓ … listo». Los avisos «⚠» no bloquean, pero léelos.
7. **Construye:** `node scripts/build.mjs`. Debe decir `idiomas: es, en` y no `sin inglés`.
8. **Guía (rara vez):** solo si cambió un dato confirmado (fecha, precio, plataformas, PC, tamaño, FPS), actualiza `content/guide.json` y `content/guide.en.json` (y su `updated`), con fuente.
9. **Publica:** `git add content && git commit -m "Resumen GTA VI $HOY" && git push origin main`. Si da 403, vuelve a llamar a `add_repo` y reintenta; si persiste, dilo claramente. Si es error de red, reintenta hasta 4 veces esperando 2, 4, 8 y 16 s.
10. **Comprueba la publicación:** espera con un bucle `until` (máximo 4 min) a que `git fetch -q --depth 1 origin gh-pages && git log -1 --format=%s origin/gh-pages` muestre `Publicar <sha corto de tu commit>`. Si no aparece, dilo.
11. **Responde** en español, breve: titular; cada noticia y cada rumor (con su fiabilidad) en una línea; los 3 posts en español y en inglés.

## Modo TARDE (la tarea se ejecuta a las 6:36 y a las 18:36)

Objetivo: cobertura cada 12 horas sin repetir nada. Máximo 4 búsquedas.

1. Lee `content/briefs/$HOY.json` (lo publicado esta mañana) y los títulos de días anteriores (`grep -h '"title"' content/briefs/*.json | tail -60`).
2. Busca en el mismo turno, modo `extended`: `GTA 6 news $HOY_EN`, `GTA 6 Rockstar $HOY_EN` y `GTA 6 leak OR rumor OR insider $HOY_EN`.
3. Quédate solo con lo **nuevo de las últimas ~12 horas** que **no** esté ya en el archivo ni en días anteriores.
   - **Si no hay nada nuevo:** no toques nada y termina diciendo «Sin novedades esta tarde». (Es lo normal algunos días; no fuerces contenido.)
4. Si hay novedades, **añade sin borrar ni cambiar lo de la mañana** (cambiar un título rompería su enlace):
   - noticias nuevas → al **final** de `more` (máximo 8 en total en el día);
   - si una novedad es más importante que todo lo de la mañana, igualmente va a `more`, y puedes reescribir `title`, `summary` y `lead` del día para destacarla;
   - rumores nuevos → al final de `rumors` (máximo 6);
   - lo mismo, en el **mismo orden**, en `en.more` / `en.rumors` (y `en.title`/`en.summary`/`en.lead` si los cambiaste);
   - no toques `stories`, `biggest`, `posts` ni `context`.
5. Pasos 6, 7, 9, 10 y 11 igual que por la mañana, con el mensaje de commit `Resumen GTA VI $HOY (tarde)`. En la respuesta, lista solo lo añadido.

## Reglas de contenido (obligatorias)

### Qué cuenta como nuevo

Lo importante es que **no esté ya publicado en la web** (compáralo con los títulos de días anteriores), no que sea de hace pocas horas:
- **Noticias** (`stories` y `more`): lo publicado por los medios en los **últimos 3 días**, priorizando lo más reciente. También vale **información útil y todavía vigente** que no hayamos contado aunque se anunciara antes (horarios de desbloqueo, juego en la nube, ediciones, códigos, tamaño, precios, eventos): en ese caso di en `detail` cuándo se anunció.
- **Rumores** (`rumors`): los más comentados de las **últimas 2 semanas** que no tengamos, siempre con fuente con nombre y su fiabilidad. Busca rumores en **cada** ejecución: dan vida a la web.
- **No hace falta una fecha exacta**: basta con que los resultados indiquen que es reciente o que sigue vigente. Si dudas de la fecha de una noticia, no la descartes: pásala a `more` y deja claro en `detail` lo que se sabe.
- Prioridad en `stories`: lo confirmado más reciente e importante. Si hay menos de 5 noticias, pon las que haya (mínimo 1).
- **Nunca inventes** datos, cifras, citas ni URLs. Cada `url` debe ser una dirección que hayas visto en los resultados de búsqueda y que apunte al **artículo concreto** (no a buscadores, acortadores ni portadas). **No hace falta abrir la página:** basta con que el dato y la URL aparezcan en los resultados de búsqueda y el resultado indique que es reciente. Si una web no carga, no la descartes por eso.
- **Redacción propia.** Resume con tus palabras. Nunca copies frases del medio (como mucho, una cita muy breve entre comillas y atribuida). Esto es lo que hace legal la web.
- **No repitas** noticias ni rumores ya publicados. Si hay novedad real sobre un tema anterior, escribe un título nuevo que cuente esa novedad.
- **Estimaciones** de terceros (ventas, reservas, presupuestos) siempre marcadas como estimaciones.
- **Rumores:** solo los más comentados, siempre con fuente con nombre (insider conocido o medio identificable) y nunca mezclados con las noticias. Fiabilidad:
  - `alta`: insider con buen historial **y** verificado por un medio por su cuenta.
  - `media`: medio fiable con fuentes anónimas, o indicios indirectos (documentos, finanzas).
  - `baja`: filtrador sin historial, dataminers o una sola cuenta sin eco en medios.
- **Si hay pocas noticias reales**, pon menos (mínimo 1). Mejor 3 noticias buenas que 5 forzadas. `more` y `rumors` pueden ir vacíos (`[]`).
- **Español de España**, claro y directo. Inglés natural (no traducción literal).
- **Nombres:** la web se llama «Leónida Hoy». En los textos en español escribe el estado del juego como «Leónida» (con tilde); en el bloque `en`, «Leonida» (sin tilde, como Rockstar en inglés). Nunca cambies las URL de las fuentes.

## Esquema

Límites que comprueba el verificador: `title` ≤110 caracteres, `summary` ≤200, `change` ≤330, `plain` ≤220, `detail` ≤60 palabras, `why` ≤200, cada post ≤220. `stories` 1–5, `more` 0–4 por la mañana (hasta 8 tras la tarde), `rumors` 0–4 por la mañana (hasta 6 tras la tarde), `posts` exactamente 3, `context` 0–3.

```json
{
  "date": "AAAA-MM-DD",
  "title": "Titular de la historia más grande",
  "summary": "Una frase que resume el día (≤200 car.).",
  "lead": "Dos frases de entrada para la portada.",
  "stories": [
    {
      "tag": "Actualización",
      "title": "Título claro de la noticia",
      "change": "Qué cambió, en una línea, con el dato concreto (para fans).",
      "plain": "Lo mismo en palabras simples para quien no sigue el juego.",
      "detail": "2–3 frases con los detalles, redacción propia, ≤60 palabras.",
      "why": "Una frase: por qué le importa al lector.",
      "sources": [{ "name": "Nombre del medio", "url": "https://medio.com/articulo-concreto" }]
    }
  ],
  "biggest": 0,
  "more": [],
  "rumors": [
    {
      "title": "Lo que dice el rumor",
      "change": "Qué se dice y quién, dejando claro que no está confirmado.",
      "plain": "En palabras simples.",
      "detail": "Contexto: de dónde sale, si hay versiones contrarias.",
      "why": "Qué supondría si se cumple.",
      "who": "Insider o medio que lo dice",
      "reliability": "alta | media | baja",
      "sources": [{ "name": "Medio", "url": "https://..." }]
    }
  ],
  "posts": ["Post 1 (≤220 car.)", "Post 2", "Post 3"],
  "context": [
    { "title": "Algo de días anteriores", "text": "Breve explicación.", "date": "AAAA-MM-DD", "sources": [{ "name": "Medio", "url": "https://..." }] }
  ],
  "en": {
    "title": "...", "summary": "...", "lead": "...",
    "stories": [{ "tag": "...", "title": "...", "change": "...", "plain": "...", "detail": "...", "why": "..." }],
    "more": [],
    "rumors": [{ "title": "...", "change": "...", "plain": "...", "detail": "...", "why": "...", "who": "..." }],
    "posts": ["...", "...", "..."],
    "context": [{ "title": "...", "text": "..." }]
  }
}
```

En `en` van **los mismos elementos en el mismo orden**, sin `sources`, `date` ni `reliability` (se reutilizan del español).

`tag` habituales: Actualización, Lanzamiento, Evento, Tráiler, Jugabilidad, Mapa, Música, Negocio, Estudio, Polémica, Aviso, Impacto · en inglés: Update, Launch, Event, Trailer, Gameplay, Map, Music, Business, Studio, Controversy, Heads-up, Impact.
