/* ===== Dashboard genitore: progressi + riepilogo stampabile ===== */
(function () {
  var ui = MM.ui;
  var t = function (k, v) { return MM.i18n.t(k, v); };

  function pct(x) { return Math.round(x * 100); }

  function skillRow(s) {
    var game = MM.games[s.id] || {};
    var name = t(game.nameKey || s.id);
    var emoji = game.emoji || "✨";

    var head = ui.el("div", { class: "skill-head" }, [
      ui.el("span", {}, [emoji]),
      ui.el("span", { class: "grow" }, [name]),
      ui.el("span", { class: "tag " + s.status }, [t("status_" + s.status)])
    ]);
    head.querySelector(".grow").style.flex = "1";

    var bar = ui.el("div", { class: "bar" }, [ui.el("span", {})]);
    bar.firstChild.style.width = (s.attempts ? pct(s.accuracy) : 0) + "%";

    var line = s.attempts
      ? (s.attempts + " " + t("times") + " · " + pct(s.accuracy) + "% " + t("accuracy")
         + " · " + pct(s.recallShare) + "% " + t("recallShare") + " · ⭐" + s.level + "/" + s.maxLevel)
      : "—";

    return ui.el("div", { class: "skill-row" }, [
      head, bar, ui.el("div", { class: "muted" }, [line])
    ]);
  }

  function render(mount) {
    var summary = MM.storage.getSummary();

    var panel = ui.el("div", { class: "panel" });
    panel.appendChild(ui.el("h2", {}, [t("parentIntro")]));
    summary.forEach(function (s) { panel.appendChild(skillRow(s)); });
    mount.appendChild(panel);

    // legenda / nota per la maestra
    var note = ui.el("div", { class: "panel" }, [
      ui.el("div", { class: "muted" }, [t("reportNote")])
    ]);
    mount.appendChild(note);

    // azioni
    var actions = ui.el("div", { class: "" });
    actions.style.display = "flex"; actions.style.gap = "10px"; actions.style.flexWrap = "wrap";

    var printBtn = ui.el("button", { class: "btn" }, ["🖨️ " + t("print")]);
    printBtn.addEventListener("click", function () {
      var d = new Date().toLocaleDateString(MM.i18n.lang === "de" ? "de-CH" : "en-GB");
      document.title = t("reportTitle") + " — " + d;
      window.print();
    });

    var resetBtn = ui.el("button", { class: "btn btn-ghost" }, ["🧹 " + t("reset")]);
    resetBtn.style.color = "#fff";
    resetBtn.addEventListener("click", function () {
      if (window.confirm(t("resetAsk"))) { MM.storage.reset(); MM.app.home(); }
    });

    actions.appendChild(printBtn);
    actions.appendChild(resetBtn);
    mount.appendChild(actions);
  }

  window.MM = window.MM || {};
  window.MM.parent = { render: render };
})();
