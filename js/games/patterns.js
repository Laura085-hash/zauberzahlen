/* ===== Gioco 10: Muster-Zauber — Muster erkennen und fortsetzen =====
   Obiettivo del quiz: "Recognise and continue patterns". Forme/colori, sequenze di numeri
   (+1, +2, −1, +5, +10, −10), buco in mezzo, e "scale" che crescono come nel quaderno. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var POOLS = [["🔴", "🔵", "🟢", "🟡", "🟣", "🟠"], ["⭐", "🌙", "💜", "🦄", "🌈", "🍄", "🧚", "🍭"], ["🔺", "🟦", "⚫", "🟩", "🔶", "💗"]];
  var UNITS = [[0, 1], [0, 1, 2], [0, 0, 1], [0, 1, 1], [0, 1, 0, 2]];

  function shapeRound(hard) {
    var pool = ui.shuffle(POOLS[ui.randInt(0, POOLS.length - 1)]);
    var units = hard ? UNITS.slice(1) : UNITS.slice(0, 3);
    var unit = units[ui.randInt(0, units.length - 1)].map(function (i) { return pool[i]; });
    var len = unit.length * 2 + ui.randInt(1, unit.length);   // almeno due ripetizioni visibili
    var seq = []; for (var i = 0; i < len; i++) seq.push(unit[i % unit.length]);
    var ans = unit[len % unit.length];
    var distinct = unit.filter(function (x, i) { return unit.indexOf(x) === i; });
    var extra = pool.filter(function (x) { return distinct.indexOf(x) < 0; })[0];
    var others = distinct.filter(function (x) { return x !== ans; }).concat([extra]);
    return { mode: "shape", seq: seq, ans: ans, others: others };
  }

  function numRound(steps, withGap) {
    var step = steps[ui.randInt(0, steps.length - 1)], count = 5, start, guard = 0;
    do {
      start = ui.randInt(0, 100);
      if (Math.abs(step) === 5) start = Math.floor(start / 5) * 5;
    } while ((start + step * (count - 1) < 0 || start + step * (count - 1) > 100) && guard++ < 300);
    var seq = []; for (var i = 0; i < count; i++) seq.push(start + step * i);
    var qi = withGap ? ui.randInt(1, count - 2) : count - 1;
    var ans = seq[qi];
    var i0 = (qi === 1) ? 2 : 0;   // due numeri visibili consecutivi per il suggerimento
    return { mode: "num", seq: seq, qi: qi, ans: ans, step: step, a: seq[i0], b: seq[i0 + 1],
             cands: [ans + 1, ans - 1, ans + step, ans - step, ans + 2 * step, ans + 10, ans - 10, ans + 2, ans - 2] };
  }

  function blocks(k) { var a = []; for (var i = 0; i < k; i++) a.push("🟦"); return a.join("\n"); }
  function growRound() {
    var start = ui.randInt(1, 3), n = 4, seq = [];
    for (var i = 0; i < n; i++) seq.push(start + i);
    var ans = start + n;
    return { mode: "grow", seq: seq, ans: blocks(ans), others: [blocks(ans - 1), blocks(ans + 1)] };
  }

  MM.games.patterns = {
    id: "patterns", nameKey: "g_patterns", subKey: "g_patterns_sub", emoji: "🎨", gem: "🎨", rounds: 6,

    // 1: Formen · 2: Zahlen ±1/±2 · 3: Zahlen ±10/+5 · 4: Lücke in der Mitte · 5: gemischt + wachsende Treppen
    makeRound: function (level) {
      if (level === 1) return shapeRound(false);
      if (level === 2) return numRound([1, 2, -1], false);
      if (level === 3) return numRound([10, -10, 5], false);
      if (level === 4) return numRound([1, 2, -1, -2, 5, 10, -10], true);
      var r = Math.random();
      if (r < 0.35) return growRound();
      if (r < 0.6) return shapeRound(true);
      return numRound([2, -2, 5, -5, 10, -10], true);
    },

    render: function (mount, round, api) {
      var holder = ui.el("div", { class: "holder" });
      var seqEl = ui.el("div", { class: "seq" });
      if (round.mode === "shape") {
        api.prompt(t("p_patternNext"));
        round.seq.forEach(function (s) { seqEl.appendChild(ui.el("div", { class: "item" }, [s])); });
        seqEl.appendChild(ui.el("div", { class: "item q" }, ["?"]));
        mount.appendChild(seqEl); mount.appendChild(holder);
        ui.askChoices(holder, round.ans, function () { return ui.shuffle([round.ans].concat(round.others)); }, function (ok) {
          api.submit(ok, { recall: true, hint: t("h_patternShape") });
        });
      } else if (round.mode === "num") {
        api.prompt(t(round.qi === round.seq.length - 1 ? "p_patternNext" : "p_patternGap"));
        round.seq.forEach(function (v, i) {
          seqEl.appendChild(ui.el("div", { class: "item" + (i === round.qi ? " q" : "") }, [i === round.qi ? "?" : String(v)]));
        });
        mount.appendChild(seqEl); mount.appendChild(holder);
        ui.askChoices(holder, round.ans, function () { return ui.choicesFrom(round.ans, round.cands, 3, 0, 100); }, function (ok) {
          api.submit(ok, { recall: true, hint: t("h_patternNum", { a: round.a, b: round.b }) });
        });
      } else {
        api.prompt(t("p_patternNext"));
        round.seq.forEach(function (k) { seqEl.appendChild(ui.el("div", { class: "item stack" }, [blocks(k)])); });
        seqEl.appendChild(ui.el("div", { class: "item q" }, ["?"]));
        holder.classList.add("tall");
        mount.appendChild(seqEl); mount.appendChild(holder);
        ui.askChoices(holder, round.ans, function () { return ui.shuffle([round.ans].concat(round.others)); }, function (ok) {
          api.submit(ok, { recall: true, hint: t("h_patternGrow") });
        });
      }
    }
  };
})();
