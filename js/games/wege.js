/* ===== Giochi 27-28: Plus-Wege / Minus-Wege — "Von einfachen zu schwierigen Plus-/Minusaufgaben" =====
   Schweizer Zahlenbuch 2, S. 38-39 (Plus) und 42-43 (Minus); Test am Montag 9.11.2026.
   Il maestro: "ogni bambino trova il SUO Rechenweg" (nel libro: zeichnen · Zehner und Einer extra ·
   Schritt für Schritt · vereinfachen · Hilfsaufgabe am Rechenstrich).
   Una sessione = una pagina del libro in piccolo, 5 round in ordine fisso:
     0 "zehner": Aufgabe 3 – wann entsteht ein neuer Zehner / wann wird ein Zehner angeknabbert (2 Aufgaben mit Bild)
     1 "tripel": Aufgabe 4 (und 5) – Zehner dazu, Einer dazu, beides (24 + 10 · 24 + 8 · 24 + 18)
     2 "leicht": Aufgabe 6 – die leichte Aufgabe zuerst antippen, dann die Nachbarn daraus ableiten
     3 "weg":    Aufgabe 1/2 – eigener Rechenweg, ohne Zehnerübergang (wie 59 − 24)
     4 "weg":    Aufgabe 1/2 – eigener Rechenweg, mit Zehnerübergang (wie 54 − 29)
   NIENTE scelte da cui andare per esclusione: ogni numero lo scrive lei sul tastierino, passo per passo
   (anche i risultati intermedi del suo Rechenweg), e la risposta non viene mai mostrata.
   La scelta del Rechenweg non ha "giusto/sbagliato": viene registrata (round.topic = "w_<weg>") così i
   genitori vedono nel report quale strada sceglie e con quale riesce al primo colpo. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  function rep(n, v) { var out = []; for (var i = 0; i < n; i++) out.push(v); return out; }

  var PLAN = ["zehner", "tripel", "leicht", "weg", "weg"];
  var WAYS = {
    schritt: { e: "🪜", n: "w_schritt", s: "w_schritt_s" },   // Leon / Ramon: erst die Zehner, dann die Einer
    stellen: { e: "🧱", n: "w_stellen", s: "w_stellen_s" },   // Nina / Ramon: Zehner extra, Einer extra, zusammen
    rund:    { e: "🎯", n: "w_rund",    s: "w_rund_s" },      // Ali / Lasse: Hilfsaufgabe mit der runden Zahl, dann zurück
    tausch:  { e: "🔁", n: "w_tausch",  s: "w_tausch_s" },    // Zoe / Iris: beide Zahlen verändern (vereinfachen)
    bild:    { e: "✏️", n: "w_bild",    s: "w_bild_s" },      // Eva / Sanja: Striche und Punkte
    kopf:    { e: "🧠", n: "w_kopf",    s: "w_kopf_s" }       // ohne Hilfe (erst ab Stufe 4)
  };

  /* ---------- Aufgaben erzeugen ---------- */

  // Aufgabe 3: zwei Aufgaben, eine mit und eine ohne Zehnerübergang. Pro Aufgabe zwei Schritte:
  // "Wie viele Zehner hat das Ergebnis?" (= entsteht ein neuer Zehner / wird einer angeknabbert?) und das Ergebnis.
  function zehner(op, level) {
    var ta = ui.randInt(2, level >= 3 ? 8 : 5), x, y, tasks;
    if (op === "+") {
      x = ui.randInt(3, 8);
      var a = ta * 10 + x;
      tasks = [{ a: a, b: ui.randInt(1, 9 - x) }, { a: a, b: ui.randInt(11 - x, 9) }];        // 37 + 2 · 37 + 6
    } else {
      x = ui.randInt(2, 7); y = ui.randInt(x + 1, 9);
      tasks = [{ a: ta * 10 + y, b: x }, { a: ta * 10 + x, b: y }];                            // 37 − 4 · 34 − 7
    }
    if (level >= 2 && Math.random() < 0.5) tasks.reverse();
    var answers = [];
    tasks.forEach(function (k) {
      k.ans = op === "+" ? k.a + k.b : k.a - k.b;
      k.z = Math.floor(k.ans / 10);
      k.cross = k.z !== Math.floor(k.a / 10);
      answers.push(k.z, k.ans);
    });
    return { tasks: tasks, answers: answers, ans: answers[0],
             q: tasks.map(function (k) { return k.a + " " + op + " " + k.b; }).join(" · ") };
  }

  // Aufgabe 4: a ± Zehner, a ± Einer, a ± beides. Ab Stufe 2 manchmal über den Hunderter (Aufgabe 5: 99 + 10, 99 + 8, 99 + 18).
  function tripel(op, level) {
    var cross = Math.random() < (level === 1 ? 0.5 : 0.8), a, z, e, ta, oa;
    if (op === "+") {
      if (level >= 2 && Math.random() < 0.3) {
        oa = ui.randInt(4, 9); a = 90 + oa; z = ui.randInt(1, 3) * 10; e = ui.randInt(Math.max(2, 11 - oa), 9);
      } else {
        ta = ui.randInt(2, 5); oa = ui.randInt(3, 8); a = ta * 10 + oa; z = ui.randInt(1, 8 - ta) * 10;
        e = cross ? ui.randInt(11 - oa, 9) : ui.randInt(1, 9 - oa);
      }
    } else {
      ta = ui.randInt(4, 9); oa = ui.randInt(2, 8); a = ta * 10 + oa; z = ui.randInt(1, ta - 2) * 10;
      e = cross ? ui.randInt(oa + 1, 9) : ui.randInt(1, oa - 1);
    }
    var rows = [{ b: z, form: "z" }, { b: e, form: "e" }];
    if (level >= 2 && Math.random() < 0.5) rows.reverse();
    rows.push({ b: z + e, form: "ze" });
    rows.forEach(function (w) { w.a = a; w.ans = op === "+" ? a + w.b : a - w.b; });
    return { a: a, z: z, e: e, rows: rows, answers: rows.map(function (w) { return w.ans; }), ans: rows[0].ans,
             q: a + " " + op + " " + rows.map(function (w) { return w.b; }).join(" / ") };
  }

  // Aufgabe 6: "Beginne immer mit einer einfachen Aufgabe": a ± T (glatter Zehner) ist leicht,
  // die Nachbarn (T − 1, T − 2, zehn mehr) leitet sie daraus ab.
  function leicht(op, level) {
    var four = level >= 3, ta, oa, a, T, bs;
    if (op === "+") {
      ta = ui.randInt(1, 5); oa = ui.randInt(3, 8); a = ta * 10 + oa; T = ui.randInt(1, Math.min(3, 7 - ta)) * 10;
      bs = four ? [T, T - 1, T - 2, T + 9] : (Math.random() < 0.5 ? [T, T - 1, T - 2] : [T, T - 1, T + 9]);
    } else {
      ta = ui.randInt(4, 9); oa = ui.randInt(2, 8); a = ta * 10 + oa; T = ui.randInt(1, ta - 2) * 10;
      bs = four ? [T, T - 1, T - 2, T + 8] : (Math.random() < 0.5 ? [T, T - 1, T - 2] : [T, T - 1, T + 9]);
    }
    var logical = bs.map(function (b) {
      return { a: a, b: b, ans: op === "+" ? a + b : a - b, ref: b === T ? null : (b < T ? T : b - 10) };
    });
    var rows = ui.shuffle(logical);
    var order = logical.map(function (w) { return rows.indexOf(w); });
    return { a: a, T: T, rows: rows, order: order, easyIdx: order[0],
             answers: order.map(function (i) { return rows[i].ans; }), ans: rows[order[0]].ans,
             q: a + " " + op + " " + bs.join(" / ") };
  }

  // Aufgabe 1/2: eine Aufgabe ZE ± ZE, sie wählt ihren Rechenweg.
  function weg(op, level, idx) {
    var cross = (idx % PLAN.length) === 4 || (level >= 3 && Math.random() < 0.8);
    var big = cross && Math.random() < 0.5;      // zweite Zahl mit 7, 8 oder 9 Einern: die runde Zahl liegt nah
    var ta, tb, oa, ob;
    if (op === "+") {
      ta = ui.randInt(1, 6); tb = ui.randInt(1, 8 - ta);
      if (!cross) { oa = ui.randInt(1, 7); ob = ui.randInt(1, 9 - oa); }
      else if (big) { ob = ui.randInt(7, 9); oa = ui.randInt(11 - ob, 9); }
      else { oa = ui.randInt(2, 9); ob = ui.randInt(11 - oa, 9); }
    } else {
      ta = ui.randInt(3, 9); tb = ui.randInt(1, ta - 2);
      if (!cross) { oa = ui.randInt(2, 9); ob = ui.randInt(1, oa - 1); }
      else if (big) { ob = ui.randInt(7, 9); oa = ui.randInt(1, ob - 1); }
      else { oa = ui.randInt(1, 8); ob = ui.randInt(oa + 1, 9); }
    }
    var a = ta * 10 + oa, b = tb * 10 + ob;
    return { a: a, b: b, ans: op === "+" ? a + b : a - b, cross: cross, topic: "w_frei", q: a + " " + op + " " + b };
  }

  function make(op, level, idx) {
    var kind = PLAN[(idx || 0) % PLAN.length];
    var r = kind === "zehner" ? zehner(op, level) : kind === "tripel" ? tripel(op, level)
          : kind === "leicht" ? leicht(op, level) : weg(op, level, idx || 0);
    r.kind = kind; r.op = op; r.topic = r.topic || kind;
    return r;
  }

  /* ---------- Rechenwege ---------- */

  // welche Wege passen zu dieser Aufgabe (und zu dieser Stufe)
  function waysFor(r, level) {
    var P = r.op === "+", oa = r.a % 10, ob = r.b % 10, d = 10 - ob, w = ["schritt"];
    if (P || (!r.cross && oa > ob)) w.push("stellen");            // bei Minus mit Übergang geht "Einer minus Einer" nicht
    if (ob >= 7) w.push("rund");
    if (level >= 2 && ob >= 7 && (P ? oa >= d : oa + d <= 9)) w.push("tausch");
    w.push("bild");
    if (level >= 4) w.push("kopf");
    return w;
  }

  // die Schritte eines Weges: jede Zeile ist eine kleine Rechnung, das letzte Ergebnis ist das Ergebnis der Aufgabe
  function steps(r, way) {
    var a = r.a, b = r.b, P = r.op === "+", op = r.op;
    var ta = Math.floor(a / 10), oa = a % 10, tb = Math.floor(b / 10), ob = b % 10, z = tb * 10;
    var R = (tb + 1) * 10, d = R - b, s = [], m;
    function st(parts, ans, hint) { s.push({ parts: parts, ans: ans, hint: hint }); }
    if (way === "schritt") {
      m = P ? a + z : a - z;
      st([a, op, z, "=", "?"], m, t("h_wTens"));
      st([m, op, ob, "=", "?"], r.ans, r.cross
        ? t(P ? "h_pCross" : "h_mCross", { a: m, ten: P ? (Math.floor(m / 10) + 1) * 10 : Math.floor(m / 10) * 10 })
        : t("h_wOnesOnly"));
    } else if (way === "stellen") {
      var zz = P ? ta * 10 + z : ta * 10 - z, ee = P ? oa + ob : oa - ob;
      st([ta * 10, op, z, "=", "?"], zz, t("h_wStZ"));
      st([oa, op, ob, "=", "?"], ee, t("h_wStE"));
      st([zz, "+", ee, "=", "?"], r.ans, t("h_wStSum"));
    } else if (way === "rund") {
      m = P ? a + R : a - R;
      st([a, op, R, "=", "?"], m, t("h_wRund1", { b: b, R: R }));
      st([m, P ? "−" : "+", d, "=", "?"], r.ans, t(P ? "h_wRundBackP" : "h_wRundBackM", { d: d }));
    } else if (way === "tausch") {
      m = P ? a - d : a + d;
      st([a, P ? "−" : "+", d, "=", "?"], m, t(P ? "h_wTauschP" : "h_wTauschM", { a: a, b: b, R: R, d: d }));
      st([m, op, R, "=", "?"], r.ans, t("h_wTens"));
    } else if (way === "bild") {
      st([a, op, b, "=", "?"], r.ans, t(P ? "h_wBildP" : "h_wBildM", { tb: tb, ob: ob }));
    } else {
      st([a, op, b, "=", "?"], r.ans, t(P ? (r.cross ? "h_pZEcross" : "h_pZE") : (r.cross ? "h_mZEcross" : "h_mZE")));
    }
    return s;
  }

  /* ---------- Bausteine fürs Bild und die Zeilen ---------- */

  // Bild wie im Heft: Zehner = Striche, Einer = Punkte im Zehnerfeld (5 + 5). dots = Liste von Farben "a" | "b" | "n".
  // Ein volles Feld leuchtet: 10 Punkte = 1 Zehner.
  function picture(tens, dots, opts) {
    opts = opts || {};
    var box = ui.el("div", { class: "wpic" });
    var col = ui.el("div", { class: "tens-col" });
    for (var i = 0; i < tens; i++) {
      col.appendChild(ui.el("span", { class: "tbar" + (opts.tensB && i >= tens - opts.tensB ? " b" : "") + (opts.newBar && i === tens - 1 ? " new" : "") }));
    }
    box.appendChild(col);
    var fr = ui.el("div", { class: "wframes" });
    for (var f = 0; f * 10 < dots.length; f++) {
      var chunk = dots.slice(f * 10, f * 10 + 10);
      var frame = ui.el("div", { class: "wframe" + (chunk.length === 10 ? (opts.nib && f === 0 ? " nib" : " full") : "") });
      for (var j = 0; j < 10; j++) frame.appendChild(ui.el("span", { class: "wdot" + (j < chunk.length ? " on " + chunk[j] : "") }));
      fr.appendChild(frame);
    }
    box.appendChild(fr);
    return box;
  }

  function rowEl(parts, tappable, cls) {
    var row = ui.el(tappable ? "button" : "div", { class: "prow" + (tappable ? " tappable" : "") + (cls ? " " + cls : "") });
    if (tappable) row.appendChild(ui.el("span", { class: "mark" }, [""]));
    parts.forEach(function (p) {
      var isQ = p === "?", label = typeof p === "string" && p.length > 2;
      var c = ui.el("span", { class: "pcell" + (isQ ? " q" : "") + (label ? " plabel" : "") }, [String(p)]);
      if (isQ) row._q = c;
      row.appendChild(c);
    });
    return row;
  }

  // löst die Schritte der Reihe nach mit EINEM Ziffernblock. items[k] = { row | parts, ans, hint, before(), after() }.
  // Eine Zeile, die es noch nicht gibt, erscheint erst, wenn sie dran ist (so verrät sie kein Zwischenergebnis).
  function solve(pack, holder, api, items) {
    var k = 0, np = null, row = null;
    function start() {
      var it = items[k];
      row = it.row || (it.row = rowEl(it.parts, false, it.cls));
      if (!row.parentNode) pack.appendChild(row);
      row.classList.add("active");
      if (it.before) it.before();
      if (np) { np.reset(); return; }
      np = ui.numpad({ maxLen: 3, onSubmit: function (v) {
        var cur = items[k], ok = (v === cur.ans);
        np.mark(ok);
        if (!ok) { api.submit(false, { hint: cur.hint }); setTimeout(np.reset, 1100); return; }
        row._q.textContent = String(v);
        row.classList.remove("active"); row.classList.add("ok");
        if (cur.after) cur.after();
        k++;
        if (k >= items.length) return api.submit(true, { recall: true });
        MM.audio.sfx("sparkle"); ui.sparkle(5);
        setTimeout(start, 350);
      } });
      holder.appendChild(np.el);
    }
    start();
  }

  /* ---------- die vier Arten von Runden ---------- */

  function renderZehner(mount, round, api) {
    var P = round.op === "+";
    api.prompt(t(P ? "p_wNeu" : "p_wKnab"));
    var picBox = ui.el("div", { class: "wpicbox" }); mount.appendChild(picBox);
    var done = ui.el("div", { class: "wdone" }); mount.appendChild(done);
    var pack = ui.el("div", { class: "pack" }); mount.appendChild(pack);
    var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
    function show(node) { ui.clear(picBox); picBox.appendChild(node); }
    var items = [];
    round.tasks.forEach(function (k, i) {
      var ta = Math.floor(k.a / 10), oa = k.a % 10;
      items.push({
        parts: [k.a, round.op, k.b, "→", t("w_zLabel"), "?"], ans: k.z, cls: "wz",
        hint: t(P ? "h_wNeuZ" : "h_wKnabZ", { a: k.a, oa: oa, b: k.b }),
        before: function () { show(P ? picture(ta, rep(oa, "a").concat(rep(k.b, "b"))) : picture(ta, rep(oa, "a"))); },
        after: function () {
          if (!k.cross) return;
          // sichtbar machen: 10 Punkte werden ein neuer Zehner · ein Zehner wird zu 10 Punkten
          show(P ? picture(ta + 1, rep(oa + k.b - 10, "b"), { newBar: true })
                 : picture(ta - 1, rep(10, "n").concat(rep(oa, "a")), { nib: true }));
        }
      });
      items.push({
        parts: [k.a, round.op, k.b, "=", "?"], ans: k.ans,
        hint: k.cross ? t(P ? "h_pCross" : "h_mCross", { a: k.a, ten: P ? (ta + 1) * 10 : ta * 10 }) : t("h_wOnesOnly"),
        after: function () {
          // die zwei Zeilen dieser Aufgabe werden zu einer Merkzeile: so stehen beide Aufgaben am Ende nebeneinander
          items[2 * i].row.classList.add("gone"); items[2 * i + 1].row.classList.add("gone");
          done.appendChild(ui.el("div", { class: "wsum" + (k.cross ? " cross" : "") }, [
            k.a + " " + round.op + " " + k.b + " = " + k.ans + "  ·  " +
            t(k.cross ? (P ? "w_neuJa" : "w_knabJa") : (P ? "w_neuNein" : "w_knabNein"))
          ]));
        }
      });
    });
    solve(pack, holder, api, items);
  }

  function renderTripel(mount, round, api) {
    var P = round.op === "+", a = round.a, ta = Math.floor(a / 10), oa = a % 10;
    api.prompt(t("p_wTripel"));
    var pack = ui.el("div", { class: "pack" }); mount.appendChild(pack);
    var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
    var crossE = P ? oa + round.e >= 10 : round.e > oa;
    var items = round.rows.map(function (w) {
      var hint = w.form === "z" ? t("h_wTens")
               : w.form === "e" ? (crossE ? t(P ? "h_pCross" : "h_mCross", { a: a, ten: P ? (ta + 1) * 10 : ta * 10 }) : t("h_wOnesOnly"))
               : t("h_wTri3", { a: a, op: round.op, z: round.z, e: round.e });
      var row = rowEl([a, round.op, w.b, "=", "?"]); pack.appendChild(row);
      return { row: row, ans: w.ans, hint: hint };
    });
    solve(pack, holder, api, items);
  }

  function renderLeicht(mount, round, api) {
    var P = round.op === "+";
    var pack = ui.el("div", { class: "pack" }); mount.appendChild(pack);
    var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
    var rowEls = round.rows.map(function (w) { var el = rowEl([w.a, round.op, w.b, "=", "?"], true); pack.appendChild(el); return el; });
    var items = round.order.map(function (i, k) {
      var w = round.rows[i], hint;
      if (k === 0) hint = t("h_wTens");
      else {
        var d = w.b - w.ref;
        hint = t(P ? (d < 0 ? "h_wNearPl" : "h_wNearPm") : (d < 0 ? "h_wNearMl" : "h_wNearMm"), { b: w.b, d: Math.abs(d), rb: w.ref });
      }
      return { row: rowEls[i], ans: w.ans, hint: hint };
    });
    api.prompt(t("p_a100Easy"));
    var locked = false;
    rowEls.forEach(function (el, i) {
      el.addEventListener("click", function () {
        if (locked || !el.classList.contains("tappable")) return;
        MM.audio.unlock(); locked = true;
        if (i !== round.easyIdx) {
          el.classList.add("wrong");
          api.submit(false, { hint: t("h_wEasyTap") });
          setTimeout(function () { el.classList.remove("wrong"); locked = false; }, 1100);
          return;
        }
        el.querySelector(".mark").textContent = "⭐";
        rowEls.forEach(function (x) { x.classList.remove("tappable"); });
        MM.audio.sfx("sparkle"); ui.sparkle(6);
        api.prompt(t("p_a100EasyGo"), true);
        solve(pack, holder, api, items);
      });
    });
  }

  function renderWeg(mount, round, api) {
    var P = round.op === "+";
    var ta = Math.floor(round.a / 10), oa = round.a % 10, tb = Math.floor(round.b / 10), ob = round.b % 10;
    api.prompt(t("p_wWeg", { a: round.a, op: t(P ? "plusWord" : "minusWord"), b: round.b }));
    mount.appendChild(ui.equation([round.a, round.op, round.b, "=", "?"]));
    var grid = ui.el("div", { class: "way-grid" }); mount.appendChild(grid);
    waysFor(round, api.level).forEach(function (id) {
      var w = WAYS[id];
      var card = ui.el("button", { class: "way-card", "data-way": id }, [
        ui.el("span", { class: "we" }, [w.e]), ui.el("span", { class: "wn" }, [t(w.n)]), ui.el("span", { class: "ws" }, [t(w.s)])
      ]);
      card.addEventListener("click", function () { MM.audio.unlock(); MM.audio.sfx("tap"); choose(id); });
      grid.appendChild(card);
    });
    function choose(id) {
      var st = steps(round, id);
      round.way = id; round.topic = "w_" + id;                       // für den Elternbericht: welcher Weg, wie oft richtig
      round.answers = st.map(function (s) { return s.ans; });
      ui.clear(mount);
      mount.appendChild(ui.el("div", { class: "waytag" }, [WAYS[id].e + " " + t(WAYS[id].n)]));
      mount.appendChild(ui.equation([round.a, round.op, round.b], true));
      var R = (tb + 1) * 10;     // kurze Merkzeile: worum es bei diesem Weg geht
      if (id === "rund") mount.appendChild(ui.el("div", { class: "waynote" }, [t("w_rundNote", { b: round.b, R: R })]));
      if (id === "tausch") mount.appendChild(ui.el("div", { class: "waynote" }, [t("w_tauschNote", { b: round.b, R: R, s: "+", d: R - round.b })]));
      if (id === "bild") {
        mount.appendChild(P ? picture(ta + tb, rep(oa, "a").concat(rep(ob, "b")), { tensB: tb }) : picture(ta, rep(oa, "a")));
      }
      var pack = ui.el("div", { class: "pack" }); mount.appendChild(pack);
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      api.prompt(t("p_wGo"), true);
      solve(pack, holder, api, st);
    }
  }

  function render(mount, round, api) {
    if (round.kind === "zehner") return renderZehner(mount, round, api);
    if (round.kind === "tripel") return renderTripel(mount, round, api);
    if (round.kind === "leicht") return renderLeicht(mount, round, api);
    return renderWeg(mount, round, api);
  }

  function game(id, op, emoji) {
    return {
      id: id, nameKey: "g_" + id, subKey: "g_" + id + "_sub", emoji: emoji, gem: "🧮", rounds: PLAN.length,
      makeRound: function (level, idx) { return make(op, level, idx); },
      render: render
    };
  }

  MM.games.wegeplus = game("wegeplus", "+", "🛤️");
  MM.games.wegeminus = game("wegeminus", "−", "🐭");
  MM.wege = { PLAN: PLAN, WAYS: WAYS, waysFor: waysFor, steps: steps };
})();
