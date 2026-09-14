/* ===== Gioco 17: Verdoppeln & Halbieren — das Doppelte und die Hälfte =====
   Tastierino. Il "raddoppio" è la prima strategia di calcolo mentale che sblocca i vicini
   (7+8 = 7+7+1); la "metà" prepara la divisione. Livello 1 con lo specchio (visivo), poi a memoria. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  // due gruppi uguali, uno "riflesso" nello specchio
  function mirror(n, emoji) {
    var box = ui.el("div", { class: "mirror" });
    box.appendChild(ui.gems(n, emoji, true));
    box.appendChild(ui.el("div", { class: "glass" }));
    box.appendChild(ui.gems(n, emoji, true));
    return box;
  }

  MM.games.double = {
    id: "double", nameKey: "g_double", subKey: "g_double_sub", emoji: "🪞", gem: "🪞", rounds: 6,

    // 1: Doppeltes bis 10 (mit Spiegel) · 2: Doppeltes bis 20 · 3: Hälfte bis 20
    // 4: Doppeltes von ZE (12+12, 27+27) · 5: Hälfte bis 100 (auch 30 → 15), gemischt
    makeRound: function (level) {
      var n;
      if (level === 1) { n = ui.randInt(2, 5); return { mode: "double", n: n, ans: 2 * n, pic: true, hint: t("h_double", { n: n }) }; }
      if (level === 2) { n = ui.randInt(6, 10); return { mode: "double", n: n, ans: 2 * n, hint: t("h_double", { n: n }) }; }
      if (level === 3) { n = 2 * ui.randInt(1, 10); return { mode: "half", n: n, ans: n / 2, hint: t("h_half", { n: n }) }; }
      if (level === 4 || (level === 5 && Math.random() < 0.4)) {
        n = ui.randInt(11, 49);
        return { mode: "double", n: n, ans: 2 * n, hint: t("h_doubleZE") };
      }
      n = 2 * ui.randInt(10, 50);   // 20 … 100, auch ungerade Zehner (30, 50, 70, 90)
      return { mode: "half", n: n, ans: n / 2, hint: t("h_halfZE") };
    },

    render: function (mount, round, api) {
      if (round.mode === "double") {
        api.prompt(t("p_double", { n: round.n }));
        if (round.pic) mount.appendChild(mirror(round.n, api.gem === "🪞" ? "🍓" : api.gem));
        mount.appendChild(ui.equation([round.n, "+", round.n, "=", "?"]));
      } else {
        api.prompt(t("p_half", { n: round.n }));
        mount.appendChild(ui.equation(["?", "+", "?", "=", round.n]));
      }
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: !round.pic, hint: round.hint }); });
    }
  };
})();
