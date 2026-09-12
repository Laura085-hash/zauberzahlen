/* ===== Gioco 7: Hundert-Zauber — Zehner + Einer, Zerlegen, Rechnen mit Zehnern wie mit Einern =====
   Dal quaderno: "20 + 9 = 29", "82 = 80 + 2", "6 + 2 = 8 → 60 + 20 = 80", "7 − 4 = 3 → 70 − 40 = 30". */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  function eq(parts, small) {
    var e = ui.el("div", { class: "equation" + (small ? " small" : "") });
    parts.forEach(function (p) {
      e.appendChild(p === "?" ? ui.el("span", { class: "q" }, ["?"]) : ui.el("span", {}, [String(p)]));
    });
    return e;
  }

  function plusPair() { var a = ui.randInt(1, 9), b = ui.randInt(1, 10 - a); return [a, b]; }
  function minusPair() { var x = ui.randInt(2, 10), y = ui.randInt(1, x - 1); return [x, y]; }

  MM.games.hundred = {
    id: "hundred", nameKey: "g_hundred", subKey: "g_hundred_sub", emoji: "💯", gem: "🌟", rounds: 6,

    // 1: 20 + 9 = ? (mit Bild) · 2: 82 = 80 + ? / ? + 2 · 3: 6+2=8 → 60+20=? · 4: 7−4=3 → 70−40=? · 5: gemischt ohne Hilfe, bis 100
    makeRound: function (level) {
      var tn, on, n;
      if (level === 1) {
        tn = ui.randInt(1, 9); on = ui.randInt(1, 9); n = tn * 10 + on;
        return { mode: "compose", t: tn, o: on, ans: n, cands: [tn + on, on * 10 + tn, n + 10, n - 10, n + 1], showBars: true };
      }
      if (level === 2) {
        tn = ui.randInt(1, 9); on = ui.randInt(1, 9); n = tn * 10 + on;
        if (Math.random() < 0.5) return { mode: "decompose", n: n, side: "o", known: tn * 10, ans: on, cands: [tn, on * 10, on + 1, on - 1, n] };
        return { mode: "decompose", n: n, side: "t", known: on, ans: tn * 10, cands: [tn, n, tn * 10 + 10, tn * 10 - 10, on * 10] };
      }
      var p, op;
      if (level === 3) { p = plusPair(); op = "+"; }
      else if (level === 4) { p = minusPair(); op = "−"; }
      else if (Math.random() < 0.5) { p = plusPair(); op = "+"; }
      else { p = minusPair(); op = "−"; }
      var r = op === "+" ? p[0] + p[1] : p[0] - p[1];
      return { mode: "tens", op: op, a: p[0], b: p[1], r: r, ans: r * 10, hint: level < 5,
               cands: [r, r * 10 + 10, r * 10 - 10, p[0] * 10 + p[1], (op === "+" ? p[0] - p[1] : p[0] + p[1]) * 10] };
    },

    render: function (mount, round, api) {
      var holder = ui.el("div", { class: "holder" });
      var hint;
      if (round.mode === "compose") {
        api.prompt(t("p_compose"));
        if (round.showBars) mount.appendChild(ui.tensBars(round.t, round.o));
        mount.appendChild(eq([round.t * 10, "+", round.o, "=", "?"]));
        hint = t("h_compose");
      } else if (round.mode === "decompose") {
        api.prompt(t("p_decompose"));
        mount.appendChild(round.side === "o" ? eq([round.n, "=", round.known, "+", "?"]) : eq([round.n, "=", "?", "+", round.known]));
        hint = t("h_decompose");
      } else {
        api.prompt(t("p_tensCalc"));
        if (round.hint) mount.appendChild(eq([round.a, round.op, round.b, "=", round.r], true));
        mount.appendChild(eq([round.a * 10, round.op, round.b * 10, "=", "?"]));
        hint = t("h_tensCalc", { a: round.a, b: round.b });
      }
      mount.appendChild(holder);
      ui.askChoices(holder, round.ans, function () { return ui.choicesFrom(round.ans, round.cands, 3, 0, 100); }, function (ok) {
        api.submit(ok, { recall: round.mode !== "compose", hint: hint });
      });
    }
  };
})();
