/* ===== Gioco 2: Kraft der 5 — cornice da 5 e da 10 ===== */
(function () {
  var ui = MM.ui;

  function tenFrame(filled, emoji, tappable, onToggle) {
    var frame = ui.el("div", { class: "frame rows2" });
    for (var i = 0; i < 10; i++) {
      var isFilled = i < filled;
      var cell = ui.el("div", { class: "cell" + (isFilled ? " filled" : "") + (tappable ? " tappable" : "") },
        [isFilled ? emoji : ""]);
      if (tappable) {
        (function (cellEl) {
          cellEl.addEventListener("click", function () {
            MM.audio.unlock(); MM.audio.sfx("tap");
            var on = cellEl.classList.toggle("filled");
            cellEl.textContent = on ? emoji : "";
            onToggle();
          });
        })(cell);
      }
      frame.appendChild(cell);
    }
    return frame;
  }

  MM.games.fives = {
    id: "fives",
    nameKey: "g_fives",
    subKey: "g_fives_sub",
    emoji: "🔮",
    gem: "🔮",
    rounds: 6,

    // level 1: leggi 1-5 · 2: leggi 6-10 (5 + extra) · 3: costruisci il numero
    makeRound: function (level) {
      if (level === 1) return { mode: "read", n: ui.randInt(1, 5) };
      if (level === 2) return { mode: "read", n: ui.randInt(6, 10) };
      return { mode: "fill", n: ui.randInt(2, 10) };
    },

    render: function (mount, round, api) {
      if (round.mode === "read") {
        api.prompt(MM.i18n.t("p_whichNumber"));
        mount.appendChild(tenFrame(round.n, api.gem, false));
        var vals = ui.answerChoices(round.n, 3, 1, 10);
        mount.appendChild(ui.choices(vals, round.n, function (ok) {
          api.submit(ok, { recall: true, correctText: round.n });
        }));
      } else {
        api.prompt(MM.i18n.t("p_makeNumber", { n: round.n }));
        var count = 0;
        var frame = tenFrame(0, api.gem, true, function () {
          count = frame.querySelectorAll(".cell.filled").length;
        });
        mount.appendChild(frame);
        var btn = ui.el("button", { class: "btn btn-pink check" }, [MM.i18n.t("check")]);
        btn.addEventListener("click", function () {
          MM.audio.unlock();
          var ok = (count === round.n);
          if (!ok) ui.shake(frame);
          api.submit(ok, { recall: false, correctText: round.n });
        });
        mount.appendChild(btn);
      }
    }
  };
})();
