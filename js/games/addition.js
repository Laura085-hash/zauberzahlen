/* ===== Gioco 4: Plus-Zauber — addizione, supporto visivo che sfuma ===== */
(function () {
  var ui = MM.ui;

  MM.games.addition = {
    id: "addition",
    nameKey: "g_addition",
    subKey: "g_addition_sub",
    emoji: "🌟",
    gem: "🌟",
    rounds: 6,

    // 1:≤10 gemme · 2:≤10 memoria · 3:≤20 gemme · 4:≤20 memoria · 5:scavalca il 10 (memoria)
    makeRound: function (level) {
      if (level === 5) {
        var x = ui.randInt(2, 9), y = ui.randInt(2, 9), g5 = 0;
        while (x + y <= 10 && g5++ < 60) { x = ui.randInt(2, 9); y = ui.randInt(2, 9); }
        if (x + y <= 10) { x = 6; y = 7; }
        return { a: x, b: y, sum: x + y, max: 20, showGems: false };
      }
      var max = level <= 2 ? 10 : 20;
      var showGems = (level === 1 || level === 3);
      var a, b, guard = 0;
      do {
        a = ui.randInt(1, max - 1);
        b = ui.randInt(1, max - 1);
      } while (a + b > max && guard++ < 200);
      if (a + b > max) { a = 1; b = 1; }
      return { a: a, b: b, sum: a + b, max: max, showGems: showGems };
    },

    render: function (mount, round, api) {
      api.prompt(MM.i18n.t("p_plus"));

      if (round.showGems) {
        var row = ui.el("div", {});
        row.style.display = "flex"; row.style.alignItems = "center"; row.style.gap = "10px"; row.style.flexWrap = "wrap";
        row.style.justifyContent = "center";
        row.appendChild(ui.gems(round.a, api.gem, true));
        row.appendChild(ui.el("div", { class: "equation" }, [ui.el("span", {}, ["+"])]));
        row.appendChild(ui.gems(round.b, api.gem, true));
        mount.appendChild(row);
      }

      var eq = ui.el("div", { class: "equation" }, [
        ui.el("span", {}, [String(round.a)]),
        ui.el("span", {}, ["+"]),
        ui.el("span", {}, [String(round.b)]),
        ui.el("span", {}, ["="]),
        ui.el("span", { class: "q" }, ["?"])
      ]);
      mount.appendChild(eq);

      var vals = ui.answerChoices(round.sum, 3, 0, round.max);
      mount.appendChild(ui.choices(vals, round.sum, function (ok) {
        api.submit(ok, { recall: !round.showGems, correctText: round.sum });
      }));
    }
  };
})();
