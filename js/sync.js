/* ===== sync: manda i progressi ai genitori =====
   Il telefono non ha un server: usa il modulo "Contattaci" pubblico del sito di famiglia (Odoo),
   che trasforma il modulo in una email. Il corpo contiene un riepilogo leggibile e, in fondo,
   i progressi completi in base64 (ZZB64:…:ZZEND) che la dashboard su claude.ai sa rileggere.
   Parte solo sull'app installata sul telefono (HOME_HOST) o se mm.sync = "1"; mai su altri siti. */
(function () {
  var ENDPOINT = "https://lapadevadmin-lapa-v2.odoo.com/website/form/mail.mail";
  var EMAIL_TO = "laura+zauberzahlen@lapa.ch";
  var SIGNATURE = "fe4468704a28feca1537a2d2546f95575f28511355abe2d73c761b86e4ebeb1e";   // firma Odoo di EMAIL_TO
  var HOME_HOST = "laura085-hash.github.io";
  var DASHBOARD = "https://claude.ai/artifact/LVC7Pm1vEah7TicXxGSX6Q";
  var K_LAST = "mm.sync_last", K_HASH = "mm.sync_hash", K_ON = "mm.sync";

  function isReal() { return location.hostname === HOME_HOST; }
  function enabled() {
    try {
      var v = localStorage.getItem(K_ON);
      if (v === "0") return false;
      if (v === "1") return true;
    } catch (e) {}
    return isReal();
  }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return String(h); }
  function b64(s) { return btoa(unescape(encodeURIComponent(s))); }
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function fmtDate(d) { return two(d.getDate()) + "." + two(d.getMonth() + 1) + "." + d.getFullYear(); }
  function fmtTime(d) { return two(d.getHours()) + ":" + two(d.getMinutes()); }
  var STATO = { started: "all'inizio", consolidating: "si consolida", mastered: "acquisito" };

  // email leggibile (italiano, per i genitori) + blocco dati in fondo
  function build() {
    var raw = MM.storage.raw();
    if (!raw) return null;
    var data;
    try { data = JSON.parse(raw); } catch (e) { return null; }
    if (!data || typeof data !== "object") return null;
    var now = new Date();
    data._meta = { lang: MM.i18n.lang, device: isReal() ? "joy-phone" : location.hostname, test: !isReal(),
                   extracted: now.toISOString() };
    var tot = MM.storage.totals(data);
    var pct = tot.attempts ? Math.round(tot.correct / tot.attempts * 100) : 0;
    var who = isReal() ? "Joy" : "TEST";
    var subject = "[Zauberzahlen] " + who + " · " + fmtDate(now) + " · " + tot.sessions + " Spiele · " + pct + "% richtig";

    var lines = [];
    lines.push("Progressi di " + who + " in Zauberzahlen — " + fmtDate(now) + " " + fmtTime(now));
    lines.push("");
    lines.push("Totale: " + tot.sessions + " sessioni, " + tot.attempts + " risposte, " + tot.correct
               + " giuste al primo colpo (" + pct + "%), " + tot.games + " giochi provati.");
    lines.push("");
    MM.storage.getSummary(data).forEach(function (s) {
      if (!s.attempts) return;
      var g = MM.games[s.id] || {};
      lines.push((g.emoji || "") + " " + MM.i18n.t(g.nameKey || s.id) + ": " + s.attempts + " risposte · "
                 + Math.round(s.accuracy * 100) + "% giuste · " + Math.round(s.recallShare * 100) + "% senza contare · livello "
                 + s.level + "/" + s.maxLevel + " · " + (STATO[s.status] || s.status));
    });
    var words = data.words || {};
    var wk = Object.keys(words);
    if (wk.length) {
      lines.push("");
      lines.push("Lernwörter (giuste al 1° colpo / sbagliate):");
      wk.sort(function (a, b) { return (words[b].w || 0) - (words[a].w || 0); });
      wk.forEach(function (w) { lines.push("  " + w + ": " + (words[w].r || 0) + " / " + (words[w].w || 0)); });
    }
    lines.push("");
    lines.push("Dashboard completa: " + DASHBOARD);
    lines.push("");
    lines.push("ZZB64:" + b64(JSON.stringify(data)) + ":ZZEND");
    return { subject: subject, body: lines.join("\n"), hash: hash(raw) };
  }

  function formData(msg) {
    var fd = new FormData();
    fd.append("email_from", "Zauberzahlen");
    fd.append("email_to", EMAIL_TO);
    fd.append("website_form_signature", SIGNATURE);
    fd.append("subject", msg.subject);
    fd.append("description", msg.body);
    return fd;
  }

  // manda se ci sono novità dall'ultimo invio e se è passato almeno `minGapMs`
  function send(useBeacon, minGapMs, force) {
    if (!force && !enabled()) return false;
    var msg = build();
    if (!msg) return false;
    var last = 0, lastHash = "";
    try { last = +localStorage.getItem(K_LAST) || 0; lastHash = localStorage.getItem(K_HASH) || ""; } catch (e) {}
    if (!force && msg.hash === lastHash) return false;
    if (!force && Date.now() - last < (minGapMs || 0)) return false;
    var fd = formData(msg), sent = false;
    if (useBeacon && navigator.sendBeacon) {
      try { sent = navigator.sendBeacon(ENDPOINT, fd); } catch (e) { sent = false; }
    }
    if (!sent) {
      try { fetch(ENDPOINT, { method: "POST", body: fd, mode: "no-cors", keepalive: true }).catch(function () {}); sent = true; }
      catch (e) { sent = false; }
    }
    if (sent) { try { localStorage.setItem(K_LAST, String(Date.now())); localStorage.setItem(K_HASH, msg.hash); } catch (e) {} }
    return sent;
  }

  // quando l'app va in secondo piano (fine del gioco): un'email per sessione di gioco
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") send(true, 2 * 60 * 1000);
  });
  window.addEventListener("pagehide", function () { send(true, 2 * 60 * 1000); });

  window.MM = window.MM || {};
  window.MM.sync = {
    send: send,
    enabled: enabled,
    isReal: isReal,
    build: build,
    // all'apertura: recupera un invio perso (es. rete assente alla chiusura precedente)
    onHome: function () { send(false, 6 * 60 * 60 * 1000); }
  };
})();
