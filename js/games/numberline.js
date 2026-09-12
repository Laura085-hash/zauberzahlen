/* ===== Gioco 11: Zahlenstrahl & Hundertertafel — Zahlen bis 100 finden und einordnen =====
   Obiettivo del quiz: "Identify and correctly place numbers from 1 to 100". */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var CREATURES = ["🦄", "🐉", "🧚"];

  // linea da lo a hi, tacche ogni `step`, etichette ogni `labelEvery`; marks = [{at, emoji}]
  function line(lo, hi, step, labelEvery, marks, onTap) {
    var W = 340, H = 96, x0 = 22, x1 = W - 22;
    function X(n) { return x0 + (n - lo) / (hi - lo) * (x1 - x0); }
    var s = ui.svg("svg", { viewBox: "0 0 " + W + " " + H, class: "nline" });
    s.appendChild(ui.svg("line", { x1: x0 - 8, y1: 56, x2: x1 + 8, y2: 56, class: "base" }));
    for (var n = lo; n <= hi; n += step) {
      var big = (n - lo) % labelEvery === 0;
      s.appendChild(ui.svg("line", { x1: X(n), y1: big ? 46 : 50, x2: X(n), y2: big ? 66 : 62, class: "tick" + (big ? " big" : "") }));
      if (big) s.appendChild(ui.svg("text", { x: X(n), y: 84 }, n));
    }
    (marks || []).forEach(function (m) {
      var g = ui.svg("g", { class: "mark" + (onTap ? " tappable" : "") });
      g.appendChild(ui.svg("circle", { cx: X(m.at), cy: 24, r: 19, fill: "#fff", "fill-opacity": 0.22 }));
      g.appendChild(ui.svg("polygon", { points: (X(m.at) - 6) + ",42 " + (X(m.at) + 6) + ",42 " + X(m.at) + ",53", fill: "#ffcb3d" }));
      g.appendChild(ui.svg("text", { x: X(m.at), y: 31, class: "emo" }, m.emoji));
      if (onTap) g.addEventListener("click", function () { onTap(m, g); });
      s.appendChild(g);
    });
    return s;
  }

  function board(q, hiddenSet) {
    var b = ui.el("div", { class: "board" }), cells = {};
    for (var n = 1; n <= 100; n++) {
      var c = ui.el("div", { class: "c" + (n === q ? " q" : (hiddenSet[n] ? " hid" : "")) }, [n === q ? "?" : String(n)]);
      cells[n] = c; b.appendChild(c);
    }
    return { el: b, cells: cells };
  }

  MM.games.numberline = {
    id: "numberline", nameKey: "g_numberline", subKey: "g_numberline_sub", emoji: "📏", gem: "🦄", rounds: 6,

    // 1: 0–20 · 2: Zehnerabschnitt (z.B. 40–50) · 3: 0–100 in Fünfern · 4: Hundertertafel · 5: Zahl finden (tippen)
    makeRound: function (level) {
      if (level === 1) { var n1 = ui.randInt(1, 19); return { mode: "read", lo: 0, hi: 20, step: 1, label: 5, n: n1, cands: [n1 - 1, n1 + 1, n1 - 2, n1 + 2], hint: "h_line" }; }
      if (level === 2) { var lo = ui.randInt(1, 9) * 10, n2 = lo + ui.randInt(1, 9); return { mode: "read", lo: lo, hi: lo + 10, step: 1, label: 10, n: n2, cands: [n2 - 1, n2 + 1, n2 - 2, n2 + 2], hint: "h_line" }; }
      if (level === 3) { var n3 = ui.randInt(1, 19) * 5; return { mode: "read", lo: 0, hi: 100, step: 5, label: 10, n: n3, cands: [n3 - 5, n3 + 5, n3 - 10, n3 + 10], hint: "h_lineTens" }; }
      if (level === 4) {
        var q = ui.randInt(12, 99), hid = {}, tries = 0;
        while (Object.keys(hid).length < 6 && tries++ < 100) {
          var h = ui.randInt(1, 100);
          if (h !== q && Math.abs(h - q) !== 1 && Math.abs(h - q) !== 10) hid[h] = true;
        }
        return { mode: "board", n: q, hidden: hid, cands: [q - 1, q + 1, q - 10, q + 10, q + 9, q + 11] };
      }
      if (Math.random() < 0.5) { var n5 = ui.randInt(1, 19) * 5; return { mode: "find", lo: 0, hi: 100, step: 5, label: 10, n: n5, spread: 5 }; }
      var lo5 = ui.randInt(0, 9) * 10, n5b = lo5 + ui.randInt(1, 9);
      return { mode: "find", lo: lo5, hi: lo5 + 10, step: 1, label: 10, n: n5b, spread: 1 };
    },

    render: function (mount, round, api) {
      var holder = ui.el("div", { class: "holder" });
      if (round.mode === "read") {
        api.prompt(t("p_lineWhich"));
        mount.appendChild(line(round.lo, round.hi, round.step, round.label, [{ at: round.n, emoji: "🦄" }]));
        mount.appendChild(holder);
        ui.askChoices(holder, round.n, function () { return ui.choicesFrom(round.n, round.cands, 3, round.lo, round.hi); }, function (ok) {
          api.submit(ok, { recall: false, hint: t(round.hint) });
        });

      } else if (round.mode === "board") {
        api.prompt(t("p_boardWhich"));
        var b = board(round.n, round.hidden);
        mount.appendChild(b.el); mount.appendChild(holder);
        ui.askChoices(holder, round.n, function () { return ui.choicesFrom(round.n, round.cands, 3, 1, 100); }, function (ok) {
          if (ok) { b.cells[round.n].classList.remove("q"); b.cells[round.n].classList.add("ok"); b.cells[round.n].textContent = String(round.n); }
          api.submit(ok, { recall: true, hint: t("h_board") });
        });

      } else { // find: tre creature sulla linea, tocca quella sulla zahl giusta
        api.prompt(t("p_lineFind", { n: round.n }));
        var wrap = ui.el("div", { class: "holder" }); mount.appendChild(wrap);
        function place() {
          ui.clear(wrap);
          var list = [round.n], guard = 0, minGap = 3 * round.spread;
          while (list.length < 3 && guard++ < 200) {
            var p = round.lo + ui.randInt(0, (round.hi - round.lo) / round.spread) * round.spread;
            var far = list.every(function (q) { return Math.abs(q - p) >= minGap; });
            if (far && p >= round.lo && p <= round.hi) list.push(p);
          }
          var em = ui.shuffle(CREATURES);
          var marks = list.map(function (at, i) { return { at: at, emoji: em[i] }; });
          wrap.appendChild(line(round.lo, round.hi, round.step, round.label, marks, function (m, g) {
            MM.audio.unlock();
            if (g.classList.contains("dim") || g.classList.contains("ok")) return;
            if (m.at === round.n) { g.classList.add("ok"); api.submit(true, { recall: true }); }
            else { g.classList.add("dim"); api.submit(false, { hint: t("h_find") }); setTimeout(place, 1100); }
          }));
        }
        place();
      }
    }
  };
})();
