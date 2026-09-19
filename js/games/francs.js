/* ===== Gioco 23: Franken-Rätsel — Verdoppeln & Halbieren in Tabellen und Rechengeschichten =====
   Dal quaderno p. 28-29 ("Doubling and Halving", 19/09/2026): tabelle (10 20 30 40 → das Doppelte;
   10 11 12 13 → 20 22 24 26; 20 40 60 80 → die Hälfte; 20 22 24 26 → 10 11 12 13) e le storie con i
   franchi ("Lia hat 25 Franken. Zora hat doppelt so viel." · "Till hat 30 Franken. Anja hat halb so viel.").
   Tastierino. Le storie vengono lette a voce: capire il testo e trovare l'operazione è parte del gioco. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var COLS = 4;
  var NAMES = ["Lia", "Zora", "Till", "Anja", "Joy", "Mia", "Noah", "Leon", "Emma", "Ben", "Lena", "Luca"];

  function pick(list) { return list[ui.randInt(0, list.length - 1)]; }
  function seq(start, step, n) { var out = []; for (var i = 0; i < n; i++) out.push(start + step * i); return out; }

  /* ---- Tabellen: oben die Zahl, unten das Doppelte / die Hälfte ---- */
  function table(mode, tops, step) {
    var answers = tops.map(function (n) { return mode === "double" ? 2 * n : n / 2; });
    return { kind: "table", mode: mode, tops: tops, step: step, answers: answers, ans: answers[0] };
  }
  function doubleTens() {          // 10 20 30 40 → 20 40 60 80 · 5 10 15 20 → 10 20 30 40
    var step = pick([10, 10, 5]);
    return table("double", seq(step === 5 ? pick([5, 10, 15]) : ui.randInt(1, 2) * 10, step, COLS), step);
  }
  function doubleOnes() {          // 10 11 12 13 → 20 22 24 26 · 21 22 23 24 → 42 44 46 48 (ohne Übertrag)
    return table("double", seq(ui.randInt(1, 4) * 10 + ui.randInt(0, 1), 1, COLS), 1);
  }
  function halfTens() {            // 20 40 60 80 → 10 20 30 40 · 10 20 30 40 → 5 10 15 20
    var step = pick([20, 10]);
    return table("half", seq(step === 20 ? pick([20, 40]) : ui.randInt(1, 3) * 10, step, COLS), step);
  }
  function halfOnes() {            // 20 22 24 26 → 10 11 12 13 · 82 84 86 88 → 41 42 43 44 (gerade Zehner, gerade Einer)
    return table("half", seq(ui.randInt(1, 4) * 20 + pick([0, 2]), 2, COLS), 2);
  }

  /* ---- Rechengeschichten mit Franken ---- */
  var DOUBLE_EASY = [5, 10, 15, 20, 25, 30, 40, 50], DOUBLE_MORE = [12, 13, 21, 23, 24, 31, 32, 35, 44, 45, 11, 14, 22, 33];
  var HALF_EASY = [10, 20, 30, 40, 50, 60, 80, 100], HALF_MORE = [22, 24, 26, 42, 44, 46, 62, 64, 66, 82, 84, 88, 70, 90];
  function twoNames() { var s = ui.shuffle(NAMES); return { A: s[0], B: s[1] }; }

  function story(form, level) {
    var v = twoNames(), n, ans, key;
    if (form === "double") {              // A hat n. B hat doppelt so viel. B?
      n = level >= 5 ? ui.randInt(6, 49) : level >= 4 ? pick(DOUBLE_EASY.concat(DOUBLE_MORE)) : pick(DOUBLE_EASY);
      ans = 2 * n; key = "fDouble";
    } else if (form === "half") {         // A hat n. B hat halb so viel. B?
      n = level >= 5 ? 2 * ui.randInt(3, 50) : level >= 4 ? pick(HALF_EASY.concat(HALF_MORE)) : pick(HALF_EASY);
      ans = n / 2; key = "fHalf";
    } else if (form === "together") {     // A hat n. B hat doppelt so viel. Beide zusammen?
      n = pick([5, 10, 15, 20, 25, 30, 11, 12, 13, 21, 22, 23, 32, 33]); ans = 3 * n; key = "fTogether";
    } else if (form === "reverse") {      // B hat doppelt so viel wie A. B hat m. A?
      n = 2 * ui.randInt(3, 49); ans = n / 2; key = "fReverse";
    } else {                              // A hat n. B hat halb so viel. Beide zusammen?
      n = pick([10, 20, 30, 40, 50, 60, 24, 26, 42, 44, 46, 62]); ans = n + n / 2; key = "fHalfTogether";
    }
    v.n = n; v.m = n;
    return { kind: "story", form: form, n: n, ans: ans, text: t("p_" + key, v), hint: t("h_" + key, v) };
  }

  // suggerimento per una cella della tabella: metodo (prima cella) o relazione con la cella a sinistra
  function tableHint(r, k) {
    var n = r.tops[k];
    if (k > 0) return t(r.mode === "double" ? "h_tDoublePat" : "h_tHalfPat", { d: r.step, dd: 2 * r.step, dh: r.step / 2 });
    if (r.mode === "double") return t("h_tDouble", { n: n });
    return t((n / 10) % 2 === 1 ? "h_tHalfOdd" : "h_tHalf", { n: n });
  }

  MM.games.francs = {
    id: "francs", nameKey: "g_francs", subKey: "g_francs_sub", emoji: "💰", gem: "🪙", rounds: 4,

    // 1: Tabelle Verdoppeln · 2: Tabelle Halbieren · 3: Geschichten (doppelt / halb, wie im Heft)
    // 4: Geschichten mit mehr Zahlen + Tabellen · 5: schwerer: zusammen, andersrum, beliebige Zahlen
    makeRound: function (level) {
      var r = Math.random();
      if (level === 1) return r < 0.5 ? doubleTens() : doubleOnes();
      if (level === 2) return r < 0.5 ? halfTens() : halfOnes();
      if (level === 3) return story(r < 0.5 ? "double" : "half", level);
      if (level === 4) return r < 0.3 ? pick([doubleTens, doubleOnes, halfTens, halfOnes])() : story(r < 0.65 ? "double" : "half", level);
      return story(r < 0.25 ? "together" : r < 0.5 ? "reverse" : r < 0.7 ? "halfTogether" : r < 0.85 ? "double" : "half", level);
    },

    render: function (mount, round, api) {
      var holder = ui.el("div", { class: "holder" });

      if (round.kind === "story") {
        api.prompt(round.text);
        mount.appendChild(ui.el("div", { class: "story" }, ["💰"]));
        var again = ui.el("button", { class: "btn btn-ghost" }, [t("listen")]);
        again.addEventListener("click", function () { MM.audio.unlock(); MM.audio.speak(round.text); });
        mount.appendChild(again);
        mount.appendChild(holder);
        ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: true, hint: round.hint }); });
        return;
      }

      // Tabelle: la riga sotto si riempie da sinistra a destra
      api.prompt(t(round.mode === "double" ? "p_tDouble" : "p_tHalf"));
      var grid = ui.el("div", { class: "dtable" }), cells = [];
      grid.appendChild(ui.el("div", { class: "dhead" }, [t("tblNumber")]));
      round.tops.forEach(function (n) { grid.appendChild(ui.el("div", { class: "dcell top" }, [String(n)])); });
      grid.appendChild(ui.el("div", { class: "dhead" }, [t(round.mode === "double" ? "tblDouble" : "tblHalf")]));
      round.tops.forEach(function (_, i) { cells[i] = ui.el("div", { class: "dcell q" }, ["?"]); grid.appendChild(cells[i]); });
      mount.appendChild(grid);
      mount.appendChild(holder);

      var k = 0;
      cells[0].classList.add("active");
      var np = ui.numpad({ maxLen: 3, onSubmit: function (v) {
        var ok = (v === round.answers[k]);
        np.mark(ok);
        if (!ok) { api.submit(false, { hint: tableHint(round, k) }); setTimeout(np.reset, 1100); return; }
        cells[k].textContent = String(v);
        cells[k].classList.remove("active"); cells[k].classList.add("ok");
        k++;
        if (k >= round.answers.length) return api.submit(true, { recall: true });
        MM.audio.sfx("sparkle"); ui.sparkle(5);
        setTimeout(function () { np.reset(); cells[k].classList.add("active"); }, 350);
      } });
      holder.appendChild(np.el);
    }
  };
})();
