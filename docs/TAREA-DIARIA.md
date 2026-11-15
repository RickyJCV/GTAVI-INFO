# Tarea diaria: resumen de GTA VI

Instrucciones para el agente que publica cada mañana el resumen de **Leonida Hoy** (https://leonidahoy.github.io/, español en `/` e inglés en `/en/`).
El dueño del repositorio autoriza **commit y push directo a `main`** (así se publica la web). Nada de pull requests ni otras ramas.

**Ahorra cuota:** sin subagentes, sin leer archivos que aquí no se indican, máximo 6 búsquedas web, sin abrir páginas web salvo que una búsqueda no aclare un dato, respuestas cortas.

## Pasos

1. **Repo.** Llama a `add_repo` (owner `leonidahoy`, repo `leonidahoy.github.io`, access `push`). Si no hay copia local: `git clone --depth 20 https://github.com/leonidahoy/leonidahoy.github.io && cd leonidahoy.github.io`. Trabaja en `main`.
2. **¿Ya está hecho?** `HOY=$(TZ=Europe/Madrid date +%F)`. Si existe `content/briefs/$HOY.json`, termina diciendo «El resumen de hoy ya estaba publicado».
3. **Qué se publicó ya.** Lee solo el JSON más reciente de `content/briefs/` (es la referencia del formato y del tono) y lista títulos anteriores: `grep -h '"title"' content/briefs/*.json | tail -60`.
4. **Busca** (todas las búsquedas en el mismo turno, modo `standard`; `extended` solo si salen pobres). Sugeridas:
   - `GTA 6 news today` · `GTA VI Rockstar announcement` · `GTA 6 leak rumor insider` · `GTA 6 noticias hoy`
   - y, si hace falta, una sobre el tema más fuerte del día para confirmar datos.
5. **Escribe** `content/briefs/$HOY.json` siguiendo el esquema de abajo.
6. **Verifica:** `node scripts/check-brief.mjs content/briefs/$HOY.json`. Si da errores, corrige exactamente lo que dice y repite hasta que diga «✓ … listo». Los avisos «⚠» no bloquean, pero léelos.
7. **Construye:** `node scripts/build.mjs`. Debe decir `idiomas: es, en` y no `sin inglés`.
8. **Guía (rara vez):** solo si cambió un dato confirmado (fecha, precio, plataformas, PC, tamaño, FPS), actualiza `content/guide.json` y `content/guide.en.json` (y su `updated`), con fuente.
9. **Publica:** `git add content && git commit -m "Resumen GTA VI $HOY" && git push origin main`. Si da 403, vuelve a llamar a `add_repo` y reintenta; si persiste, dilo claramente. Si es error de red, reintenta hasta 4 veces esperando 2, 4, 8 y 16 s.
10. **Comprueba la publicación:** espera con un bucle `until` (máximo 4 min) a que `git fetch -q --depth 1 origin gh-pages && git log -1 --format=%s origin/gh-pages` muestre `Publicar <sha corto de tu commit>`. Si no aparece, dilo.
11. **Responde** en español, breve: titular; cada noticia y cada rumor (con su fiabilidad) en una línea; los 3 posts en español y en inglés.

## Reglas de contenido (obligatorias)

- **Solo hechos de las últimas 24 horas** en `stories` y `more`. Lo anterior que siga siendo relevante va en `context` (con su fecha).
- **Nunca inventes** datos, cifras, citas ni URLs. Cada `url` debe ser una dirección que hayas visto en los resultados de búsqueda y que apunte al **artículo concreto** (no a buscadores, acortadores ni portadas).
- **Redacción propia.** Resume con tus palabras. Nunca copies frases del medio (como mucho, una cita muy breve entre comillas y atribuida). Esto es lo que hace legal la web.
- **No repitas** noticias ni rumores ya publicados. Si hay novedad real sobre un tema anterior, escribe un título nuevo que cuente esa novedad.
- **Estimaciones** de terceros (ventas, reservas, presupuestos) siempre marcadas como estimaciones.
- **Rumores:** solo los más comentados, siempre con fuente con nombre (insider conocido o medio identificable) y nunca mezclados con las noticias. Fiabilidad:
  - `alta`: insider con buen historial **y** verificado por un medio por su cuenta.
  - `media`: medio fiable con fuentes anónimas, o indicios indirectos (documentos, finanzas).
  - `baja`: filtrador sin historial, dataminers o una sola cuenta sin eco en medios.
- **Si hay pocas noticias reales**, pon menos (mínimo 1). Mejor 3 noticias buenas que 5 forzadas. `more` y `rumors` pueden ir vacíos (`[]`).
- **Español de España**, claro y directo. Inglés natural (no traducción literal).

## Esquema

Límites que comprueba el verificador: `title` ≤110 caracteres, `summary` ≤200, `change` ≤330, `plain` ≤220, `detail` ≤60 palabras, `why` ≤200, cada post ≤220. `stories` 1–5, `more` 0–4, `rumors` 0–4, `posts` exactamente 3, `context` 0–3.

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
