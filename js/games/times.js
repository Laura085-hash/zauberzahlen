/* ===== Gioco 18: Mal-Zauber — Gruppen zählen, 2er/5er/10er, dann 3er/4er =====
   Primo passo nell'Einmaleins (2ª classe): "3 mal 2" = 3 Gruppen mit 2, zählen in 2er-Schritten.
   Tastierino. Con le figure quando la tabellina è nuova, poi a memoria. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var ICONS = ["🍓", "⭐", "🦋", "🍄", "🌸", "🍬"];

  function groups(a, b) {
    var box = ui.el("div", { class: "groups" });
    var emo = ICONS[ui.randInt(0, ICONS.length - 1)];
    for (var i = 0; i < a; i++) {
      var g = ui.el("div", { class: "group" });
      g.style.gridTemplateColumns = "repeat(" + Math.min(b, 5) + ", auto)";   // righe da 5: Kraft der 5
      for (var j = 0; j < b; j++) g.appendChild(ui.el("span", {}, [emo]));
      box.appendChild(g);
    }
    return box;
  }

  function pickB(list) { return list[ui.randInt(0, list.length - 1)]; }

  MM.games.times = {
    id: "times", nameKey: "g_times", subKey: "g_times_sub", emoji: "✖️", gem: "🍓", rounds: 6,

    // 1: 2er/5er/10er mit Bild · 2: 2er + 10er · 3: 5er · 4: 2er/5er/10er gemischt · 5: 3er + 4er (mit Bild)
    makeRound: function (level) {
      var a, b, pic = false;
      if (level === 1) { b = pickB([2, 5, 10]); a = ui.randInt(2, 5); pic = true; }
      else if (level === 2) { b = pickB([2, 10]); a = ui.randInt(1, 10); }
      else if (level === 3) { b = 5; a = ui.randInt(1, 10); }
      else if (level === 4) { b = pickB([2, 5, 10]); a = ui.randInt(1, 10); }
      else { b = pickB([3, 4]); a = ui.randInt(2, 6); pic = true; }
      return { a: a, b: b, ans: a * b, pic: pic,
               hint: t(pic ? "h_timesPic" : "h_times", { a: a, b: b, b2: 2 * b }) };
    },

    render: function (mount, round, api) {
      api.prompt(t(round.pic ? "p_timesGroups" : "p_calc", { a: round.a, op: t("timesWord"), b: round.b }));
      if (round.pic) mount.appendChild(groups(round.a, round.b));
      mount.appendChild(ui.equation([round.a, MM.i18n.lang === "de" ? "·" : "×", round.b, "=", "?"]));
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      ui.askNumber(holder, round.ans, function (ok) { api.submit(ok, { recall: !round.pic, hint: round.hint }); });
    }
  };
})();
