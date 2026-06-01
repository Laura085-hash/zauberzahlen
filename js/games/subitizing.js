/* ===== Gioco 1: Subitizing (Mengenverständnis) — "Quante gemme?" ===== */
(function () {
  var ui = MM.ui;

  MM.games = MM.games || {};
  MM.games.subitizing = {
    id: "subitizing",
    nameKey: "g_subitizing",
    subKey: "g_subitizing_sub",
    emoji: "💎",
    gem: "💎",
    rounds: 6,

    // level 1: 1-5 visibile · 2: 1-5 lampo · 3: 1-10 visibile · 4: 1-10 lampo
    makeRound: function (level) {
      var max = level <= 2 ? 5 : 10;
      var flash = (level === 2 || level === 4);
      return { n: ui.randInt(1, max), max: max, flash: flash };
    },

    render: function (mount, round, api) {
      api.prompt(MM.i18n.t("p_howMany"));
      var holder = ui.el("div", { class: "" });
      holder.style.minHeight = "150px";
      holder.style.display = "flex";
      holder.style.alignItems = "center";
      mount.appendChild(holder);

      var gemBox = ui.gems(round.n, api.gem, true);
      holder.appendChild(gemBox);

      function showChoices() {
        var vals = ui.answerChoices(round.n, 3, 1, round.max);
        mount.appendChild(ui.choices(vals, round.n, function (ok) {
          api.submit(ok, { recall: round.flash, correctText: round.n });
        }));
      }

      if (round.flash) {
        setTimeout(function () {
          // "poof": copri le gemme
          ui.clear(holder);
          var cover = ui.el("div", { class: "gem" }, ["🔮"]);
          cover.style.fontSize = "3.4rem";
          holder.appendChild(cover);
          MM.audio.sfx("sparkle");
          showChoices();
        }, 1100);
      } else {
        showChoices();
      }
    }
  };
})();
