/* ===== Gioco 2: Kraft der 5 — cornice da 5 e da 10 ===== */
(function () {
  var ui = MM.ui;

  function tenFrame(filled, emoji, tappable, onToggle, capacity) {
    capacity = capacity || 10;
    var frame = ui.el("div", { class: "frame" + (capacity === 10 ? " rows2" : "") });
    for (var i = 0; i < capacity; i++) {
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

    // 1:leggi 1-5 · 2:leggi 6-10 · 3:costruisci · 4:leggi 11-20 (doppia cornice)
    makeRound: function (level) {
      if (level === 1) return { mode: "read", n: ui.randInt(1, 5), cap: 10 };
      if (level === 2) return { mode: "read", n: ui.randInt(6, 10), cap: 10 };
      if (level === 3) return { mode: "fill", n: ui.randInt(2, 10), cap: 10 };
      return { mode: "read", n: ui.randInt(11, 20), cap: 20 };
    },

    render: function (mount, round, api) {
      if (round.mode === "read") {
        api.prompt(MM.i18n.t("p_whichNumber"));
        mount.appendChild(tenFrame(round.n, api.gem, false, null, round.cap));
        var holder = ui.el("div", { class: "holder" });
        mount.appendChild(holder);
        ui.askChoices(holder, round.n, function () { return ui.answerChoices(round.n, 3, 1, round.cap); }, function (ok) {
          api.submit(ok, { recall: true, hint: MM.i18n.t("h_fivesRead") });
        });
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
          api.submit(ok, { recall: false, hint: MM.i18n.t("h_fivesFill") });
        });
        mount.appendChild(btn);
      }
    }
  };
})();
