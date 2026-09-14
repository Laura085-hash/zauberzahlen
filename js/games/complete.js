/* ===== Gioco 16: Ergänzen — bis zum Zehner, bis 100, ? + b = c, 100 − ? = c =====
   Tastierino. È la versione "fino a 100" delle Zehnerfreunde: 34 + ? = 40, 63 + ? = 100. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  function toTen() {        // 34 + ? = 40
    var ta = ui.randInt(1, 9), oa = ui.randInt(1, 9), a = ta * 10 + oa, c = (ta + 1) * 10;
    return { kind: "ten", a: a, c: c, ans: c - a, prompt: t("p_complete", { a: a, c: c }), hint: t("h_cTen", { a: a, c: c }), parts: [a, "+", "?", "=", c] };
  }
  function tensToHundred() { // 60 + ? = 100
    var a = ui.randInt(1, 9) * 10;
    return { kind: "hundred", a: a, c: 100, ans: 100 - a, prompt: t("p_complete", { a: a, c: 100 }), hint: t("h_cHundred", { a: a }), parts: [a, "+", "?", "=", 100] };
  }
  function mixedToHundred() { // 63 + ? = 100
    var a = ui.randInt(1, 9) * 10 + ui.randInt(1, 9);
    return { kind: "mixed", a: a, c: 100, ans: 100 - a, prompt: t("p_complete", { a: a, c: 100 }), hint: t("h_cMixed", { c: 100 }), parts: [a, "+", "?", "=", 100] };
  }
  function reverse() {       // ? + 25 = 60
    var c = ui.randInt(2, 10) * 10, b = ui.randInt(1, c - 1);
    return { kind: "rev", b: b, c: c, ans: c - b, prompt: t("p_completeRev", { b: b, c: c }), hint: t("h_cRev", { b: b, c: c }), parts: ["?", "+", b, "=", c] };
  }
  function fromHundred() {   // 100 − ? = 37
    var c = ui.randInt(1, 99);
    return { kind: "minus", c: c, ans: 100 - c, prompt: t("p_completeMinus", { c: c }), hint: t("h_cMinus", { c: c }), parts: [100, "−", "?", "=", c] };
  }

  MM.games.complete = {
    id: "complete", nameKey: "g_complete", subKey: "g_complete_sub", emoji: "🎯", gem: "🎯", rounds: 6,

    // 1: bis zum nächsten Zehner · 2: Zehner bis 100 · 3: ZE bis 100 · 4: ? + b = c (gemischt) · 5: 100 − ? = c (gemischt)
    makeRound: function (level) {
      if (level === 1) return toTen();
      if (level === 2) return tensToHundred();
      if (level === 3) return mixedToHundred();
      if (level === 4) return Math.random() < 0.5 ? reverse() : mixedToHundred();
      var r = Math.random();
      return r < 0.4 ? fromHundred() : r < 0.7 ? reverse() : mixedToHundred();
    },

    render: function (mount, round, api) {
      api.prompt(round.prompt);
      mount.appendChild(ui.equation(round.parts));
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: true, hint: round.hint }); });
    }
  };
})();
