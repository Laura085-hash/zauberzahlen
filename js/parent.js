/* ===== Dashboard genitore: progressi + riepilogo stampabile =====
   Su claude.ai mostra i dati arrivati dal telefono di Joy (cloud.js); altrove quelli di questo dispositivo. */
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

  // Lernwörter: giuste al 1° colpo / sbagliate (dal gioco "Schwere Wörter")
  function wordsPanel(words) {
    var keys = Object.keys(words || {});
    if (!keys.length) return null;
    keys.sort(function (a, b) { return (words[b].w || 0) - (words[a].w || 0) || (words[b].r || 0) - (words[a].r || 0); });
    var panel = ui.el("div", { class: "panel" });
    panel.appendChild(ui.el("h2", {}, [t("wordsTitle")]));
    panel.appendChild(ui.el("div", { class: "muted" }, [t("wordsLegend")]));
    keys.forEach(function (w) {
      var s = words[w] || {}, r = s.r || 0, x = s.w || 0, tot = r + x, acc = tot ? r / tot : 0;
      var cls = acc >= 0.8 ? "mastered" : (acc >= 0.5 ? "consolidating" : "started");
      var head = ui.el("div", { class: "skill-head" }, [
        ui.el("span", { class: "grow" }, [w]),
        ui.el("span", { class: "tag " + cls }, [r + " ✓ · " + x + " ✗"])
      ]);
      head.querySelector(".grow").style.flex = "1";
      var bar = ui.el("div", { class: "bar" }, [ui.el("span", {})]);
      bar.firstChild.style.width = pct(acc) + "%";
      panel.appendChild(ui.el("div", { class: "word-row" }, [head, bar]));
    });
    return panel;
  }

  function render(mount) {
    var status = ui.el("div", { class: "panel" });
    status.style.fontWeight = "700";
    status.hidden = true;
    var body = ui.el("div", {});
    mount.appendChild(status);
    mount.appendChild(body);

    // data = progressi da mostrare (null = questo dispositivo)
    function draw(data) {
      ui.clear(body);
      var summary = MM.storage.getSummary(data);
      var tot = MM.storage.totals(data);

      var panel = ui.el("div", { class: "panel" });
      panel.appendChild(ui.el("h2", {}, [t("parentIntro")]));
      panel.appendChild(ui.el("div", { class: "muted" }, [t("totalsLine", {
        s: tot.sessions, a: tot.attempts, c: tot.correct, p: tot.attempts ? pct(tot.correct / tot.attempts) : 0
      })]));
      summary.forEach(function (s) { panel.appendChild(skillRow(s)); });
      body.appendChild(panel);

      var wp = wordsPanel(MM.storage.wordStats(data));
      if (wp) body.appendChild(wp);

      // legenda / nota per la maestra
      body.appendChild(ui.el("div", { class: "panel" }, [ui.el("div", { class: "muted" }, [t("reportNote")])]));

      // azioni
      var actions = ui.el("div", {});
      actions.style.display = "flex"; actions.style.gap = "10px"; actions.style.flexWrap = "wrap";

      var printBtn = ui.el("button", { class: "btn" }, ["🖨️ " + t("print")]);
      printBtn.addEventListener("click", function () {
        var d = new Date().toLocaleDateString(MM.i18n.lang === "de" ? "de-CH" : "en-GB");
        document.title = t("reportTitle") + " — " + d;
        window.print();
      });
      actions.appendChild(printBtn);

      if (!data) {   // cancellare ha senso solo per i progressi di questo dispositivo
        var resetBtn = ui.el("button", { class: "btn btn-ghost" }, ["🧹 " + t("reset")]);
        resetBtn.style.color = "#fff";
        resetBtn.addEventListener("click", function () {
          if (window.confirm(t("resetAsk"))) { MM.storage.reset(); MM.app.home(); }
        });
        actions.appendChild(resetBtn);
      }
      body.appendChild(actions);
    }

    draw(null);

    // su claude.ai: sostituisci con l'ultimo invio dal telefono di Joy
    if (MM.cloud && MM.cloud.available()) {
      status.hidden = false;
      status.textContent = "⏳ " + t("cloudLoading");
      MM.cloud.load(function (data, err) {
        if (data) {
          var when = data._meta && data._meta.extracted ? new Date(data._meta.extracted) : null;
          var ds = when && !isNaN(when) ? when.toLocaleString(MM.i18n.lang === "de" ? "de-CH" : "en-GB") : "?";
          status.textContent = "📱 " + t("cloudFrom", { d: ds });
          draw(data);
        } else if (err === "none") {
          status.textContent = "📭 " + t("cloudNone");
        } else if (err === "unavailable") {
          status.hidden = true;
        } else {
          status.textContent = "⚠️ " + t("cloudErr", { e: err });
        }
      });
    }
  }

  window.MM = window.MM || {};
  window.MM.parent = { render: render };
})();
