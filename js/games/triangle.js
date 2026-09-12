/* ===== Gioco 9: Zahlendreieck — innen + innen = außen =====
   Dal quaderno: tre numeri dentro (T, L, R), fuori le somme delle coppie vicine. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var OUT = { oL: ["T", "L"], oR: ["T", "R"], oB: ["L", "R"] };
  var POS = { T: [150, 96], L: [98, 196], R: [202, 196], oL: [44, 106], oR: [256, 106], oB: [150, 272] };

  function values(T, L, R) { return { T: T, L: L, R: R, oL: T + L, oR: T + R, oB: L + R }; }

  function planSteps(v, hidden, seed) {
    var known = {}; Object.keys(v).forEach(function (k) { if (!hidden[k]) known[k] = true; });
    var steps = [], left = Object.keys(hidden).length;
    if (seed) { steps.push({ k: seed, v: v[seed], how: "guess" }); known[seed] = true; left--; }
    var progress = true;
    while (left > 0 && progress) {
      progress = false;
      Object.keys(hidden).forEach(function (k) {
        if (known[k]) return;
        var how = null;
        if (OUT[k]) { if (known[OUT[k][0]] && known[OUT[k][1]]) how = "out"; }
        else {
          Object.keys(OUT).forEach(function (o) {
            if (how) return;
            var pair = OUT[o];
            if (pair.indexOf(k) < 0 || !known[o]) return;
            var other = pair[0] === k ? pair[1] : pair[0];
            if (known[other]) how = "in";
          });
        }
        if (how) { steps.push({ k: k, v: v[k], how: how }); known[k] = true; left--; progress = true; }
      });
    }
    return left === 0 ? steps : null;
  }

  function draw(v, hidden, wide) {
    var s = ui.svg("svg", { viewBox: "0 0 300 300", class: "tri" });
    s.appendChild(ui.svg("polygon", { points: "150,18 18,236 282,236", fill: "#fff", stroke: "#6a4bb6", "stroke-width": 4, "stroke-linejoin": "round" }));
    [[84, 127], [216, 127], [150, 236]].forEach(function (m) {
      s.appendChild(ui.svg("line", { x1: 150, y1: 163, x2: m[0], y2: m[1], stroke: "#6a4bb6", "stroke-width": 3 }));
    });
    var slots = {};
    Object.keys(POS).forEach(function (k) {
      var g = ui.svg("g", { class: "slot" + (hidden[k] ? " q" : "") });
      var w = wide ? 64 : 52;
      g.appendChild(ui.svg("rect", { x: POS[k][0] - w / 2, y: POS[k][1] - 20, width: w, height: 40, rx: 10 }));
      g.appendChild(ui.svg("text", { x: POS[k][0], y: POS[k][1] + 1, "text-anchor": "middle", "dominant-baseline": "central" }, hidden[k] ? "" : v[k]));
      s.appendChild(g); slots[k] = g;
    });
    return { svg: s, slots: slots };
  }

  MM.games.triangle = {
    id: "triangle", nameKey: "g_triangle", subKey: "g_triangle_sub", emoji: "🔺", gem: "🔺", rounds: 5,

    // 1: innen gegeben → außen · 2: eine innere fehlt (minus) · 3: mit Zehnern · 4: nur außen gegeben (probieren)
    makeRound: function (level) {
      var tens = level === 3;
      var rnd = function () { return tens ? ui.randInt(1, 4) * 10 : ui.randInt(1, 9); };
      var v = values(rnd(), rnd(), rnd());
      var hidden = {}, seed = null;
      var pattern = level === 1 ? "out" : (level === 4 ? "guess" : (Math.random() < 0.5 ? "out" : "in"));
      if (pattern === "out") { hidden.oL = hidden.oR = hidden.oB = true; }
      else if (pattern === "in") {
        var inner = ["T", "L", "R"][ui.randInt(0, 2)];
        hidden[inner] = true;
        // resta visibile UNA sola Außenzahl che contiene la innere mancante; le altre due vanno trovate
        var outs = Object.keys(OUT).filter(function (o) { return OUT[o].indexOf(inner) >= 0; });
        var keep = outs[ui.randInt(0, 1)];
        Object.keys(OUT).forEach(function (o) { if (o !== keep) hidden[o] = true; });
      } else { hidden.T = hidden.L = hidden.R = true; seed = "T"; }
      var steps = planSteps(v, hidden, seed) || [];
      return { v: v, hidden: hidden, steps: steps, tens: tens };
    },

    render: function (mount, round, api) {
      api.prompt(t("p_triangle"));
      var d = draw(round.v, round.hidden, round.tens);
      mount.appendChild(d.svg);
      var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
      var si = 0;
      function setText(g, txt) { g.querySelector("text").textContent = txt; }
      function step() {
        if (si >= round.steps.length) return api.submit(true, { recall: true });
        var s = round.steps[si], g = d.slots[s.k];
        g.classList.add("active"); setText(g, "?");
        ui.askChoices(holder, s.v, function () {
          return round.tens ? ui.choicesFrom(s.v, [s.v - 10, s.v + 10, s.v - 20, s.v + 20], 3, 0, 100)
                            : ui.answerChoices(s.v, 3, 0, 20);
        }, function (ok) {
          if (!ok) return api.submit(false, { hint: t(s.how === "out" ? "h_triOut" : (s.how === "in" ? "h_triIn" : "h_triGuess")) });
          g.classList.remove("active"); g.classList.remove("q"); g.classList.add("ok"); setText(g, String(s.v));
          si++;
          if (si < round.steps.length) { MM.audio.sfx("sparkle"); ui.sparkle(5); }
          setTimeout(step, 350);
        });
      }
      step();
    }
  };
})();
