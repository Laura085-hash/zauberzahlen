/* ===== Gioco 14: Plus bis 100 — ZE + E, ZE + Z, Zehnerübergang, ZE + ZE =====
   Più difficile: niente scelte, il risultato lo scrive lei sul tastierino.
   Metodo: "erst Zehner, dann Einer" e "den Zehner voll machen" (come making-10, ma fino a 100). */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  MM.games.plus100 = {
    id: "plus100", nameKey: "g_plus100", subKey: "g_plus100_sub", emoji: "➕", gem: "🚀", rounds: 6,

    // 1: ZE + E ohne Übergang (34+5) · 2: ZE + Z (34+20) · 3: ZE + E mit Übergang (38+5)
    // 4: ZE + ZE ohne Übergang (34+25) · 5: ZE + ZE mit Übergang (38+27), gemischt
    makeRound: function (level) {
      var ta, oa, tb, ob, a, b;
      if (level === 1) {
        ta = ui.randInt(1, 8); oa = ui.randInt(1, 8); b = ui.randInt(1, 9 - oa); a = ta * 10 + oa;
        return { kind: "ones", a: a, b: b, ans: a + b, hint: t("h_pOnes", { o: oa, b: b }) };
      }
      if (level === 2) {
        ta = ui.randInt(1, 7); oa = ui.randInt(1, 9); tb = ui.randInt(1, 9 - ta); a = ta * 10 + oa; b = tb * 10;
        return { kind: "tens", a: a, b: b, ans: a + b, hint: t("h_pTens", { a: a }) };
      }
      if (level === 3 || (level === 5 && Math.random() < 0.3)) {
        ta = ui.randInt(1, 8); oa = ui.randInt(2, 9); b = ui.randInt(11 - oa, 9); a = ta * 10 + oa;
        return { kind: "cross", a: a, b: b, ans: a + b, hint: t("h_pCross", { a: a, ten: (ta + 1) * 10 }) };
      }
      if (level === 4) {
        ta = ui.randInt(1, 7); oa = ui.randInt(1, 8); tb = ui.randInt(1, 9 - ta); ob = ui.randInt(1, 9 - oa);
        a = ta * 10 + oa; b = tb * 10 + ob;
        return { kind: "ze", a: a, b: b, ans: a + b, hint: t("h_pZE") };
      }
      // 5: ZE + ZE mit Zehnerübergang, Summe ≤ 100
      ta = ui.randInt(1, 7); oa = ui.randInt(2, 9); ob = ui.randInt(11 - oa, 9); tb = ui.randInt(1, 8 - ta);
      a = ta * 10 + oa; b = tb * 10 + ob;
      return { kind: "zecross", a: a, b: b, ans: a + b, hint: t("h_pZEcross") };
    },

    render: function (mount, round, api) {
      api.prompt(t("p_calc", { a: round.a, op: t("plusWord"), b: round.b }));
      mount.appendChild(ui.equation([round.a, "+", round.b, "=", "?"]));
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: true, hint: round.hint }); });
    }
  };
})();
