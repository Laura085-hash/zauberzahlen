/* ===== Gioco 15: Minus bis 100 — ZE − E, ZE − Z, Zehnerübergang, ZE − ZE =====
   Tastierino, niente scelte. Metodo: "erst die Zehner, dann die Einer" e "bis zum Zehner zurück". */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  MM.games.minus100 = {
    id: "minus100", nameKey: "g_minus100", subKey: "g_minus100_sub", emoji: "➖", gem: "🛸", rounds: 6,

    // 1: ZE − E ohne Übergang (37−4) · 2: ZE − Z (57−20) · 3: ZE − E mit Übergang (43−5)
    // 4: ZE − ZE ohne Übergang (57−23) · 5: ZE − ZE mit Übergang (52−27), gemischt
    makeRound: function (level) {
      var ta, oa, tb, ob, a, b;
      if (level === 1) {
        ta = ui.randInt(1, 9); oa = ui.randInt(2, 9); b = ui.randInt(1, oa - 1); a = ta * 10 + oa;
        return { kind: "ones", a: a, b: b, ans: a - b, hint: t("h_mOnes", { o: oa, b: b }) };
      }
      if (level === 2) {
        ta = ui.randInt(2, 9); oa = ui.randInt(1, 9); tb = ui.randInt(1, ta); a = ta * 10 + oa; b = tb * 10;
        return { kind: "tens", a: a, b: b, ans: a - b, hint: t("h_mTens", { a: a }) };
      }
      if (level === 3 || (level === 5 && Math.random() < 0.3)) {
        ta = ui.randInt(1, 9); oa = ui.randInt(1, 8); b = ui.randInt(oa + 1, 9); a = ta * 10 + oa;
        return { kind: "cross", a: a, b: b, ans: a - b, hint: t("h_mCross", { a: a, ten: ta * 10 }) };
      }
      if (level === 4) {
        ta = ui.randInt(2, 9); oa = ui.randInt(2, 9); tb = ui.randInt(1, ta - 1); ob = ui.randInt(1, oa - 1);
        a = ta * 10 + oa; b = tb * 10 + ob;
        return { kind: "ze", a: a, b: b, ans: a - b, hint: t("h_mZE") };
      }
      // 5: ZE − ZE mit Zehnerübergang (Einer reichen nicht)
      ta = ui.randInt(2, 9); oa = ui.randInt(1, 8); tb = ui.randInt(1, ta - 1); ob = ui.randInt(oa + 1, 9);
      a = ta * 10 + oa; b = tb * 10 + ob;
      return { kind: "zecross", a: a, b: b, ans: a - b, hint: t("h_mZEcross") };
    },

    render: function (mount, round, api) {
      api.prompt(t("p_calc", { a: round.a, op: t("minusWord"), b: round.b }));
      mount.appendChild(ui.equation([round.a, "−", round.b, "=", "?"]));
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: true, hint: round.hint }); });
    }
  };
})();
