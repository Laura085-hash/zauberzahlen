/* ===== Gioco 8: Zahlenmauer — jeder Stein = Summe der zwei darunter =====
   Dal quaderno "Numbers and Shapes" (piramidi a 3 e 4 mattoni) e "Calculating with Tens". */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  function build(base) {
    var rows = [base.slice()];
    while (rows[rows.length - 1].length > 1) {
      var p = rows[rows.length - 1], q = [];
      for (var i = 0; i < p.length - 1; i++) q.push(p[i] + p[i + 1]);
      rows.push(q);
    }
    return rows;
  }
  function key(r, i) { return r + "-" + i; }

  // ordina i passi in modo che ogni mattone sia calcolabile da quelli già noti
  function planSteps(rows, hidden) {
    var known = {};
    rows.forEach(function (row, r) { row.forEach(function (v, i) { if (!hidden[key(r, i)]) known[key(r, i)] = true; }); });
    var steps = [], left = Object.keys(hidden).length, progress = true;
    while (left > 0 && progress) {
      progress = false;
      for (var r = 0; r < rows.length; r++) {
        for (var i = 0; i < rows[r].length; i++) {
          var k = key(r, i);
          if (!hidden[k] || known[k]) continue;
          var how = null;
          if (r > 0 && known[key(r - 1, i)] && known[key(r - 1, i + 1)]) how = "up";
          else if (r + 1 < rows.length) {
            if (i < rows[r].length - 1 && known[key(r + 1, i)] && known[key(r, i + 1)]) how = "down";
            else if (i > 0 && known[key(r + 1, i - 1)] && known[key(r, i - 1)]) how = "down";
          }
          if (how) { steps.push({ r: r, i: i, v: rows[r][i], how: how }); known[k] = true; left--; progress = true; }
        }
      }
    }
    return left === 0 ? steps : null;
  }

  MM.games.wall = {
    id: "wall", nameKey: "g_wall", subKey: "g_wall_sub", emoji: "🧱", gem: "🧱", rounds: 5,

    // 1: 3 Steine unten, oben füllen (≤20) · 2: ein Stein unten fehlt (minus) · 3: 4 Steine unten (≤30) · 4: mit Zehnern (≤100)
    makeRound: function (level) {
      var tens = level === 4, n = level === 3 ? 4 : 3;
      var limit = tens ? 100 : (n === 4 ? 30 : 20);
      var rows, hidden, steps = null, guard = 0;
      do {
        steps = null;
        var base = [];
        for (var i = 0; i < n; i++) base.push(tens ? ui.randInt(1, 4) * 10 : (n === 4 ? ui.randInt(0, 6) : ui.randInt(1, 9)));
        rows = build(base);
        if (rows[rows.length - 1][0] <= limit) {
          hidden = {};
          var mixed = (level === 2 || level === 4) && Math.random() < 0.7;
          if (!mixed) {
            for (var r = 1; r < rows.length; r++) for (var j = 0; j < rows[r].length; j++) hidden[key(r, j)] = true;
          } else {
            // un mattone in basso manca (si trova con la sottrazione), più la cima e un mattone di mezzo
            var bi = ui.randInt(0, 2);
            hidden[key(0, bi)] = true; hidden[key(2, 0)] = true;
            if (bi === 0) hidden[key(1, 1)] = true;
            else if (bi === 2) hidden[key(1, 0)] = true;
            else hidden[key(1, ui.randInt(0, 1))] = true;
          }
          steps = planSteps(rows, hidden);
        }
      } while (!steps && guard++ < 300);
      return { rows: rows, hidden: hidden || {}, steps: steps || [], tens: tens };
    },

    render: function (mount, round, api) {
      api.prompt(t("p_wall"));
      var wall = ui.el("div", { class: "wall" }), cells = {};
      for (var r = round.rows.length - 1; r >= 0; r--) {
        var rowEl = ui.el("div", { class: "wrow" });
        for (var i = 0; i < round.rows[r].length; i++) {
          var k = key(r, i), hid = round.hidden[k];
          var b = ui.el("div", { class: "brick" + (hid ? " q" : "") + (round.tens ? " wide" : "") }, [hid ? "" : String(round.rows[r][i])]);
          cells[k] = b; rowEl.appendChild(b);
        }
        wall.appendChild(rowEl);
      }
      mount.appendChild(wall);
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);

      var si = 0;
      function step() {
        if (si >= round.steps.length) return api.submit(true, { recall: true });
        var s = round.steps[si], cell = cells[key(s.r, s.i)];
        cell.classList.add("active"); cell.textContent = "?";
        ui.askChoices(holder, s.v, function () {
          return round.tens ? ui.choicesFrom(s.v, [s.v - 10, s.v + 10, s.v - 20, s.v + 20], 3, 0, 100)
                            : ui.answerChoices(s.v, 3, 0, 30);
        }, function (ok) {
          if (!ok) return api.submit(false, { hint: t(s.how === "up" ? "h_wallUp" : "h_wallDown") });
          cell.classList.remove("active"); cell.classList.remove("q"); cell.classList.add("ok");
          cell.textContent = String(s.v);
          si++;
          if (si < round.steps.length) { MM.audio.sfx("sparkle"); ui.sparkle(5); }
          setTimeout(step, 350);
        });
      }
      step();
    }
  };
})();
