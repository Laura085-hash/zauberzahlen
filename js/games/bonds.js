/* ===== Gioco 3: Zahlen zerlegen — scomposizione & "fai 10" ===== */
(function () {
  var ui = MM.ui;

  function basket(label, gemsNode) {
    var b = ui.el("div", { class: "" });
    b.style.display = "flex"; b.style.flexDirection = "column"; b.style.alignItems = "center"; b.style.gap = "6px";
    b.appendChild(gemsNode);
    b.appendChild(ui.el("div", { class: "tower" }, [])); // placeholder spacing
    var cap = ui.el("div", {}, [label]);
    cap.style.fontWeight = "800"; cap.style.color = "#fff"; cap.style.fontSize = "1.6rem";
    b.appendChild(cap);
    return b;
  }

  MM.games.bonds = {
    id: "bonds",
    nameKey: "g_bonds",
    subKey: "g_bonds_sub",
    emoji: "🍓",
    gem: "🍓",
    rounds: 6,

    // level 1: scomponi n (5-9) con gemme visibili · 2: fai 10 · 3: scomponi 10 a memoria
    makeRound: function (level) {
      if (level === 1) {
        var n = ui.randInt(5, 9);
        var a = ui.randInt(1, n - 1);
        return { mode: "split", n: n, a: a, b: n - a, showGems: true };
      }
      if (level === 2) {
        var a2 = ui.randInt(1, 9);
        return { mode: "ten", n: 10, a: a2, b: 10 - a2, showGems: true };
      }
      var a3 = ui.randInt(1, 9);
      return { mode: "split", n: 10, a: a3, b: 10 - a3, showGems: false };
    },

    render: function (mount, round, api) {
      var promptKey = round.mode === "ten" ? "p_makeTen" : "p_split";
      api.prompt(MM.i18n.t(promptKey, { n: round.n, a: round.a }));

      if (round.showGems) {
        var row = ui.el("div", {});
        row.style.display = "flex"; row.style.alignItems = "flex-end"; row.style.gap = "24px";
        row.appendChild(basket(String(round.a), ui.gems(round.a, api.gem, true)));
        var qGems = ui.el("div", { class: "gems" }, [ui.el("span", { class: "gem" }, ["❓"])]);
        row.appendChild(basket("?", qGems));
        mount.appendChild(row);
      }

      var vals = ui.answerChoices(round.b, 3, 0, round.n);
      mount.appendChild(ui.choices(vals, round.b, function (ok) {
        api.submit(ok, { recall: !round.showGems || round.mode === "ten", correctText: round.b });
      }));
    }
  };
})();
