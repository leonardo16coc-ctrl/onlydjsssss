/**
 * ONLYDJS Embed Widget v1.0
 * ─────────────────────────────────────────────────────────────────────────────
 * Embed ONLYDJS tracks on any website with a single <script> tag.
 *
 * Usage:
 *   <div id="onlydjs-widget"></div>
 *   <script
 *     src="https://www.onlydjss.com/onlydjs-widget.js"
 *     data-genre="Tech House"
 *     data-sort="popular"
 *     data-limit="6"
 *     data-theme="dark"
 *     data-dj="djusername"
 *     data-target="onlydjs-widget"
 *   ></script>
 *
 * Attributes:
 *   data-genre   – Filter by genre (optional)
 *   data-sort    – newest | popular | trending  (default: popular)
 *   data-limit   – Number of tracks, max 50     (default: 6)
 *   data-theme   – dark | light                 (default: dark)
 *   data-dj      – Show only tracks from a specific DJ username (optional)
 *   data-target  – ID of the container element  (default: onlydjs-widget)
 */
(function () {
  "use strict";

  var BASE_URL = "https://www.onlydjss.com";
  var API_URL  = BASE_URL + "/api/v1";

  // ── Read config from script tag attributes ──────────────────────────────
  var scripts = document.querySelectorAll("script[src*='onlydjs-widget']");
  var scriptTag = scripts[scripts.length - 1];

  function attr(name, fallback) {
    return (scriptTag && scriptTag.getAttribute("data-" + name)) || fallback;
  }

  var config = {
    genre:   attr("genre",  ""),
    sort:    attr("sort",   "popular"),
    limit:   Math.min(parseInt(attr("limit", "6")) || 6, 50),
    theme:   attr("theme",  "dark"),
    dj:      attr("dj",     ""),
    target:  attr("target", "onlydjs-widget"),
  };

  // ── Theme tokens ─────────────────────────────────────────────────────────
  var T = {
    dark: {
      bg:      "#0f0f0f",
      card:    "#1a1a1a",
      text:    "#f0f0f0",
      sub:     "#888888",
      border:  "#2a2a2a",
      accent:  "#a855f7",
      hover:   "#222222",
    },
    light: {
      bg:      "#ffffff",
      card:    "#f5f5f5",
      text:    "#111111",
      sub:     "#666666",
      border:  "#e0e0e0",
      accent:  "#7c3aed",
      hover:   "#ebebeb",
    },
  };
  var theme = T[config.theme] || T.dark;

  // ── Inject base styles once ───────────────────────────────────────────────
  if (!document.getElementById("onlydjs-widget-styles")) {
    var style = document.createElement("style");
    style.id = "onlydjs-widget-styles";
    style.textContent = [
      ".odjs-wrap{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;box-sizing:border-box;}",
      ".odjs-wrap *{box-sizing:border-box;}",
      ".odjs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px;margin-top:12px;}",
      ".odjs-card{display:flex;align-items:center;gap:10px;border-radius:8px;padding:10px;text-decoration:none;transition:background .15s,transform .15s;}",
      ".odjs-card:hover{transform:translateY(-1px);}",
      ".odjs-cover{width:52px;height:52px;border-radius:6px;object-fit:cover;flex-shrink:0;background:#333;}",
      ".odjs-info{overflow:hidden;flex:1;}",
      ".odjs-title{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0;}",
      ".odjs-artist{font-size:11px;margin:2px 0 0;}",
      ".odjs-meta{font-size:10px;margin:3px 0 0;}",
      ".odjs-footer{display:flex;align-items:center;gap:6px;margin-top:12px;padding-top:8px;}",
      ".odjs-footer a{font-size:11px;text-decoration:none;}",
      ".odjs-logo{height:18px;vertical-align:middle;}",
      ".odjs-loading{text-align:center;padding:24px;font-size:13px;}",
      ".odjs-error{text-align:center;padding:16px;font-size:12px;border-radius:8px;}",
    ].join("");
    document.head.appendChild(style);
  }

  // ── Build widget HTML ─────────────────────────────────────────────────────
  function buildWidget(tracks) {
    if (!tracks || tracks.length === 0) {
      return '<div class="odjs-error" style="background:' + theme.card + ';color:' + theme.sub + ';">No se encontraron tracks.</div>';
    }

    var cards = tracks.map(function (t) {
      var cover = t.coverImageUrl || (BASE_URL + "/logo-new-gradient.webp");
      var djName = (t.dj && (t.dj.djName || t.dj.username)) || t.artist;
      var meta   = [t.genre, t.bpm ? t.bpm + " BPM" : null, t.musicalKey].filter(Boolean).join(" · ");

      return [
        '<a class="odjs-card" href="' + t.url + '" target="_blank" rel="noopener"',
        '   style="background:' + theme.card + ';"',
        '   onmouseover="this.style.background=\'' + theme.hover + '\'"',
        '   onmouseout="this.style.background=\'' + theme.card + '\'"',
        '>',
        '  <img class="odjs-cover" src="' + cover + '" alt="" loading="lazy">',
        '  <div class="odjs-info">',
        '    <p class="odjs-title" style="color:' + theme.text + ';">' + escHtml(t.title) + '</p>',
        '    <p class="odjs-artist" style="color:' + theme.sub + ';">' + escHtml(djName) + '</p>',
        '    <p class="odjs-meta" style="color:' + theme.accent + ';">' + escHtml(meta) + '</p>',
        '  </div>',
        '</a>',
      ].join("");
    }).join("");

    var footer = [
      '<div class="odjs-footer" style="border-top:1px solid ' + theme.border + ';">',
      '  <img class="odjs-logo" src="' + BASE_URL + '/logo-new-gradient.webp" alt="ONLYDJS">',
      '  <a href="' + BASE_URL + '" target="_blank" rel="noopener" style="color:' + theme.accent + ';">',
      '    Powered by ONLYDJS',
      '  </a>',
      '</div>',
    ].join("");

    return '<div class="odjs-grid">' + cards + '</div>' + footer;
  }

  function escHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ── Fetch and render ──────────────────────────────────────────────────────
  function render() {
    var container = document.getElementById(config.target);
    if (!container) return;

    container.innerHTML = '<div class="odjs-loading" style="color:' + theme.sub + ';">Cargando tracks…</div>';

    var endpoint = config.dj
      ? API_URL + "/tracks/dj/" + encodeURIComponent(config.dj)
      : API_URL + "/tracks";

    var params = ["sort=" + encodeURIComponent(config.sort), "limit=" + config.limit];
    if (config.genre && !config.dj) params.push("genre=" + encodeURIComponent(config.genre));

    var url = endpoint + "?" + params.join("&");

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (res) {
        var tracks = res.data || [];
        container.innerHTML = '<div class="odjs-wrap" style="background:' + theme.bg + ';border-radius:12px;padding:16px;">' + buildWidget(tracks) + "</div>";
      })
      .catch(function (err) {
        container.innerHTML = '<div class="odjs-error" style="background:' + theme.card + ';color:#f87171;">Error al cargar tracks: ' + err.message + "</div>";
      });
  }

  // ── Init on DOM ready ─────────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
