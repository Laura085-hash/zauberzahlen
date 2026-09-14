/* ===== Gioco 19: Vergleichen — kleiner, größer oder gleich? =====
   Trappole tipiche di Joy: cifre scambiate (47 vs 74), "60" letto male. Poi con i calcoli sui due lati
   (30 + 5 ○ 36, 20 + 9 ○ 9 + 20): prima si calcola, poi si confronta. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var SIGNS = ["<", "=", ">"];

  function sign(l, r) { return l < r ? "<" : l > r ? ">" : "="; }
  function num(v) { return { text: String(v), v: v }; }
  function sum(a, b) { return { text: a + " + " + b, v: a + b }; }
  function diff(a, b) { return { text: a + " − " + b, v: a - b }; }
  function swapDigits(n) { return (n % 10) * 10 + Math.floor(n / 10); }

  function pairNumbers(max) {
    var a = ui.randInt(0, max), b, r = Math.random();
    if (max > 20 && a >= 10 && a % 10 !== 0 && r < 0.4) b = swapDigits(a);      // 47 vs 74
    else if (r < 0.55) b = a;                                                    // gleich
    else b = ui.randInt(0, max);
    return { l: num(a), r: num(b) };
  }
  function sumVsNumber() {           // 30 + 5 ○ 36
    var tn = ui.randInt(1, 9) * 10, on = ui.randInt(1, 9), s = tn + on;
    var right = [s, s + 1, s - 1, swapDigits(s)][ui.randInt(0, 3)];
    var p = { l: sum(tn, on), r: num(right) };
    return Math.random() < 0.5 ? p : { l: p.r, r: p.l };
  }
  function sumVsSum() {              // 20 + 9 ○ 9 + 20 · 40 + 3 ○ 30 + 4
    var a = ui.randInt(1, 9) * 10, b = ui.randInt(1, 9), r = Math.random();
    if (r < 0.4) return { l: sum(a, b), r: sum(b, a) };
    if (r < 0.7) return { l: sum(a, b), r: sum(b * 10, a / 10) };
    var step = a >= 90 ? -10 : a <= 10 ? 10 : (Math.random() < 0.5 ? 10 : -10);
    return { l: sum(a, b), r: sum(a + step, b) };
  }
  function withMinus() {             // 50 − 10 ○ 30 + 5
    var a = ui.randInt(3, 9) * 10, b = ui.randInt(1, a / 10 - 1) * 10;
    var c = ui.randInt(1, 8) * 10, d = ui.randInt(0, 9);
    var p = { l: diff(a, b), r: sum(c, d) };
    return Math.random() < 0.5 ? p : { l: p.r, r: p.l };
  }

  function finish(p, calc) { p.ans = sign(p.l.v, p.r.v); p.calc = calc; return p; }

  MM.games.compare = {
    id: "compare", nameKey: "g_compare", subKey: "g_compare_sub", emoji: "⚖️", gem: "⚖️", rounds: 6,

    // 1: Zahlen bis 20 · 2: Zahlen bis 100 (Zahlendreher!) · 3: Rechnung ○ Zahl · 4: Rechnung ○ Rechnung · 5: gemischt mit Minus
    makeRound: function (level) {
      if (level === 1) return finish(pairNumbers(20), false);
      if (level === 2) return finish(pairNumbers(99), false);
      if (level === 3) return finish(sumVsNumber(), true);
      if (level === 4) return finish(sumVsSum(), true);
      var r = Math.random();
      return r < 0.4 ? finish(withMinus(), true) : r < 0.7 ? finish(sumVsSum(), true) : finish(pairNumbers(99), false);
    },

    render: function (mount, round, api) {
      api.prompt(t("p_compare"));
      var signEl = ui.el("div", { class: "sign" }, ["?"]);
      mount.appendChild(ui.el("div", { class: "cmp" }, [
        ui.el("div", { class: "side" }, [round.l.text]), signEl, ui.el("div", { class: "side" }, [round.r.text])
      ]));
      var holder = ui.el("div", { class: "holder ops" }); mount.appendChild(holder);
      ui.askChoices(holder, round.ans, function () { return ui.shuffle(SIGNS); }, function (ok) {
        if (ok) { signEl.textContent = round.ans; signEl.classList.add("ok"); }
        api.submit(ok, { recall: !round.calc, hint: t(round.calc ? "h_compareCalc" : "h_compare") });
      });
    }
  };
})();
