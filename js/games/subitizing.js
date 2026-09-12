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

    // 1:1-5 visibile · 2:1-5 lampo · 3:1-10 visibile · 4:1-10 lampo · 5:1-15 lampo
    makeRound: function (level) {
      var max = level <= 2 ? 5 : (level <= 4 ? 10 : 15);
      var flash = (level === 2 || level === 4 || level === 5);
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
        var holder = ui.el("div", { class: "holder" });
        mount.appendChild(holder);
        ui.askChoices(holder, round.n, function () { return ui.answerChoices(round.n, 3, 1, round.max); }, function (ok) {
          api.submit(ok, { recall: round.flash, hint: MM.i18n.t("h_subitizing") });
        });
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
