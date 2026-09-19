/* ===== Gioco 22: Immer 100 — Päckchen, die immer 100 geben =====
   Dal quaderno p. 26 ("Always 100", 19/09/2026): pacchetti di aufgaben legate tra loro
   (80+20, 60+40, 40+60 … · 93+7, 83+17, 73+27 … · 95+5, 85+15 … · 19+81, 29+71, 39+61, 49+? ← qui Joy
   si è persa) e l'esercizio 5 "rechne zuerst die leichteste" (28, 30, 32 → prima 30+70, poi gli altri
   due a partire da quel risultato). Tastierino; il pacchetto si risolve dall'alto in basso e il
   suggerimento rimanda alla riga sopra: la relazione tra le aufgaben è il punto dell'esercizio. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var ROWS = 4;

  // una riga del pacchetto: "a + ? = 100" (plus) · "? + a = 100" (rev) · "100 − a = ?" (minus); risposta sempre 100 − a
  function row(a, form) {
    form = form || "plus";
    var parts = form === "plus" ? [a, "+", "?", "=", 100] : form === "rev" ? ["?", "+", a, "=", 100] : [100, "−", a, "=", "?"];
    return { a: a, form: form, ans: 100 - a, parts: parts };
  }
  function seq(start, step, n) { var out = []; for (var i = 0; i < n; i++) out.push(start + step * i); return out; }
  function pick(list) { return list[ui.randInt(0, list.length - 1)]; }
  function swap(n) { return (n % 10) * 10 + Math.floor(n / 10); }

  // Zehner-Päckchen: 80, 60, 40, 20 · 10, 30, 50, 70 · 90, 80, 70, 60 (auch 0 + ? = 100)
  function tensPack() {
    var step = pick([10, -10, 20, -20]), span = Math.abs(step) * (ROWS - 1);
    var start = step > 0 ? ui.randInt(0, (90 - span) / 10) * 10 : ui.randInt(span / 10, 9) * 10;
    return { kind: "pack", pattern: true, values: seq(start, step, ROWS) };
  }
  // Einer-Päckchen: 93, 83, 73, 63 · 25, 35, 45, 55 · 19, 29, 39, 49 (die Einer bleiben, die Zehner wandern)
  function onesPack() {
    var o = ui.randInt(1, 9), step = pick([1, -1]);
    var t0 = step > 0 ? ui.randInt(0, 9 - (ROWS - 1)) : ui.randInt(ROWS - 1, 9);
    return { kind: "pack", pattern: true, values: seq(t0 * 10 + o, step * 10, ROWS) };
  }
  // Zwillinge: 11, 22, 33, 44 · 55, 66, 77, 88 (Schritt 11)
  function doublesPack() {
    var d = ui.randInt(1, 9 - (ROWS - 1));
    return { kind: "pack", pattern: true, values: seq(d * 11, 11, ROWS) };
  }
  // Zahlendreher-Paare: 75, 57, 86, 68
  function swapPack() {
    var values = [], used = {};
    while (values.length < ROWS) {
      var a = ui.randInt(12, 98);
      if (a % 10 === 0 || a % 11 === 0 || used[a]) continue;
      used[a] = used[swap(a)] = true;
      values.push(a, swap(a));
    }
    return { kind: "pack", pattern: false, values: values.slice(0, ROWS) };
  }
  // bunt gemischt (auch "? + a = 100" und "100 − a = ?")
  function mixedPack(form) {
    var values = [], used = {};
    while (values.length < ROWS) { var a = ui.randInt(1, 99); if (!used[a]) { used[a] = true; values.push(a); } }
    return { kind: "pack", pattern: false, values: values, form: form };
  }
  // die leichteste zuerst: 28, 30, 32 → erst 30 + 70, dann die Nachbarn
  function easyTriple() {
    var ten = ui.randInt(2, 8) * 10, d = pick([1, 2, 3, 4, 5, 8]);
    var order = ui.shuffle([ten - d, ten, ten + d]);
    return { kind: "easy", ten: ten, d: d, values: order, easyIdx: order.indexOf(ten) };
  }

  function finish(p) {
    p.rows = p.values.map(function (a) { return row(a, p.form); });
    // ordine di risoluzione: dall'alto in basso; nel "leichteste zuerst" prima la leichte, poi le altre
    p.order = p.rows.map(function (_, i) { return i; });
    if (p.kind === "easy") p.order = [p.easyIdx].concat(p.order.filter(function (i) { return i !== p.easyIdx; }));
    p.answers = p.order.map(function (i) { return p.rows[i].ans; });
    p.ans = p.answers[0];
    return p;
  }

  // suggerimento sul METODO, mai il numero: riga sopra → relazione; prima riga → Einer, dann Zehner
  function hintFor(p, k) {
    var i = p.order[k], r = p.rows[i];
    if (p.kind === "easy") {
      if (k === 0) return t("h_a100Tens", { a: r.a });
      var d = r.a - p.ten;
      return t(d < 0 ? "h_a100NearLess" : "h_a100NearMore", { a: r.a, t: p.ten, tb: 100 - p.ten, d: Math.abs(d) });
    }
    if (p.pattern && k > 0) {
      var d2 = r.a - p.rows[i - 1].a;
      return t(d2 > 0 ? "h_a100PackUp" : "h_a100PackDown", { d: Math.abs(d2) });
    }
    if (r.form === "rev") return t("h_a100Rev", { a: r.a });
    if (r.form === "minus") return t("h_a100Minus", { a: r.a });
    return r.a % 10 === 0 ? t("h_a100Tens", { a: r.a }) : t("h_a100Ones", { o: r.a % 10 });
  }

  MM.games.always100 = {
    id: "always100", nameKey: "g_always100", subKey: "g_always100_sub", emoji: "🧩", gem: "🧩", rounds: 4,

    // 1: Zehner-Päckchen · 2: Einer-Päckchen (93, 83, 73 …) · 3: bunte Päckchen (Zwillinge, Zahlendreher, gemischt)
    // 4: die leichteste zuerst (28, 30, 32) · 5: alles gemischt, auch ? + a = 100 und 100 − a = ?
    makeRound: function (level) {
      var r = Math.random();
      if (level === 1) return finish(tensPack());
      if (level === 2) return finish(r < 0.7 ? onesPack() : tensPack());
      if (level === 3) return finish(r < 0.3 ? onesPack() : r < 0.55 ? doublesPack() : r < 0.8 ? swapPack() : mixedPack("plus"));
      if (level === 4) return finish(easyTriple());
      return finish(r < 0.3 ? easyTriple() : r < 0.5 ? mixedPack("rev") : r < 0.7 ? mixedPack("minus")
                    : r < 0.8 ? onesPack() : r < 0.9 ? swapPack() : doublesPack());
    },

    render: function (mount, round, api) {
      var pack = ui.el("div", { class: "pack" }), rowEls = [], qEls = [];
      round.rows.forEach(function (r, i) {
        var easy = round.kind === "easy";
        var el = ui.el(easy ? "button" : "div", { class: "prow" + (easy ? " tappable" : "") });
        if (easy) el.appendChild(ui.el("span", { class: "mark" }, [""]));
        r.parts.forEach(function (p) {
          var c = ui.el("span", { class: "pcell" + (p === "?" ? " q" : "") }, [String(p)]);
          if (p === "?") qEls[i] = c;
          el.appendChild(c);
        });
        rowEls[i] = el; pack.appendChild(el);
      });
      mount.appendChild(pack);
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);

      var k = 0, np = null;
      function solve() {
        var i = round.order[k];
        rowEls.forEach(function (el) { el.classList.remove("active"); });
        rowEls[i].classList.add("active");
        if (np) return;
        np = ui.numpad({ maxLen: 3, onSubmit: function (v) {
          var j = round.order[k], ok = (v === round.rows[j].ans);
          np.mark(ok);
          if (!ok) { api.submit(false, { hint: hintFor(round, k) }); setTimeout(np.reset, 1100); return; }
          qEls[j].textContent = String(v);
          rowEls[j].classList.remove("active"); rowEls[j].classList.add("ok");
          k++;
          if (k >= round.order.length) return api.submit(true, { recall: true });
          MM.audio.sfx("sparkle"); ui.sparkle(5);
          setTimeout(function () { np.reset(); solve(); }, 350);
        } });
        holder.appendChild(np.el);
      }

      if (round.kind !== "easy") { api.prompt(t("p_a100Pack")); solve(); return; }

      // passo 0: tippe die leichteste Aufgabe (der glatte Zehner) — dann rechnen, die leichte zuerst
      api.prompt(t("p_a100Easy"));
      var locked = false;
      rowEls.forEach(function (el, i) {
        el.addEventListener("click", function () {
          if (locked || !el.classList.contains("tappable")) return;
          MM.audio.unlock(); locked = true;
          if (i !== round.easyIdx) {
            el.classList.add("wrong");
            api.submit(false, { hint: t("h_a100Easy") });
            setTimeout(function () { el.classList.remove("wrong"); locked = false; }, 1100);
            return;
          }
          el.querySelector(".mark").textContent = "⭐";
          rowEls.forEach(function (x) { x.classList.remove("tappable"); });
          MM.audio.sfx("sparkle"); ui.sparkle(6);
          api.prompt(t("p_a100EasyGo"), true);
          solve();
        });
      });
    }
  };
})();
