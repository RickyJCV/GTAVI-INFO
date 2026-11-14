/* Leonida Hoy — interacción (sin dependencias) */
(function () {
  "use strict";
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

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
        if (b) b.textContent = k === "d" ? v[k] : pad(v[k]);
      });
    });
    minis.forEach(function (el) {
      var diff = new Date(el.getAttribute("data-countdown-mini")).getTime() - now;
      var t = el.querySelector("[data-mini]");
      if (diff <= 0) { t.textContent = "GTA VI · ¡Ya disponible!"; return; }
      var s = Math.floor(diff / 1000);
      t.textContent = "GTA VI en " + Math.floor(s / 86400) + "d " + pad(Math.floor((s % 86400) / 3600)) + "h " + pad(Math.floor((s % 3600) / 60)) + "m";
    });
  }
  if (boxes.length || minis.length) { tick(); setInterval(tick, 1000); }

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
      var done = function () {
        btn.classList.add("is-done"); if (label) label.textContent = "¡Copiado!";
        setTimeout(function () { btn.classList.remove("is-done"); if (label) label.textContent = "Copiar"; }, 1800);
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

  // Botón «volver arriba»
  var top = document.querySelector("[data-to-top]");
  if (top) {
    var onScroll = function () { top.classList.toggle("is-visible", window.scrollY > 700); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  // AdSense: activa cada bloque manual presente en la página
  var ads = document.querySelectorAll("ins.adsbygoogle");
  if (ads.length) {
    window.adsbygoogle = window.adsbygoogle || [];
    ads.forEach(function () { try { window.adsbygoogle.push({}); } catch (e) {} });
  }
})();
