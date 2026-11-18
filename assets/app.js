/* Leónida Hoy — interacción (sin dependencias) */
(function () {
  "use strict";
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Cuenta atrás (hora local del visitante: GTA VI se desbloquea a las 00:00 locales)
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var boxes = document.querySelectorAll("[data-countdown]");
  var minis = document.querySelectorAll("[data-countdown-mini]");
  function tick() {
    var now = Date.now();
    boxes.forEach(function (el) {
      var diff = new Date(el.getAttribute("data-countdown")).getTime() - now;
      if (diff <= 0) {
        el.querySelector(".countdown__grid").hidden = true;
        el.querySelector(".countdown__label").hidden = true;
        el.querySelector(".countdown__done").hidden = false;
        return;
      }
      var s = Math.floor(diff / 1000);
      var v = { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
      Object.keys(v).forEach(function (k) {
        var b = el.querySelector('[data-unit="' + k + '"]');
        var txt = String(k === "d" ? v[k] : pad(v[k]));
        if (b && b.textContent !== txt) {
          var first = b.textContent === "–";
          b.textContent = txt;
          if (!first && !reduced) { b.classList.remove("tick"); void b.offsetWidth; b.classList.add("tick"); }
        }
      });
    });
    minis.forEach(function (el) {
      var diff = new Date(el.getAttribute("data-countdown-mini")).getTime() - now;
      var t = el.querySelector("[data-mini]");
      var pre = el.querySelector("[data-mini-pre]");
      if (diff <= 0) { if (pre) pre.textContent = "GTA VI ·"; t.textContent = el.getAttribute("data-done") || "✓"; return; }
      var s = Math.floor(diff / 1000);
      t.textContent = Math.floor(s / 86400) + "d " + pad(Math.floor((s % 86400) / 3600)) + "h " + pad(Math.floor((s % 3600) / 60)) + "m";
    });
  }
  if (boxes.length || minis.length) { tick(); setInterval(tick, 1000); }

  // Modo claro / oscuro (por defecto sigue al sistema; la elección se recuerda)
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: light)") : null;
  var themeBtns = document.querySelectorAll("[data-theme-toggle]");
  var themeMeta = document.querySelector("[data-theme-color]");
  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    return t === "light" || t === "dark" ? t : (mq && mq.matches ? "light" : "dark");
  }
  function syncTheme() {
    var now = effectiveTheme();
    root.setAttribute("data-theme-now", now);
    if (themeMeta) themeMeta.setAttribute("content", now === "light" ? "#fff6fb" : "#0b0618");
    themeBtns.forEach(function (b) { var l = b.getAttribute(now === "dark" ? "data-to-light" : "data-to-dark"); if (l) b.setAttribute("aria-label", l); });
  }
  themeBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      var apply = function () { root.setAttribute("data-theme", next); store.set("lh-theme", next); syncTheme(); };
      if (document.startViewTransition && !reduced) {
        var r = b.getBoundingClientRect();
        root.style.setProperty("--tx", r.left + r.width / 2 + "px");
        root.style.setProperty("--ty", r.top + r.height / 2 + "px");
        root.classList.add("theme-vt");
        var done = function () { root.classList.remove("theme-vt"); };
        try { document.startViewTransition(apply).finished.then(done, done); } catch (e) { done(); apply(); }
      } else apply();
    });
  });
  if (mq) {
    var onSys = function () { if (!root.getAttribute("data-theme")) syncTheme(); };
    if (mq.addEventListener) mq.addEventListener("change", onSys); else if (mq.addListener) mq.addListener(onSys);
  }
  syncTheme();

  // Selector de audiencia
  var btns = document.querySelectorAll("[data-aud-btn]");
  function setAud(a) {
    document.documentElement.setAttribute("data-reader", a);
    btns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-aud-btn") === a)); });
  }
  setAud(store.get("lh-aud") === "nuevos" ? "nuevos" : "fans");
  btns.forEach(function (b) {
    b.addEventListener("click", function () {
      var a = b.getAttribute("data-aud-btn");
      setAud(a); store.set("lh-aud", a);
    });
  });

  // Copiar publicaciones
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var src = document.querySelector(btn.getAttribute("data-copy"));
      if (!src) return;
      var text = src.textContent.trim();
      var label = btn.querySelector("span");
      var original = label ? label.textContent : "";
      var done = function () {
        btn.classList.add("is-done"); if (label) label.textContent = btn.getAttribute("data-copied") || "✓";
        setTimeout(function () { btn.classList.remove("is-done"); if (label) label.textContent = original; }, 1800);
      };
      var settled = false;
      var finish = function (okFn) { if (!settled) { settled = true; okFn(); } };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { finish(done); }, function () { finish(fallback); });
        setTimeout(function () { finish(fallback); }, 1500); // por si el navegador no responde
      } else finish(fallback);
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  // Compartir nativo (móvil)
  document.querySelectorAll("[data-native-share]").forEach(function (btn) {
    if (!navigator.share) { btn.hidden = true; return; }
    btn.addEventListener("click", function () {
      navigator.share({ title: btn.getAttribute("data-title"), url: btn.getAttribute("data-url") }).catch(function () {});
    });
  });

  // Idioma: recordar la elección y sugerir el otro idioma si el navegador lo prefiere
  document.querySelectorAll("a[data-lang]").forEach(function (a) {
    a.addEventListener("click", function () { store.set("lh-lang", a.getAttribute("data-lang")); });
  });
  var hint = document.querySelector("[data-lang-hint]");
  if (hint) {
    var target = hint.getAttribute("data-lang-hint");
    var pageLang = document.documentElement.lang;
    var pref = store.get("lh-lang");
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    var wants = pref ? pref === target : nav.slice(0, 2).toLowerCase() === target;
    if (wants && pref !== pageLang && store.get("lh-hint-off") !== "1") hint.hidden = false;
    var close = hint.querySelector("[data-lang-hint-close]");
    if (close) close.addEventListener("click", function () { hint.hidden = true; store.set("lh-hint-off", "1"); });
  }

  // Rumores: filtrar por fiabilidad
  var relBtns = document.querySelectorAll("[data-rel-filter]");
  relBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      var want = b.getAttribute("data-rel-filter");
      relBtns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      document.querySelectorAll("[data-day]").forEach(function (day) {
        var shown = 0;
        day.querySelectorAll("[data-rel]").forEach(function (card) {
          var ok = want === "all" || card.getAttribute("data-rel") === want;
          card.hidden = !ok; if (ok) shown++;
        });
        day.hidden = shown === 0;
      });
    });
  });

  // Aparición suave al hacer scroll
  if ("IntersectionObserver" in window && !reduced) {
    var targets = document.querySelectorAll(".story, .mini-story, .post, .col-side .card, .hub__tile, .block__head, .ctx, .faq details, .archive li, .fact-grid li, .legend, .plainbox, .rumor-banner, .day__title");
    var vh = window.innerHeight;
    var io = new IntersectionObserver(function (entries) {
      var n = 0;
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io.unobserve(el);
        el.style.setProperty("--d", Math.min(n++, 6) * 70 + "ms");
        el.classList.add("in");
        setTimeout(function () { el.classList.remove("rv", "in"); el.style.removeProperty("--d"); }, 1300);
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top < vh * 0.9) return; // lo que ya se ve no se oculta
      el.classList.add("rv"); io.observe(el);
    });
  }

  // Brillo que sigue al cursor en las tarjetas
  if (window.matchMedia && window.matchMedia("(hover: hover)").matches) {
    var raf = 0, last = null;
    document.addEventListener("pointermove", function (ev) {
      last = ev;
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var card = last.target && last.target.closest ? last.target.closest(".item") : null;
        if (!card) return;
        var r = card.getBoundingClientRect();
        card.style.setProperty("--mx", last.clientX - r.left + "px");
        card.style.setProperty("--my", last.clientY - r.top + "px");
      });
    }, { passive: true });
  }

  // Botón «volver arriba» + progreso de lectura (una sola lectura de scroll por fotograma)
  var top = document.querySelector("[data-to-top]");
  var bar = document.querySelector("[data-progress]");
  var barWrap = bar ? bar.parentNode : null;
  var ring = document.querySelector("[data-progress-ring]");
  var maxScroll = 1, ticking = false;
  function measure() { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
  function paint() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset || 0;
    var p = Math.min(1, Math.max(0, y / maxScroll));
    var long = maxScroll > window.innerHeight * 0.6; // solo en páginas con recorrido
    if (bar) { bar.style.transform = "scaleX(" + p.toFixed(4) + ")"; barWrap.classList.toggle("on", long && y > 8); }
    if (ring) ring.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    if (top) top.classList.toggle("is-visible", y > 600);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  measure(); paint();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
  window.addEventListener("load", function () { measure(); onScroll(); });
  if ("ResizeObserver" in window) new ResizeObserver(function () { measure(); onScroll(); }).observe(document.body);
  document.querySelectorAll("details").forEach(function (d) { d.addEventListener("toggle", function () { measure(); onScroll(); }); });
  if (top) top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" }); });

  // Barra de lanzamiento: antes del día, «¿a qué hora?»; desde el día, «ya disponible»; se oculta 10 días después
  document.querySelectorAll("[data-launch-bar]").forEach(function (bar) {
    var t = new Date(bar.getAttribute("data-launch")).getTime();
    if (isNaN(t)) return;
    var now = Date.now();
    var out = now >= t;
    if (now > t + 10 * 864e5) { bar.hidden = true; return; }
    bar.querySelector('[data-lb="pre"]').hidden = out;
    bar.querySelector('[data-lb="out"]').hidden = !out;
  });

  // Página «¿A qué hora sale?»: mostrar la zona horaria del visitante
  document.querySelectorAll("[data-your-tz]").forEach(function (el) {
    try {
      var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) el.textContent = el.getAttribute("data-your-tz").replace("{tz}", tz.replace(/_/g, " "));
    } catch (e) {}
  });

  // Anuncio anclado inferior de AdSense: subir el botón «volver arriba» para que no lo tape
  (function () {
    var rootEl = document.documentElement, pending = false;
    function fit() {
      pending = false;
      var h = 0;
      document.querySelectorAll('ins.adsbygoogle[data-anchor-status="displayed"], ins.adsbygoogle[data-anchor-shown="true"]').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.height > 0 && r.bottom >= window.innerHeight - 2) h = Math.max(h, r.height);
      });
      rootEl.style.setProperty("--anchor-h", h ? Math.round(h) + "px" : "0px");
    }
    function schedule() { if (!pending) { pending = true; requestAnimationFrame(fit); } }
    if ("MutationObserver" in window) new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-anchor-status", "data-anchor-shown", "style"] });
    window.addEventListener("resize", schedule, { passive: true });
  })();

  // ================= Modo app (pantalla de inicio en iPhone y Android) =================
  var body = document.body;
  var T = {};
  try { T = JSON.parse(body.getAttribute("data-app") || "{}"); } catch (e) {}
  var BASE = body.getAttribute("data-base") || "";
  var standalone = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  if (standalone) root.classList.add("standalone");

  // Al abrir la app en «/», respetar el idioma elegido
  var langGo = false;
  try { langGo = !sessionStorage.getItem("lh-langgo"); sessionStorage.setItem("lh-langgo", "1"); } catch (e) {}
  if (standalone && langGo && location.pathname === BASE + "/" && store.get("lh-lang") === "en") location.replace(BASE + "/en/");

  // Aviso flotante reutilizable
  var toastEl = null;
  function toast(text, actionLabel, action, sticky) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "app-toast";
      toastEl.setAttribute("role", "status");
      body.appendChild(toastEl);
    }
    toastEl.innerHTML = "";
    var span = document.createElement("span"); span.textContent = text; toastEl.appendChild(span);
    if (actionLabel) {
      var b = document.createElement("button"); b.type = "button"; b.textContent = actionLabel;
      b.addEventListener("click", action); toastEl.appendChild(b);
    }
    var x = document.createElement("button"); x.type = "button"; x.className = "app-toast__x"; x.setAttribute("aria-label", T.close || "×"); x.textContent = "×";
    x.addEventListener("click", function () { toastEl.classList.remove("is-on"); }); toastEl.appendChild(x);
    requestAnimationFrame(function () { toastEl.classList.add("is-on"); });
    clearTimeout(toastEl._t);
    if (!sticky) toastEl._t = setTimeout(function () { toastEl.classList.remove("is-on"); }, 6000);
  }
  function hardRefresh() { location.reload(); }

  // Service worker: lectura sin conexión y cargas instantáneas
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register(BASE + "/sw.js").catch(function () {});
    });
  }

  // ¿Hay una versión más nueva publicada? (al volver a la app, y cada 10 min si está abierta)
  var myBuild = (document.querySelector('meta[name="build-id"]') || {}).content;
  var checking = false, lastCheck = Date.now(), hiddenAt = 0;
  function checkFresh() {
    if (checking || !myBuild || !navigator.onLine) return;
    checking = true; lastCheck = Date.now();
    fetch(BASE + "/version.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) { if (v && v.build && v.build !== myBuild) toast(T.fresh || "", T.update || "↻", hardRefresh, true); })
      .catch(function () {})
      .then(function () { checking = false; });
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { hiddenAt = Date.now(); return; }
    if (hiddenAt && Date.now() - hiddenAt > 60 * 1000) checkFresh();
  });
  setInterval(function () { if (!document.hidden && Date.now() - lastCheck > 10 * 60 * 1000) checkFresh(); }, 60 * 1000);
  window.addEventListener("offline", function () { toast(T.offline || "", null, null, false); });
  window.addEventListener("online", function () { checkFresh(); });

  // Deslizar hacia abajo para actualizar (solo en modo app: el navegador ya trae el suyo)
  if (standalone && "ontouchstart" in window) {
    var ptr = document.createElement("div");
    ptr.className = "ptr"; ptr.setAttribute("aria-hidden", "true");
    ptr.innerHTML = '<span class="ptr__icon"><svg viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M20 12a8 8 0 1 1-2.34-5.66M20 4v5h-5"/></svg></span><span class="ptr__label"></span>';
    body.appendChild(ptr);
    var label = ptr.querySelector(".ptr__label");
    var startY = 0, startX = 0, pulling = false, dist = 0, busy = false;
    var LIMIT = 72;
    var setPull = function (d) {
      dist = d;
      var p = Math.min(1, d / LIMIT);
      ptr.style.transform = "translate(-50%," + Math.round(Math.min(d, 110) - 70) + "px)";
      ptr.style.opacity = String(Math.min(1, d / 30));
      ptr.querySelector(".ptr__icon").style.transform = "rotate(" + Math.round(p * 270) + "deg)";
      ptr.classList.toggle("is-ready", d >= LIMIT);
      label.textContent = d >= LIMIT ? (T.ptrRelease || "") : (T.ptrPull || "");
    };
    window.addEventListener("touchstart", function (e) {
      if (busy || e.touches.length !== 1 || (window.scrollY || document.documentElement.scrollTop) > 0) { pulling = false; return; }
      startY = e.touches[0].clientY; startX = e.touches[0].clientX; pulling = true; dist = 0;
    }, { passive: true });
    window.addEventListener("touchmove", function (e) {
      if (!pulling) return;
      var dy = e.touches[0].clientY - startY, dx = Math.abs(e.touches[0].clientX - startX);
      if (dy <= 0 || dx > dy) { if (dist) setPull(0); return; }
      if ((window.scrollY || document.documentElement.scrollTop) > 0) { pulling = false; setPull(0); return; }
      setPull(dy * 0.55);
    }, { passive: true });
    window.addEventListener("touchend", function () {
      if (!pulling) return;
      pulling = false;
      if (dist >= LIMIT) {
        busy = true;
        ptr.classList.add("is-busy");
        label.textContent = T.ptrLoading || "";
        ptr.style.transform = "translate(-50%,12px)";
        setTimeout(hardRefresh, 350);
      } else {
        ptr.style.transition = "transform .25s, opacity .25s"; setPull(0);
        setTimeout(function () { ptr.style.transition = ""; }, 260);
      }
    }, { passive: true });
  }

  // Invitar a instalar: botón en Android/Chrome; instrucciones en iPhone (Safari no tiene botón)
  var installBtns = document.querySelectorAll("[data-install]");
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e;
    installBtns.forEach(function (b) { b.hidden = false; });
  });
  installBtns.forEach(function (b) {
    b.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () { deferred = null; installBtns.forEach(function (x) { x.hidden = true; }); });
    });
  });
  window.addEventListener("appinstalled", function () { installBtns.forEach(function (x) { x.hidden = true; }); });
  var ua = navigator.userAgent || "";
  var isIOS = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isIOS && !standalone) document.querySelectorAll("[data-ios-tip]").forEach(function (el) { el.hidden = false; });

  // AdSense: activa cada bloque manual presente en la página
  var ads = document.querySelectorAll("ins.adsbygoogle");
  if (ads.length) {
    window.adsbygoogle = window.adsbygoogle || [];
    ads.forEach(function () { try { window.adsbygoogle.push({}); } catch (e) {} });
  }
})();
