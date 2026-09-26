/* ===== cloud: nella pagina pubblicata su claude.ai legge, dalla Gmail dei genitori,
   l'ultimo invio fatto dall'app sul telefono di Joy (vedi sync.js) =====
   Fuori da claude.ai (telefono, GitHub Pages) window.claude non esiste e tutto resta spento. */
(function () {
  var SERVER = "Gmail";                                  // nome del connettore come appare su claude.ai
  var QUERY = "subject:Zauberzahlen newer_than:180d";
  var cache = null;

  function available() { return !!(window.claude && typeof window.claude.use === "function"); }

  // il blocco ZZB64:…:ZZEND in fondo all'email → oggetto progressi
  function decode(text) {
    var m = /ZZB64:([A-Za-z0-9+\/=\s]*?):ZZEND/.exec(String(text || ""));
    if (!m) return null;
    try { return JSON.parse(decodeURIComponent(escape(atob(m[1].replace(/\s+/g, ""))))); } catch (e) { return null; }
  }
  function asList(p, keys) {
    if (Array.isArray(p)) return p;
    for (var i = 0; p && i < keys.length; i++) if (Array.isArray(p[keys[i]])) return p[keys[i]];
    return [];
  }
  function textOf(m) { return m.plaintext_body || m.plaintextBody || m.body || m.html_body || m.snippet || ""; }
  function dateOf(m) { return Date.parse(m.date || m.internalDate || "") || 0; }

  // cb(data, err): err = "unavailable" (non siamo su claude.ai) · "none" (nessun invio) · codice errore del connettore
  function load(cb) {
    if (cache) { cb(cache.data, cache.err); return; }
    if (!available()) { cb(null, "unavailable"); return; }
    function finish(data, err) { cache = { data: data, err: err }; cb(data, err); }

    window.claude.use("mcp").then(function (mcp) {
      if (!mcp) { finish(null, "unavailable"); return; }
      return mcp.callTool(SERVER, "search_threads", { query: QUERY, pageSize: 10 }).then(function (res) {
        var threads = asList(res.payload, ["threads", "items", "results"]);
        var ids = threads.map(function (th) { return th.id || th.threadId || th.thread_id; }).filter(Boolean).slice(0, 6);
        if (!ids.length) { finish(null, "none"); return; }
        var best = null;
        // dal più recente: vince l'invio più nuovo che non sia una prova
        function nextThread(i) {
          if (i >= ids.length) { finish(best ? best.data : null, best ? null : "none"); return; }
          mcp.callTool(SERVER, "get_thread", { threadId: ids[i], messageFormat: "PLAIN_TEXT" }).then(function (r) {
            var msgs = asList(r.payload, ["messages"]);
            if (!msgs.length && r.payload && r.payload.thread) msgs = asList(r.payload.thread, ["messages"]);
            msgs.forEach(function (m) {
              var d = decode(textOf(m));
              if (!d || (d._meta && d._meta.test)) return;
              var when = dateOf(m) || (d._meta && Date.parse(d._meta.extracted)) || 0;
              if (!best || when > best.when) best = { data: d, when: when };
            });
            nextThread(i + 1);
          }).catch(function () { nextThread(i + 1); });
        }
        nextThread(0);
      });
    }).catch(function (err) { finish(null, (err && err.code) || "error"); });
  }

  window.MM = window.MM || {};
  window.MM.cloud = { available: available, load: load, decode: decode };
})();
