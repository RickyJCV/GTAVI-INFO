// Textos de la interfaz y rutas de cada idioma. Añadir un idioma = añadir un bloque aquí
// + su guía (content/guide.<código>.json) + el bloque <código> en cada resumen diario.
export const LOCALES = {
  es: {
    code: "es",
    intl: "es-ES",
    ogLocale: "es_ES",
    label: "ES",
    name: "Español",
    paths: {
      home: "/",
      news: "/noticias/",
      rumors: "/rumores/",
      newsItem: (d, slug) => `/noticias/${d}-${slug}/`,
      rumorItem: (d, slug) => `/rumores/${d}-${slug}/`,
      guide: "/guia/",
      archive: "/archivo/",
      about: "/acerca/",
      privacy: "/privacidad/",
      legal: "/aviso-legal/",
      release: "/hora-de-salida/",
      leonida: "/leonida-mapa-personajes/",
      reviews: "/notas/",
      brief: (d) => `/resumen/${d}/`,
      feed: "/feed.xml",
    },
    t: {
      tagline: "El resumen matutino de GTA VI",
      description: "Las 5 noticias de GTA VI que importan hoy, con fuente enlazada y explicadas en palabras simples. Cada mañana, en español.",
      nav: { home: "Hoy", news: "Noticias", rumors: "Rumores", guide: "Guía", archive: "Archivo", about: "Acerca" },
      home: "inicio",
      mainNav: "Principal",
      skip: "Saltar al contenido",
      toTop: "Volver arriba",
      langSwitch: "Idioma",
      cdLabel: "Faltan para GTA VI",
      cdUnits: ["días", "horas", "min", "seg"],
      cdDone: "¡GTA VI ya está disponible! 🌴",
      miniPre: "GTA VI en",
      miniDone: "¡Ya disponible!",
      themeToLight: "Cambiar a modo claro",
      themeToDark: "Cambiar a modo oscuro",
      themeTitle: "Modo claro / oscuro",
      shareOn: (n) => `Compartir en ${n}`,
      shareWa: "Compartir por WhatsApp",
      ads: "Publicidad",
      morning: "Resumen matutino",
      seeFive: "Ver las 5 noticias ↓",
      shareText: (t) => `${t} — las 5 noticias de GTA VI de hoy`,
      share: "Compartir",
      top5: "Las 5 que importan hoy",
      readerQ: "¿Cómo lo quieres leer?",
      fans: "🎮 Sigo cada update",
      nuevos: "🌴 Soy nuevo",
      showingFans: "Mostrando el detalle para fans.",
      showingNew: "Mostrando la explicación sencilla.",
      rules: "Solo lo que aún no habíamos contado, priorizando lo más reciente · los rumores van aparte y siempre con fuente con nombre · enlace bajo cada noticia.",
      news: "Noticia",
      biggest: "La más grande",
      whatChanged: "Qué cambió:",
      inShort: "En corto:",
      source: (n) => (n > 1 ? "Fuentes:" : "Fuente:"),
      postsTitle: "Listo para publicar",
      postsIntro: (big) => `Tres publicaciones cortas sobre la historia más grande del día — <em>${big}</em>. Cópialas o compártelas con un toque.`,
      chars: "caracteres",
      copy: "Copiar",
      copied: "¡Copiado!",
      moreTitle: "Más noticias",
      moreIntro: "Otras historias del día que también conviene conocer.",
      rumorsTitle: "Rumores fiables",
      rumorsIntro: "Lo más comentado que aún no está confirmado. Solo con fuente con nombre y con su nivel de fiabilidad: tómalo con pinzas.",
      rumor: "Rumor",
      reliability: { alta: "Fiabilidad alta", media: "Fiabilidad media", baja: "Fiabilidad baja" },
      who: "Quién lo dice:",
      jumpTop: "Las 5 de hoy",
      jumpsLabel: "Secciones",
      homeTitle: "Noticias de GTA 6 hoy: lanzamiento, rumores y guía",
      homeDesc: "Noticias de GTA 6 (GTA VI) cada día en español: lo confirmado, los rumores con su fiabilidad, a qué hora sale, notas de la prensa y guía de Leonida.",
      launchBarPre: (d) => `GTA VI sale el 19 de noviembre${d}`,
      launchBarPreCta: "¿A qué hora en tu país? →",
      launchBarOut: "¡GTA VI ya está disponible!",
      launchBarOutCta: "Notas de la prensa →",
      tiles: { release: ["Hora de salida", "Cuándo se desbloquea en tu país"], reviews: ["Notas", "Las notas de la prensa y la media"], leonida: ["Mapa y personajes", "Leónida, zonas y protagonistas"] },
      releaseTitle: "¿A qué hora sale GTA 6? Hora de lanzamiento en España, México y Latinoamérica",
      releaseDesc: "A qué hora se desbloquea GTA 6 el 19 de noviembre en España, México, Argentina, Colombia, Chile, Perú y EE. UU., con cuenta atrás en tu hora y el horario de Xbox Cloud.",
      releaseEyebrow: "Lanzamiento · 19 de noviembre de 2026",
      releaseH1: "¿A qué hora sale GTA 6?",
      releaseLead: "En consola (PS5 y Xbox Series) GTA VI se desbloquea a las 00:00 de tu hora local el jueves 19 de noviembre de 2026. Cada país lo recibe al llegar su medianoche.",
      releaseYourTz: (tz) => `Tu zona horaria: ${tz}. Para ti, GTA VI se desbloquea a las 00:00 del 19 de noviembre.`,
      releaseTable: "Hora por país",
      releaseCountry: "País o zona",
      releaseConsole: "Consola (PS5 / Xbox)",
      releaseCloud: "Xbox Cloud Gaming*",
      releaseCloudNote: "* Según Microsoft, el juego en la nube de Xbox arranca a la 1:00 (hora del Este de EE. UU.) del día 19; la hora se ha convertido a cada zona. Puede variar por región o servicio.",
      releaseMidnight: "19 nov · 00:00 (hora local)",
      releaseBefore: "Antes de jugar",
      releaseChecklist: ["Precarga: unos 210 GB en la mayoría de regiones (deja espacio de sobra).", "Descarga el parche obligatorio 1.002.000 antes del día 19.", "Ediciones en caja: no traen disco, solo un código. Canjéalo en cuanto la tengas y guarda el ticket.", "En PS5, los códigos físicos funcionan solo en cuentas de su misma región."],
      releaseFaq: [
        ["¿A qué hora sale GTA 6 en España?", "A las 00:00 del jueves 19 de noviembre de 2026, hora peninsular. En Canarias, a las 00:00 hora canaria."],
        ["¿A qué hora sale GTA 6 en México?", "A las 00:00 del 19 de noviembre, hora local de cada zona del país."],
        ["¿A qué hora sale GTA 6 en Argentina, Colombia, Chile o Perú?", "En todos, a las 00:00 del 19 de noviembre en su hora local."],
        ["¿Se puede jugar GTA 6 en la nube?", "Sí, en Xbox Cloud Gaming. Según Microsoft, desde la 1:00 hora del Este de EE. UU. del día 19 (las 07:00 en España peninsular)."],
        ["¿Sale GTA 6 en PC el 19 de noviembre?", "No. Solo sale en PS5 y Xbox Series X|S. La versión de PC no está confirmada."]
      ],
      leonidaTitle: "Leonida (Leónida), el mapa de GTA 6: zonas y personajes",
      leonidaDesc: "Cómo es Leonida, el estado de GTA 6 inspirado en Florida: sus seis zonas confirmadas (Vice City, Leonida Keys, Grassrivers…) y los personajes de Jason y Lucia.",
      leonidaEyebrow: "Guía · Mapa y personajes",
      leonidaH1: "Leónida: el mapa y los personajes de GTA 6",
      leonidaLead: "GTA VI transcurre en Leonida (Leónida), un estado ficticio inspirado en Florida. Rockstar ha confirmado seis zonas y a sus dos protagonistas, Lucia y Jason. Esto es lo que se sabe de forma oficial.",
      leonidaRegions: "Las 6 zonas confirmadas",
      leonidaCharacters: "Personajes confirmados",
      leonidaRumor: "¿Hay más zonas? Un póster de la edición coleccionista apunta a nuevos lugares, pero no está confirmado.",
      leonidaRumorCta: "Ver rumores →",
      reviewsTitle: "Notas de GTA 6: análisis de la prensa y nota media",
      reviewsDesc: "Todas las notas de GTA 6 (GTA VI) de la prensa especializada, con la nota media y el enlace a cada análisis. Se actualiza en cuanto se publican.",
      reviewsEyebrow: "Análisis · Prensa especializada",
      reviewsH1: "Notas de GTA 6",
      reviewsLead: "Recopilamos las notas de los análisis publicados, con enlace a cada uno. La nota media la calculamos nosotros a partir de esta lista.",
      reviewsEmpty: "Todavía no hay notas oficiales. Según informaciones no confirmadas (NateTheHate, Insider Gaming), el embargo de los análisis se levantaría el 18 de noviembre. Cualquier nota que veas antes es falsa.",
      reviewsAvg: "Nota media",
      reviewsCount: (n) => `${n} análisis`,
      reviewsOutlet: "Medio",
      reviewsScore: "Nota",
      reviewsRead: "Leer análisis",
      reviewsNote: "Las notas pertenecen a cada medio. Solo recogemos la puntuación y enlazamos al análisis completo.",
      crumbHome: "Inicio",
      readMore: "Leer más →",
      via: "vía",
      hubNewsSub: (n) => (n ? `${n} hoy · confirmadas y con fuente` : "Confirmadas y con fuente"),
      hubRumorsSub: (n) => (n ? `${n} hoy · con medidor de fiabilidad` : "Con medidor de fiabilidad"),
      hubGuideSub: "Fecha, precio, PC, tamaño…",
      hubArchiveSub: "Todos los resúmenes, día a día",
      kickerNews: "Noticias confirmadas",
      kickerRumor: "Sin confirmar",
      allNews: "Ver todas las noticias →",
      allRumors: "Ver todos los rumores →",
      newsTitle: "Noticias de GTA 6 (GTA VI) hoy",
      newsDesc: "Todas las noticias confirmadas de GTA VI, día a día, explicadas en corto y con su fuente.",
      newsH1: "Noticias",
      newsIntro: "Lo confirmado, día a día. Cada noticia tiene su página con los detalles y las fuentes originales.",
      rumorsPageTitle: "Rumores y filtraciones de GTA 6, con medidor de fiabilidad",
      rumorsDesc: "Los rumores y filtraciones más comentados de GTA VI, con quién lo dice y un medidor de fiabilidad.",
      rumorsH1: "Rumores",
      legendTitle: "Cómo leer el medidor de fiabilidad",
      legend: {
        alta: "Lo dice alguien con buen historial y un medio lo ha verificado por su cuenta.",
        media: "Lo publica un medio fiable, pero con fuentes anónimas o indicios indirectos.",
        baja: "Viene de un filtrador sin historial o de archivos del juego. Puede no cumplirse.",
      },
      reliabilityShort: { alta: "Alta", media: "Media", baja: "Baja" },
      filterLabel: "Filtrar por fiabilidad",
      filterAll: "Todos",
      emptyList: "Todavía no hay nada aquí. Vuelve mañana.",
      crumbs: "Estás en",
      rumorBannerTitle: "Rumor sin confirmar",
      rumorBanner: "Ni Rockstar ni Take-Two lo han confirmado. Puede cambiar o no cumplirse.",
      plainTitle: "En palabras simples",
      details: "Los detalles",
      why: "Por qué importa",
      originals: "Fuentes originales",
      originalsNote: "Este es un resumen propio. Para la información completa, lee los artículos originales:",
      moreToday: "Más del mismo día",
      ctxTitle: "Contexto de la semana",
      ctxIntro: "Noticias de días anteriores que siguen marcando la conversación.",
      otherDays: "Otros días",
      tenSec: "GTA VI en 10 segundos",
      guideCta: "Guía completa y preguntas frecuentes",
      prev: "Resúmenes anteriores",
      fullArchive: "Ver archivo completo →",
      ctaTitle: "Cada mañana, a las 7:00",
      ctaText: "Guarda la web en tu pantalla de inicio o suscríbete por RSS para no perderte ningún resumen.",
      rss: "Suscribirme por RSS",
      archiveTitle: "Archivo de resúmenes de GTA VI",
      archiveDesc: "Todos los resúmenes matutinos de GTA VI, día a día, con sus fuentes.",
      archiveEyebrow: "Archivo",
      archiveH1: "Todos los resúmenes",
      archiveIntro: "Un resumen cada mañana. Cada noticia lleva su fuente enlazada.",
      guideUpdated: (d) => `Guía · actualizada el ${d}`,
      faq: "Preguntas frecuentes",
      latest: "Lo último",
      readToday: "Leer el resumen de hoy",
      footerNote: "Web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive. Grand Theft Auto y GTA son marcas de sus respectivos propietarios.",
      footerNav: "Pie",
      footerLinks: { guide: "Guía GTA VI", archive: "Archivo", about: "Acerca y normas", privacy: "Privacidad y cookies", legal: "Aviso legal" },
      langHint: "Also available in English",
      langHintCta: "Read in English →",
      langHintClose: "Cerrar",
      aboutTitle: "Acerca de Leónida Hoy y normas editoriales",
      aboutDesc: "Quiénes somos, cómo elegimos las noticias de GTA VI y cómo contactar.",
      aboutEyebrow: "Acerca",
      aboutBody: (issues) => `
    <h2>Qué hacemos</h2>
    <p>Cada mañana leemos la actualidad de GTA VI y nos quedamos con las cinco historias que de verdad importan. Una línea por noticia, qué cambió y un enlace a la fuente original. Sin relleno.</p>
    <h2>Nuestras normas</h2>
    <ul>
      <li><strong>Lo nuevo, primero.</strong> Cada resumen trae lo que aún no habíamos contado, priorizando lo más reciente; si algo se anunció antes, lo indicamos.</li>
      <li><strong>Los rumores, aparte y etiquetados.</strong> Solo los más comentados, con quién lo dice y su nivel de fiabilidad. Si nadie identificable lo publica, no sale aquí.</li>
      <li><strong>Enlace bajo cada historia.</strong> Siempre puedes leer el original.</li>
      <li><strong>Las estimaciones se marcan como estimaciones.</strong> Las cifras de terceros nunca se presentan como oficiales.</li>
    </ul>
    <h2>Dos niveles de lectura</h2>
    <p>Usa el selector «Sigo cada update / Soy nuevo»: los fans ven el detalle técnico y quien acaba de llegar ve la explicación en palabras simples.</p>
    <h2>En dos idiomas</h2>
    <p>Cada resumen se publica en español y en inglés. Cambia de idioma con el selector ES / EN de la cabecera.</p>
    <h2>Contacto y correcciones</h2>
    <p>¿Ves un error o tienes una pista con fuente? Abre una incidencia en el <a href="${issues}" rel="noopener" target="_blank">repositorio del proyecto</a>. Corregimos rápido y lo indicamos.</p>
    <h2>Aviso</h2>
    <p>Leónida Hoy es una web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive.</p>`,
      legalTitle: "Aviso legal",
      legalDesc: "Quién publica Leónida Hoy, cómo usamos las fuentes y cómo pedir una corrección o retirada.",
      legalBody: ({ owner, email, issues }) => `
    <h2>Quién publica esta web</h2>
    <p>Leónida Hoy es un proyecto personal e independiente${owner ? `, publicado por ${owner}` : ""}. Contacto: ${email ? `<a href="mailto:${email}">${email}</a> o ` : ""}el <a href="${issues}" rel="noopener" target="_blank">formulario público del proyecto</a>.</p>
    <h2>Sin relación con Rockstar Games</h2>
    <p>Esta web no está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive. «Grand Theft Auto», «GTA» y los nombres del juego son marcas de sus propietarios y se usan solo para identificar el juego del que se informa. No usamos sus logotipos, imágenes ni música.</p>
    <h2>Cómo usamos las fuentes</h2>
    <p>Cada noticia es un resumen breve escrito con nuestras propias palabras a partir de hechos publicados por otros medios. No reproducimos sus artículos, fotos ni vídeos. Siempre indicamos el medio y enlazamos al artículo original para que puedas leerlo completo.</p>
    <h2>Rumores</h2>
    <p>Los rumores se publican en una sección aparte, marcados como no confirmados, con quién los difunde y una valoración orientativa de su fiabilidad. No son hechos y pueden no cumplirse.</p>
    <h2>Exactitud y responsabilidad</h2>
    <p>Los resúmenes se preparan a diario con ayuda de inteligencia artificial y pueden contener errores. Comprueba la fuente original antes de tomar decisiones de compra. No nos hacemos responsables del contenido de las webs externas enlazadas.</p>
    <h2>Correcciones y retirada de contenido</h2>
    <p>Si eres titular de derechos o ves un error, escríbenos por el contacto de arriba indicando la página. Corregimos o retiramos el contenido lo antes posible.</p>
    <h2>Propiedad del contenido propio</h2>
    <p>El diseño, el logotipo y los textos propios de Leónida Hoy están protegidos. Puedes citar fragmentos breves enlazando a esta web.</p>
    <h2>Publicidad</h2>
    <p>La web puede mostrar publicidad de Google AdSense. Consulta la política de privacidad y cookies para más detalles.</p>`,
      privacyTitle: "Política de privacidad y cookies",
      privacyDesc: "Cómo usa Leónida Hoy las cookies y la publicidad de Google AdSense.",
      privacyEyebrow: "Legal",
      privacyH1: "Privacidad y cookies",
      privacyUpdated: (d) => `Última actualización: ${d}`,
      privacyBody: (ga) => `
    <h2>Datos que recogemos</h2>
    <p>No pedimos registro ni guardamos datos personales en nuestros servidores. La web es estática y está alojada en GitHub Pages, que puede registrar datos técnicos de acceso (como la dirección IP) por motivos de seguridad.</p>
    <h2>Preferencias locales</h2>
    <p>Guardamos en tu navegador (localStorage) tu nivel de lectura, el modo claro u oscuro y tu idioma. No sale de tu dispositivo.</p>
    <h2>Publicidad</h2>
    <p>Esta web puede mostrar anuncios de Google AdSense. Google y sus socios usan cookies para mostrar anuncios basados en tus visitas a esta y otras webs. Puedes desactivar la publicidad personalizada en <a href="https://adssettings.google.com" target="_blank" rel="noopener">Configuración de anuncios de Google</a> y consultar <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">cómo usa Google los datos de las webs que usan sus servicios</a>.</p>
    <p>Si visitas la web desde el Espacio Económico Europeo, Reino Unido o Suiza, te pediremos tu consentimiento antes de usar cookies publicitarias, mediante una plataforma de gestión de consentimiento certificada por Google.</p>
    ${ga ? `<h2>Analítica</h2><p>Usamos Google Analytics para contar visitas de forma agregada.</p>` : ""}
    <h2>Enlaces externos</h2>
    <p>Cada noticia enlaza a su fuente original. Esas webs tienen sus propias políticas de privacidad.</p>`,
    },
  },

  en: {
    code: "en",
    intl: "en-US",
    ogLocale: "en_US",
    label: "EN",
    name: "English",
    paths: {
      home: "/en/",
      news: "/en/news/",
      rumors: "/en/rumors/",
      newsItem: (d, slug) => `/en/news/${d}-${slug}/`,
      rumorItem: (d, slug) => `/en/rumors/${d}-${slug}/`,
      guide: "/en/guide/",
      archive: "/en/archive/",
      about: "/en/about/",
      privacy: "/en/privacy/",
      legal: "/en/legal/",
      release: "/en/release-time/",
      leonida: "/en/leonida-map-characters/",
      reviews: "/en/reviews/",
      brief: (d) => `/en/brief/${d}/`,
      feed: "/en/feed.xml",
    },
    t: {
      tagline: "The GTA VI morning briefing",
      description: "The 5 GTA VI stories that matter today, each with a linked source and explained in plain words. Every morning.",
      nav: { home: "Today", news: "News", rumors: "Rumors", guide: "Guide", archive: "Archive", about: "About" },
      home: "home",
      mainNav: "Main",
      skip: "Skip to content",
      toTop: "Back to top",
      langSwitch: "Language",
      cdLabel: "GTA VI arrives in",
      cdUnits: ["days", "hours", "min", "sec"],
      cdDone: "GTA VI is out now! 🌴",
      miniPre: "GTA VI in",
      miniDone: "Out now!",
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      themeTitle: "Light / dark mode",
      shareOn: (n) => `Share on ${n}`,
      shareWa: "Share on WhatsApp",
      ads: "Advertisement",
      morning: "Morning briefing",
      seeFive: "See the 5 stories ↓",
      shareText: (t) => `${t} — today's 5 GTA VI stories`,
      share: "Share",
      top5: "The 5 that matter today",
      readerQ: "How do you want to read it?",
      fans: "🎮 I follow every update",
      nuevos: "🌴 I'm new here",
      showingFans: "Showing the detail for fans.",
      showingNew: "Showing the simple explanation.",
      rules: "Only things we hadn't covered yet, most recent first · rumors go in their own section, always with a named source · a link under every story.",
      news: "News",
      biggest: "Biggest story",
      whatChanged: "What changed:",
      inShort: "In short:",
      source: (n) => (n > 1 ? "Sources:" : "Source:"),
      postsTitle: "Ready to post",
      postsIntro: (big) => `Three short posts about the day's biggest story — <em>${big}</em>. Copy or share them in one tap.`,
      chars: "characters",
      copy: "Copy",
      copied: "Copied!",
      moreTitle: "More news",
      moreIntro: "Other stories from today that are worth knowing.",
      rumorsTitle: "Reliable rumors",
      rumorsIntro: "The most talked-about things that aren't confirmed yet. Only with a named source and a reliability rating — take them with a pinch of salt.",
      rumor: "Rumor",
      reliability: { alta: "High reliability", media: "Medium reliability", baja: "Low reliability" },
      who: "Who says it:",
      jumpTop: "Today's 5",
      jumpsLabel: "Sections",
      homeTitle: "GTA 6 news today: launch, rumors and guide",
      homeDesc: "GTA 6 (GTA VI) news every day: what's confirmed, rumors with a reliability rating, release time, review scores and a Leonida guide.",
      launchBarPre: (d) => `GTA VI launches November 19${d}`,
      launchBarPreCta: "What time in your country? →",
      launchBarOut: "GTA VI is out now!",
      launchBarOutCta: "Review scores →",
      tiles: { release: ["Release time", "When it unlocks where you live"], reviews: ["Reviews", "Critic scores and the average"], leonida: ["Map & characters", "Leonida, regions and leads"] },
      releaseTitle: "What time does GTA 6 come out? Release time by country",
      releaseDesc: "When GTA 6 unlocks on November 19 in the US, UK, Spain, Mexico and Latin America, with a countdown in your own time zone and the Xbox Cloud schedule.",
      releaseEyebrow: "Launch · November 19, 2026",
      releaseH1: "What time does GTA 6 come out?",
      releaseLead: "On console (PS5 and Xbox Series) GTA VI unlocks at 12:00 a.m. local time on Thursday, November 19, 2026. Each country gets it when its own midnight arrives.",
      releaseYourTz: (tz) => `Your time zone: ${tz}. For you, GTA VI unlocks at 12:00 a.m. on November 19.`,
      releaseTable: "Time by country",
      releaseCountry: "Country or zone",
      releaseConsole: "Console (PS5 / Xbox)",
      releaseCloud: "Xbox Cloud Gaming*",
      releaseCloudNote: "* According to Microsoft, Xbox cloud play starts at 1:00 a.m. ET on the 19th; the time has been converted to each zone. It may vary by region or service.",
      releaseMidnight: "Nov 19 · 12:00 a.m. (local time)",
      releaseBefore: "Before you play",
      releaseChecklist: ["Preload: about 210 GB in most regions (leave plenty of space).", "Download mandatory patch 1.002.000 before the 19th.", "Boxed editions have no disc, just a code. Redeem it as soon as you get it and keep the receipt.", "On PS5, physical codes only work on accounts from the same region."],
      releaseFaq: [
        ["What time does GTA 6 come out in the US?", "At 12:00 a.m. local time on Thursday, November 19, 2026, in each time zone."],
        ["What time does GTA 6 come out in the UK?", "At 12:00 a.m. UK time on November 19."],
        ["Can I play GTA 6 in the cloud?", "Yes, on Xbox Cloud Gaming. According to Microsoft, from 1:00 a.m. ET on the 19th."],
        ["Is GTA 6 out on PC on November 19?", "No. It launches only on PS5 and Xbox Series X|S. A PC version hasn't been confirmed."]
      ],
      leonidaTitle: "Leonida, the GTA 6 map: regions and characters",
      leonidaDesc: "What Leonida, GTA 6's Florida-inspired state, looks like: its six confirmed regions (Vice City, Leonida Keys, Grassrivers…) and the characters around Jason and Lucia.",
      leonidaEyebrow: "Guide · Map and characters",
      leonidaH1: "Leonida: the GTA 6 map and characters",
      leonidaLead: "GTA VI is set in Leonida, a fictional state inspired by Florida. Rockstar has confirmed six regions and its two leads, Lucia and Jason. Here's what's officially known.",
      leonidaRegions: "The 6 confirmed regions",
      leonidaCharacters: "Confirmed characters",
      leonidaRumor: "More regions? A collector's edition poster hints at new places, but it isn't confirmed.",
      leonidaRumorCta: "See rumors →",
      reviewsTitle: "GTA 6 reviews: critic scores and average",
      reviewsDesc: "Every GTA 6 (GTA VI) critic review score, with the average and a link to each review. Updated as soon as they're published.",
      reviewsEyebrow: "Reviews · Critics",
      reviewsH1: "GTA 6 review scores",
      reviewsLead: "We collect the scores from published reviews, with a link to each one. We calculate the average from this list.",
      reviewsEmpty: "No official scores yet. According to unconfirmed reports (NateTheHate, Insider Gaming), the review embargo would lift on November 18. Any score you see before then is fake.",
      reviewsAvg: "Average score",
      reviewsCount: (n) => `${n} reviews`,
      reviewsOutlet: "Outlet",
      reviewsScore: "Score",
      reviewsRead: "Read review",
      reviewsNote: "Scores belong to each outlet. We only list the score and link to the full review.",
      crumbHome: "Home",
      readMore: "Read more →",
      via: "via",
      hubNewsSub: (n) => (n ? `${n} today · confirmed and sourced` : "Confirmed and sourced"),
      hubRumorsSub: (n) => (n ? `${n} today · with reliability meter` : "With a reliability meter"),
      hubGuideSub: "Date, price, PC, size…",
      hubArchiveSub: "Every briefing, day by day",
      kickerNews: "Confirmed news",
      kickerRumor: "Unconfirmed",
      allNews: "See all news →",
      allRumors: "See all rumors →",
      newsTitle: "GTA 6 (GTA VI) news today",
      newsDesc: "All the confirmed GTA VI news, day by day, explained briefly and with sources.",
      newsH1: "News",
      newsIntro: "What's confirmed, day by day. Every story has its own page with details and the original sources.",
      rumorsPageTitle: "GTA 6 rumors and leaks, with a reliability meter",
      rumorsDesc: "The most talked-about GTA VI rumors and leaks, with who says it and a reliability meter.",
      rumorsH1: "Rumors",
      legendTitle: "How to read the reliability meter",
      legend: {
        alta: "Said by someone with a good track record and independently verified by an outlet.",
        media: "Published by a reliable outlet, but based on anonymous sources or indirect clues.",
        baja: "Comes from a leaker with no track record or from game files. It may not happen.",
      },
      reliabilityShort: { alta: "High", media: "Medium", baja: "Low" },
      filterLabel: "Filter by reliability",
      filterAll: "All",
      emptyList: "Nothing here yet. Come back tomorrow.",
      crumbs: "You are in",
      rumorBannerTitle: "Unconfirmed rumor",
      rumorBanner: "Neither Rockstar nor Take-Two has confirmed this. It may change or never happen.",
      plainTitle: "In plain words",
      details: "The details",
      why: "Why it matters",
      originals: "Original sources",
      originalsNote: "This is our own summary. For the full story, read the original articles:",
      moreToday: "More from the same day",
      ctxTitle: "This week's context",
      ctxIntro: "Stories from earlier days that are still driving the conversation.",
      otherDays: "Other days",
      tenSec: "GTA VI in 10 seconds",
      guideCta: "Full guide and FAQ",
      prev: "Previous briefings",
      fullArchive: "See the full archive →",
      ctaTitle: "Every morning at 7:00 CET",
      ctaText: "Add the site to your home screen or subscribe via RSS so you never miss a briefing.",
      rss: "Subscribe via RSS",
      archiveTitle: "GTA VI briefing archive",
      archiveDesc: "Every GTA VI morning briefing, day by day, with sources.",
      archiveEyebrow: "Archive",
      archiveH1: "Every briefing",
      archiveIntro: "One briefing every morning. Every story links to its source.",
      guideUpdated: (d) => `Guide · updated ${d}`,
      faq: "Frequently asked questions",
      latest: "Latest",
      readToday: "Read today's briefing",
      footerNote: "Independent fan site. Not affiliated with, sponsored or endorsed by Rockstar Games or Take-Two Interactive. Grand Theft Auto and GTA are trademarks of their respective owners.",
      footerNav: "Footer",
      footerLinks: { guide: "GTA VI guide", archive: "Archive", about: "About & standards", privacy: "Privacy & cookies", legal: "Legal notice" },
      langHint: "También disponible en español",
      langHintCta: "Leer en español →",
      langHintClose: "Close",
      aboutTitle: "About Leónida Hoy and our standards",
      aboutDesc: "Who we are, how we pick the GTA VI news and how to get in touch.",
      aboutEyebrow: "About",
      aboutBody: (issues) => `
    <h2>What we do</h2>
    <p>Every morning we read the GTA VI news and keep the five stories that really matter. One line per story, what changed and a link to the original source. No filler.</p>
    <h2>Our standards</h2>
    <ul>
      <li><strong>What's new comes first.</strong> Each briefing brings what we hadn't covered yet, most recent first; if something was announced earlier, we say so.</li>
      <li><strong>Rumors kept separate and labeled.</strong> Only the most talked-about ones, with who says it and how reliable it is. If nobody identifiable publishes it, it doesn't appear here.</li>
      <li><strong>A link under every story.</strong> You can always read the original.</li>
      <li><strong>Estimates are labeled as estimates.</strong> Third-party figures are never presented as official.</li>
    </ul>
    <h2>Two reading levels</h2>
    <p>Use the "I follow every update / I'm new here" switch: fans get the technical detail and newcomers get the plain-words explanation.</p>
    <h2>In two languages</h2>
    <p>Every briefing is published in English and Spanish. Switch language with the EN / ES selector in the header.</p>
    <h2>Contact and corrections</h2>
    <p>Spotted a mistake or have a sourced tip? Open an issue in the <a href="${issues}" rel="noopener" target="_blank">project repository</a>. We fix things quickly and say so.</p>
    <h2>Disclaimer</h2>
    <p>Leónida Hoy is an independent fan site. It is not affiliated with, sponsored or endorsed by Rockstar Games or Take-Two Interactive.</p>`,
      legalTitle: "Legal notice",
      legalDesc: "Who publishes Leónida Hoy, how we use sources and how to request a correction or removal.",
      legalBody: ({ owner, email, issues }) => `
    <h2>Who publishes this site</h2>
    <p>Leónida Hoy is an independent personal project${owner ? `, published by ${owner}` : ""}. Contact: ${email ? `<a href="mailto:${email}">${email}</a> or ` : ""}the <a href="${issues}" rel="noopener" target="_blank">project's public form</a>.</p>
    <h2>Not connected to Rockstar Games</h2>
    <p>This site is not affiliated with, sponsored or endorsed by Rockstar Games or Take-Two Interactive. "Grand Theft Auto", "GTA" and the game's names are trademarks of their owners and are used only to identify the game being covered. We don't use their logos, images or music.</p>
    <h2>How we use sources</h2>
    <p>Every story is a short summary written in our own words from facts published by other outlets. We don't reproduce their articles, photos or videos. We always name the outlet and link to the original article so you can read it in full.</p>
    <h2>Rumors</h2>
    <p>Rumors are published in a separate section, marked as unconfirmed, with who is spreading them and an indicative reliability rating. They are not facts and may never happen.</p>
    <h2>Accuracy and liability</h2>
    <p>Summaries are prepared daily with the help of artificial intelligence and may contain mistakes. Check the original source before making purchase decisions. We are not responsible for the content of external sites we link to.</p>
    <h2>Corrections and content removal</h2>
    <p>If you are a rights holder or spot a mistake, contact us through the details above and tell us the page. We will correct or remove the content as soon as possible.</p>
    <h2>Ownership of our own content</h2>
    <p>The design, logo and original texts of Leónida Hoy are protected. You may quote short excerpts with a link to this site.</p>
    <h2>Advertising</h2>
    <p>The site may show Google AdSense advertising. See the privacy and cookie policy for details.</p>`,
      privacyTitle: "Privacy and cookie policy",
      privacyDesc: "How Leónida Hoy uses cookies and Google AdSense advertising.",
      privacyEyebrow: "Legal",
      privacyH1: "Privacy and cookies",
      privacyUpdated: (d) => `Last updated: ${d}`,
      privacyBody: (ga) => `
    <h2>Data we collect</h2>
    <p>We don't ask you to sign up and we don't store personal data on our servers. The site is static and hosted on GitHub Pages, which may log technical access data (such as your IP address) for security purposes.</p>
    <h2>Local preferences</h2>
    <p>We store your reading level, light or dark mode and language in your browser (localStorage). It never leaves your device.</p>
    <h2>Advertising</h2>
    <p>This site may show Google AdSense ads. Google and its partners use cookies to show ads based on your visits to this and other websites. You can turn off personalized advertising in <a href="https://adssettings.google.com" target="_blank" rel="noopener">Google Ad Settings</a> and read <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener">how Google uses data from sites that use its services</a>.</p>
    <p>If you visit from the European Economic Area, the UK or Switzerland, we will ask for your consent before using advertising cookies, through a Google-certified consent management platform.</p>
    ${ga ? `<h2>Analytics</h2><p>We use Google Analytics to count visits in aggregate.</p>` : ""}
    <h2>External links</h2>
    <p>Every story links to its original source. Those sites have their own privacy policies.</p>`,
    },
  },
};
