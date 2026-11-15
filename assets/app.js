/* Leonida Hoy — interacción (sin dependencias) */
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

  // AdSense: activa cada bloque manual presente en la página
  var ads = document.querySelectorAll("ins.adsbygoogle");
  if (ads.length) {
    window.adsbygoogle = window.adsbygoogle || [];
    ads.forEach(function () { try { window.adsbygoogle.push({}); } catch (e) {} });
  }
})();
