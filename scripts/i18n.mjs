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
      guide: "/guia/",
      archive: "/archivo/",
      about: "/acerca/",
      privacy: "/privacidad/",
      brief: (d) => `/resumen/${d}/`,
      feed: "/feed.xml",
    },
    t: {
      tagline: "El resumen matutino de GTA VI",
      description: "Las 5 noticias de GTA VI que importan hoy, con fuente enlazada y explicadas en palabras simples. Cada mañana, en español.",
      nav: { home: "Hoy", guide: "Guía", archive: "Archivo", about: "Acerca" },
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
      rules: "Solo historias de las últimas 24 horas · los rumores van aparte y siempre con fuente con nombre · enlace bajo cada noticia.",
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
      footerLinks: { guide: "Guía GTA VI", archive: "Archivo", about: "Acerca y normas", privacy: "Privacidad y cookies" },
      langHint: "Also available in English",
      langHintCta: "Read in English →",
      langHintClose: "Cerrar",
      aboutTitle: "Acerca de Leonida Hoy y normas editoriales",
      aboutDesc: "Quiénes somos, cómo elegimos las noticias de GTA VI y cómo contactar.",
      aboutEyebrow: "Acerca",
      aboutBody: (issues) => `
    <h2>Qué hacemos</h2>
    <p>Cada mañana leemos la actualidad de GTA VI y nos quedamos con las cinco historias que de verdad importan. Una línea por noticia, qué cambió y un enlace a la fuente original. Sin relleno.</p>
    <h2>Nuestras normas</h2>
    <ul>
      <li><strong>Últimas 24 horas.</strong> El resumen del día solo incluye historias recientes. Lo anterior va en «Contexto de la semana», con su fecha.</li>
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
    <p>Leonida Hoy es una web de fans independiente. No está afiliada, patrocinada ni aprobada por Rockstar Games ni Take-Two Interactive.</p>`,
      privacyTitle: "Política de privacidad y cookies",
      privacyDesc: "Cómo usa Leonida Hoy las cookies y la publicidad de Google AdSense.",
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
      guide: "/en/guide/",
      archive: "/en/archive/",
      about: "/en/about/",
      privacy: "/en/privacy/",
      brief: (d) => `/en/brief/${d}/`,
      feed: "/en/feed.xml",
    },
    t: {
      tagline: "The GTA VI morning briefing",
      description: "The 5 GTA VI stories that matter today, each with a linked source and explained in plain words. Every morning.",
      nav: { home: "Today", guide: "Guide", archive: "Archive", about: "About" },
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
      rules: "Only stories from the last 24 hours · rumors go in their own section, always with a named source · a link under every story.",
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
      footerLinks: { guide: "GTA VI guide", archive: "Archive", about: "About & standards", privacy: "Privacy & cookies" },
      langHint: "También disponible en español",
      langHintCta: "Leer en español →",
      langHintClose: "Close",
      aboutTitle: "About Leonida Hoy and our standards",
      aboutDesc: "Who we are, how we pick the GTA VI news and how to get in touch.",
      aboutEyebrow: "About",
      aboutBody: (issues) => `
    <h2>What we do</h2>
    <p>Every morning we read the GTA VI news and keep the five stories that really matter. One line per story, what changed and a link to the original source. No filler.</p>
    <h2>Our standards</h2>
    <ul>
      <li><strong>Last 24 hours.</strong> The daily briefing only includes recent stories. Older ones go in "This week's context", with their date.</li>
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
    <p>Leonida Hoy is an independent fan site. It is not affiliated with, sponsored or endorsed by Rockstar Games or Take-Two Interactive.</p>`,
      privacyTitle: "Privacy and cookie policy",
      privacyDesc: "How Leonida Hoy uses cookies and Google AdSense advertising.",
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
