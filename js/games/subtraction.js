/* ===== Gioco 5: Minus-Zauber — sottrazione: togliere · differenza · inverso ===== */
(function () {
  var ui = MM.ui;

  function tower(height, emoji, label) {
    var t = ui.el("div", { class: "tower" });
    for (var i = 0; i < height; i++) t.appendChild(ui.el("span", { class: "gem" }, [emoji]));
    t.appendChild(ui.el("div", { class: "cap" }, [label]));
    return t;
  }

  MM.games.subtraction = {
    id: "subtraction",
    nameKey: "g_subtraction",
    subKey: "g_subtraction_sub",
    emoji: "🍬",
    gem: "🍬",
    rounds: 6,

    // 1: togliere ≤10 (visivo) · 2: differenza ≤10 (visivo) · 3: inverso ≤10 · 4: togliere ≤20 a memoria
    makeRound: function (level) {
      if (level === 1) {
        var a = ui.randInt(3, 10), b = ui.randInt(1, a - 1);
        return { mode: "takeaway", a: a, b: b, ans: a - b, max: 10, showGems: true };
      }
      if (level === 2) {
        var x = ui.randInt(4, 10), y = ui.randInt(1, x - 1);
        return { mode: "difference", x: x, y: y, ans: x - y, max: 10, showGems: true };
      }
      if (level === 3) {
        var n = ui.randInt(5, 10), p = ui.randInt(1, n - 1);
        return { mode: "inverse", n: n, a: p, ans: n - p, max: 10, showGems: true };
      }
      var a4 = ui.randInt(5, 20), b4 = ui.randInt(1, a4 - 1);
      return { mode: "takeaway", a: a4, b: b4, ans: a4 - b4, max: 20, showGems: false };
    },

    render: function (mount, round, api) {
      var ui2 = ui;

      if (round.mode === "takeaway") {
        api.prompt(MM.i18n.t("p_takeAway"));
        var eqLine = ui2.el("div", { class: "equation" }, [
          ui2.el("span", {}, [String(round.a)]),
          ui2.el("span", {}, ["−"]),
          ui2.el("span", {}, [String(round.b)])
        ]);
        mount.appendChild(eqLine);

        function choicesNow() {
          var vals = ui2.answerChoices(round.ans, 3, 0, round.max);
          mount.appendChild(ui2.choices(vals, round.ans, function (ok) {
            api.submit(ok, { recall: !round.showGems, correctText: round.ans });
          }));
        }

        if (round.showGems) {
          var box = ui2.gems(round.a, api.gem, true);
          mount.appendChild(box);
          // dopo un attimo, le ultime b gemme "spariscono" in una nuvoletta
          setTimeout(function () {
            var gemEls = box.querySelectorAll(".gem");
            for (var i = 0; i < round.b; i++) {
              var g = gemEls[gemEls.length - 1 - i];
              if (g) g.classList.add("leave");
            }
            MM.audio.sfx("sparkle");
            setTimeout(choicesNow, 550);
          }, 900);
        } else {
          choicesNow();
        }

      } else if (round.mode === "difference") {
        api.prompt(MM.i18n.t("p_difference"));
        var towers = ui2.el("div", { class: "towers" }, [
          tower(round.x, api.gem, String(round.x)),
          tower(round.y, "⬜", String(round.y))
        ]);
        mount.appendChild(towers);
        var vals2 = ui2.answerChoices(round.ans, 3, 0, round.max);
        mount.appendChild(ui2.choices(vals2, round.ans, function (ok) {
          api.submit(ok, { recall: false, correctText: round.ans });
        }));

      } else { // inverse:  a + ? = n
        api.prompt(MM.i18n.t("p_inverse", { a: round.a, n: round.n }));
        if (round.showGems) {
          var row = ui2.el("div", {});
          row.style.display = "flex"; row.style.alignItems = "center"; row.style.gap = "10px";
          row.appendChild(ui2.gems(round.a, api.gem, true));
          row.appendChild(ui2.el("div", { class: "equation" }, [ui2.el("span", {}, ["+ ?"])]));
          mount.appendChild(row);
        }
        var eq = ui2.el("div", { class: "equation" }, [
          ui2.el("span", {}, [String(round.a)]),
          ui2.el("span", {}, ["+"]),
          ui2.el("span", { class: "q" }, ["?"]),
          ui2.el("span", {}, ["="]),
          ui2.el("span", {}, [String(round.n)])
        ]);
        mount.appendChild(eq);
        var vals3 = ui2.answerChoices(round.ans, 3, 0, round.n);
        mount.appendChild(ui2.choices(vals3, round.ans, function (ok) {
          api.submit(ok, { recall: true, correctText: round.ans });
        }));
      }
    }
  };
})();
