/* ===== Gioco 12: Nachbarzahlen — davor, danach, Nachbarzehner, dazwischen =====
   Obiettivo del quiz: "Identify neighbouring numbers". Con attenzione al passaggio della decina (39→40, 70→69). */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  function swap(v) { return v >= 10 && v <= 99 ? (v % 10) * 10 + Math.floor(v / 10) : v; }
  function nearCands(v) { return [v - 1, v + 1, v - 2, v + 2, v - 10, v + 10, swap(v)]; }
  function tenCands(v, n) { return [v - 10, v + 10, v - 20, v + 20, n, v - 1, v + 1]; }

  function trio(items, sep) {
    var el = ui.el("div", { class: "trio" }), boxes = [];
    items.forEach(function (x, i) {
      if (i > 0) el.appendChild(ui.el("div", { class: "op" }, [sep || ""]));
      var b = ui.el("div", { class: "box" + (x.q ? " q" : "") }, [x.q ? "" : String(x.text)]);
      boxes.push(b); el.appendChild(b);
    });
    return { el: el, boxes: boxes };
  }

  MM.games.neighbours = {
    id: "neighbours", nameKey: "g_neighbours", subKey: "g_neighbours_sub", emoji: "🏘️", gem: "🏠", rounds: 6,

    // 1: Nachbarn bis 20 · 2: Nachbarn bis 100 (mit Zehnerübergang) · 3: Nachbarzehner · 4: dazwischen + gemischt
    makeRound: function (level) {
      var n;
      if (level === 1 || level === 2 || (level === 4 && Math.random() < 0.4)) {
        if (level === 1) n = ui.randInt(2, 19);
        else n = Math.random() < 0.4 ? (ui.randInt(1, 9) * 10 + (Math.random() < 0.5 ? 0 : 9)) : ui.randInt(11, 98);
        var crossB = n % 10 === 0, crossA = n % 10 === 9;
        return { mode: "pair", n: n, items: [{ q: true }, { text: n }, { q: true }], sep: "",
          steps: [
            { box: 0, v: n - 1, prompt: t("p_before", { n: n }), hint: t(crossB ? "h_cross" : "h_before"), cands: nearCands(n - 1) },
            { box: 2, v: n + 1, prompt: t("p_after", { n: n }), hint: t(crossA ? "h_cross" : "h_after"), cands: nearCands(n + 1) }
          ] };
      }
      if (level === 3 || Math.random() < 0.5) {
        n = ui.randInt(11, 99); if (n % 10 === 0) n += 3;
        var lo = Math.floor(n / 10) * 10, hi = lo + 10;
        return { mode: "tens", n: n, items: [{ q: true }, { text: n }, { q: true }], sep: "<",
          steps: [
            { box: 0, v: lo, prompt: t("p_tenBefore", { n: n }), hint: t("h_tenBefore", { n: n }), cands: tenCands(lo, n) },
            { box: 2, v: hi, prompt: t("p_tenAfter", { n: n }), hint: t("h_tenAfter", { n: n }), cands: tenCands(hi, n) }
          ] };
      }
      n = Math.random() < 0.4 ? ui.randInt(1, 9) * 10 : ui.randInt(2, 99);
      return { mode: "between", n: n, items: [{ text: n - 1 }, { q: true }, { text: n + 1 }], sep: "",
        steps: [{ box: 1, v: n, prompt: t("p_between", { a: n - 1, b: n + 1 }), hint: t(n % 10 === 0 ? "h_cross" : "h_between", { a: n - 1 }), cands: nearCands(n) }] };
    },

    render: function (mount, round, api) {
      var tr = trio(round.items, round.sep);
      mount.appendChild(tr.el);
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      var si = 0;
      function step() {
        if (si >= round.steps.length) return api.submit(true, { recall: true });
        var s = round.steps[si], box = tr.boxes[s.box];
        box.classList.add("active"); box.textContent = "?";
        api.prompt(s.prompt);
        ui.askChoices(holder, s.v, function () { return ui.choicesFrom(s.v, s.cands, 3, 0, 100); }, function (ok) {
          if (!ok) return api.submit(false, { hint: s.hint });
          box.classList.remove("active"); box.classList.remove("q"); box.classList.add("ok"); box.textContent = String(s.v);
          si++;
          if (si < round.steps.length) { MM.audio.sfx("sparkle"); ui.sparkle(5); }
          setTimeout(step, 350);
        });
      }
      step();
    }
  };
})();
