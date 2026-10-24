/* ===== report: cosa ha fatto Joy OGGI — per l'email ai genitori (sync.js) e il pannello "Für Eltern" (parent.js) =====
   Legge il registro delle risposte (storage: data.log, una riga per esercizio con gli errori di Joy) e dice:
   - quante sessioni/esercizi oggi e con che percentuale, gioco per gioco (con il confronto "prima di oggi");
   - gli errori concreti di oggi: domanda → cosa ha scritto/scelto;
   - dove è migliorata: percentuale su rispetto a prima, salti di livello, parole prima sbagliate e oggi giuste;
   - dove deve ancora lavorare: giochi/argomenti sotto soglia, parole sbagliate oggi;
   - gli ultimi 7 giorni in una riga ciascuno (la direzione). */
(function () {
  // etichette leggibili per gli argomenti (round.topic / mode / kind / form)
  var TOPIC = {
    compass: "Kompass", symbol: "Kartensymbole", dir: "Wegbeschreibung", places: "Orte", town: "Stadt/Dorf",
    "class": "Wortarten", adj: "Adjektive", verb: "Verben", noun: "Nomen", contr: "Kurzformen & Pronomen",
    spell: "Schreibweise erkennen", gap: "Lücken", merk: "Merken & schreiben", hear: "Hören & schreiben", article: "Artikel",
    syll: "Silben", sentence: "Lückensatz", full: "ganzer Satz", type: "schreiben", copy: "abschreiben", memo: "merken",
    blanks: "Striche", dictate: "Diktat",
    ones: "Einer", tens: "Zehner", cross: "Zehnerübergang", ze: "Z+E", zecross: "Z+E Übergang",
    ten: "bis 10", hundred: "bis 100", mixed: "gemischt", rev: "umgekehrt", minus: "100 minus",
    double: "Doppelte", half: "Hälfte", compose: "zusammensetzen", decompose: "zerlegen", chart: "Tafel", read: "lesen",
    build: "legen", bundle: "bündeln", pair: "Nachbarn", between: "dazwischen", board: "Hundertertafel", find: "finden",
    shape: "Formen", num: "Zahlenfolge", grow: "wachsen", split: "zerlegen", takeaway: "wegnehmen", difference: "Unterschied",
    inverse: "umgekehrt", pack: "Päckchen", easy: "leichteste zuerst", table: "Tabelle", story: "Geschichte", fill: "füllen",
    together: "zusammen", reverse: "andersrum", halfTogether: "halb & zusammen"
  };
  function two(n) { return (n < 10 ? "0" : "") + n; }
  function dayOf(sec) { var d = new Date(sec * 1000); return d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()); }
  function fmtDay(key) { var p = key.split("-"); return p[2] + "." + p[1] + "." + p[0]; }
  function pct(c, t) { return t ? Math.round(c / t * 100) : 0; }
  function nameOf(id) { var g = MM.games[id] || {}; return (g.emoji ? g.emoji + " " : "") + MM.i18n.t(g.nameKey || id); }
  function topicLabel(k) { return TOPIC[k] || k; }
  function isWordGame(id) { return id === "herbst" || id === "words" || id === "diktat"; }
  function wordOf(q) { return String(q || "").replace(/^(der|die|das) /, ""); }

  // riepilogo di un giorno (default: oggi)
  function daily(src, dayKey) {
    var data = MM.storage.data(src), log = data.log || [];
    var today = dayKey || dayOf(Date.now() / 1000);
    var tl = log.filter(function (e) { return dayOf(e.t) === today; });
    var sessions = {};
    tl.forEach(function (e) { sessions[e.s] = 1; });
    var byGame = {};
    tl.forEach(function (e) {
      var g = byGame[e.g] || (byGame[e.g] = { id: e.g, rounds: 0, first: 0, late: 0, lvlFrom: e.L, errors: [], topics: {} });
      g.rounds++; if (e.ok) g.first++; else g.late++;
      if (e.L < g.lvlFrom) g.lvlFrom = e.L;
      var k = e.k || "";
      var tp = g.topics[k] || (g.topics[k] = { n: 0, ok: 0 }); tp.n++; if (e.ok) tp.ok++;
      if (!e.ok) g.errors.push({ q: e.q || "", w: e.w || [], k: k });
    });
    var games = Object.keys(byGame).map(function (id) {
      var g = byGame[id], sk = (data.skills && data.skills[id]) || { attempts: 0, correct: 0, level: 1 };
      g.pct = pct(g.first, g.rounds);
      g.level = sk.level || 1;                             // livello attuale: se > lvlFrom è salita oggi
      var bAtt = (sk.attempts || 0) - g.rounds, bCor = (sk.correct || 0) - g.first;
      g.before = bAtt >= 5 ? pct(bCor, bAtt) : null;       // percentuale PRIMA di oggi (se c'è abbastanza storia)
      return g;
    });
    games.sort(function (a, b) { return b.rounds - a.rounds; });
    var rounds = tl.length, first = tl.filter(function (e) { return e.ok; }).length;

    var better = [], work = [];
    games.forEach(function (g) {
      if (g.level > g.lvlFrom) better.push({ type: "level", id: g.id, from: g.lvlFrom, to: g.level });
      if (g.rounds >= 4 && g.before !== null && g.pct >= g.before + 10) better.push({ type: "pct", id: g.id, now: g.pct, before: g.before });
      if (g.rounds >= 4 && g.pct < 60) work.push({ type: "pct", id: g.id, now: g.pct, before: g.before });
      Object.keys(g.topics).forEach(function (k) {
        var tp = g.topics[k];
        if (k && tp.n >= 3 && pct(tp.ok, tp.n) <= 50) work.push({ type: "topic", id: g.id, k: k, ok: tp.ok, n: tp.n });
      });
    });
    // parole: nei giorni prima sbagliate → oggi giuste al 1° colpo (meglio) · oggi sbagliate (da lavorare)
    var prevWrong = {};
    log.forEach(function (e) { if (isWordGame(e.g) && !e.ok && dayOf(e.t) < today) prevWrong[wordOf(e.q)] = 1; });
    var tw = {};
    tl.forEach(function (e) {
      if (!isWordGame(e.g)) return;
      var q = wordOf(e.q), w = tw[q] || (tw[q] = { ok: 0, bad: 0, wrote: [] });
      if (e.ok) w.ok++;
      else { w.bad++; (e.w || []).forEach(function (x) { if (x && w.wrote.indexOf(x) < 0) w.wrote.push(x); }); }
    });
    Object.keys(tw).forEach(function (q) {
      var w = tw[q];
      if (w.ok && !w.bad && prevWrong[q]) better.push({ type: "word", q: q });
      if (w.bad) work.push({ type: "word", q: q, wrote: w.wrote.slice(0, 3) });
    });
    return { day: today, sessions: Object.keys(sessions).length, rounds: rounds, first: first, pct: pct(first, rounds),
             games: games, better: better, work: work };
  }

  // una riga per giorno, ultimi n giorni con attività (oggi incluso se ha giocato)
  function history(src, n) {
    var log = MM.storage.data(src).log || [], days = {};
    log.forEach(function (e) {
      var k = dayOf(e.t), d = days[k] || (days[k] = { day: k, rounds: 0, first: 0, sess: {} });
      d.rounds++; if (e.ok) d.first++; d.sess[e.s] = 1;
    });
    return Object.keys(days).sort().slice(-(n || 7)).map(function (k) {
      var d = days[k];
      return { day: k, sessions: Object.keys(d.sess).length, rounds: d.rounds, first: d.first, pct: pct(d.first, d.rounds) };
    });
  }

  function quote(s) { return "“" + s + "”"; }
  function errorLine(id, e) {
    var what = e.w.length ? (isWordGame(id) ? "ha scritto " : "ha scelto ") + e.w.map(quote).join(", ") : "sbagliato";
    return "  " + nameOf(id) + ": " + (e.q || "?") + (e.k ? " (" + topicLabel(e.k) + ")" : "") + " → " + what + " (poi giusto)";
  }

  // testo italiano per l'email ai genitori
  function text(src, now) {
    var r = daily(src), lines = [];
    var D = fmtDay(r.day);
    if (!r.rounds) {
      lines.push("OGGI " + D + ": nessuna sessione.");
    } else {
      lines.push("OGGI " + D + ": " + r.sessions + " sessioni · " + r.rounds + " esercizi · " + r.first + " giusti al 1° colpo (" + r.pct + "%)");
      lines.push("Per gioco:");
      r.games.forEach(function (g) {
        var s = "  " + nameOf(g.id) + ": " + g.rounds + " esercizi · " + g.first + " giusti (" + g.pct + "%)";
        s += g.before === null ? " · primi giorni" : " · prima di oggi " + g.before + "%";
        s += g.level > g.lvlFrom ? " · livello " + g.lvlFrom + " → " + g.level + " ⬆" : " · livello " + g.level;
        lines.push(s);
      });
      var errs = [];
      r.games.forEach(function (g) { g.errors.forEach(function (e) { errs.push(errorLine(g.id, e)); }); });
      lines.push("Errori di oggi" + (errs.length ? ":" : ": nessuno 🎉"));
      errs.slice(0, 25).forEach(function (l) { lines.push(l); });
      if (errs.length > 25) lines.push("  … e altri " + (errs.length - 25));
      lines.push("Meglio di prima" + (r.better.length ? ":" : ": niente di nuovo oggi"));
      r.better.forEach(function (b) {
        if (b.type === "level") lines.push("  " + nameOf(b.id) + ": livello " + b.from + " → " + b.to + " ⬆");
        else if (b.type === "pct") lines.push("  " + nameOf(b.id) + ": " + b.now + "% oggi, prima " + b.before + "%");
        else lines.push("  " + b.q + ": nei giorni scorsi sbagliata, oggi giusta al 1° colpo ✓");
      });
      lines.push("Da lavorare ancora" + (r.work.length ? ":" : ": niente sotto soglia oggi"));
      r.work.forEach(function (w) {
        if (w.type === "pct") lines.push("  " + nameOf(w.id) + ": solo " + w.now + "% oggi" + (w.before !== null ? " (prima " + w.before + "%)" : ""));
        else if (w.type === "topic") lines.push("  " + nameOf(w.id) + " · " + topicLabel(w.k) + ": " + w.ok + " su " + w.n);
        else lines.push("  " + w.q + (w.wrote.length ? " (ha scritto: " + w.wrote.join(", ") + ")" : ""));
      });
    }
    var h = history(src, 7);
    if (h.length) {
      lines.push("Ultimi giorni:");
      h.forEach(function (d) { lines.push("  " + fmtDay(d.day) + ": " + d.sessions + " sessioni · " + d.rounds + " esercizi · " + d.pct + "% al 1° colpo"); });
    }
    return lines;
  }

  // pannello per la pagina genitori (DE/EN via i18n)
  function panel(src) {
    var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
    var r = daily(src), h = history(src, 7);
    var p = ui.el("div", { class: "panel" });
    p.appendChild(ui.el("h2", {}, [t("rptToday") + " · " + fmtDay(r.day)]));
    function row(label, cls, line) {
      var head = ui.el("div", { class: "skill-head" }, [ui.el("span", { class: "grow" }, [label])]);
      head.querySelector(".grow").style.flex = "1";
      if (cls) head.appendChild(ui.el("span", { class: "tag " + cls }, [line]));
      var el = ui.el("div", { class: "word-row" }, [head]);
      return el;
    }
    if (!r.rounds) {
      p.appendChild(ui.el("div", { class: "muted" }, [t("rptNone")]));
    } else {
      p.appendChild(ui.el("div", { class: "muted" }, [r.sessions + " · " + r.rounds + " " + t("rptRounds") + " · " + r.first + " " + t("rptFirst") + " (" + r.pct + "%)"]));
      r.games.forEach(function (g) {
        var cls = g.pct >= 80 ? "mastered" : (g.pct >= 60 ? "consolidating" : "started");
        var line = g.first + "/" + g.rounds + " · " + g.pct + "%" + (g.before !== null ? " (" + t("rptBefore") + " " + g.before + "%)" : "")
                 + (g.level > g.lvlFrom ? " · ⭐" + g.lvlFrom + "→" + g.level : "");
        p.appendChild(row(nameOf(g.id), cls, line));
      });
      var errs = [];
      r.games.forEach(function (g) { g.errors.forEach(function (e) { errs.push({ id: g.id, e: e }); }); });
      if (errs.length) {
        p.appendChild(ui.el("h2", {}, [t("rptErrors")]));
        errs.slice(0, 30).forEach(function (x) {
          var e = x.e, what = e.w.length ? e.w.map(quote).join(", ") : "✗";
          p.appendChild(ui.el("div", { class: "muted" }, [nameOf(x.id) + " · " + (e.q || "?") + (e.k ? " (" + topicLabel(e.k) + ")" : "") + " → " + what]));
        });
      }
      if (r.better.length) {
        p.appendChild(ui.el("h2", {}, [t("rptBetter")]));
        r.better.forEach(function (b) {
          var s = b.type === "level" ? nameOf(b.id) + ": ⭐ " + b.from + " → " + b.to
                : b.type === "pct" ? nameOf(b.id) + ": " + b.now + "% (" + t("rptBefore") + " " + b.before + "%)"
                : b.q + " ✓";
          p.appendChild(ui.el("div", { class: "muted" }, [s]));
        });
      }
      if (r.work.length) {
        p.appendChild(ui.el("h2", {}, [t("rptWork")]));
        r.work.forEach(function (w) {
          var s = w.type === "pct" ? nameOf(w.id) + ": " + w.now + "%"
                : w.type === "topic" ? nameOf(w.id) + " · " + topicLabel(w.k) + ": " + w.ok + "/" + w.n
                : w.q + (w.wrote.length ? " (" + w.wrote.join(", ") + ")" : "");
          p.appendChild(ui.el("div", { class: "muted" }, [s]));
        });
      }
    }
    if (h.length) {
      p.appendChild(ui.el("h2", {}, [t("rptDays")]));
      h.slice().reverse().forEach(function (d) {
        var cls = d.pct >= 80 ? "mastered" : (d.pct >= 60 ? "consolidating" : "started");
        p.appendChild(row(fmtDay(d.day) + " · " + d.sessions + " × · " + d.rounds + " " + t("rptRounds"), cls, d.pct + "%"));
      });
    }
    return p;
  }

  window.MM = window.MM || {};
  window.MM.report = { daily: daily, history: history, text: text, panel: panel, dayOf: dayOf, TOPIC: TOPIC };
})();
