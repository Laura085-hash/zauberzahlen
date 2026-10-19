/* ===== Gioco 24: Map Explorer — geography test (SIS, Mrs Wennek, Tuesday 20.10.2026) =====
   Learning goals of the test: "I can label a compass" · "I can identify a map symbol" ·
   "I can understand how a town is smaller than a city (what places would be in a city and not in a town)".
   Il test è in inglese: il gioco è sempre in inglese (game.lang = "en"), qualunque sia la lingua dell'app.
   Ogni sessione = 9 round, 3 per obiettivo (idx % 3), così ogni partita ripassa tutto il test.
   Regola: se sbaglia non si mostra mai la risposta, solo il suggerimento e le scelte rimescolate. */
(function () {
  var ui = MM.ui;
  var DIRS = ["North", "East", "South", "West"];
  var HINT_NESW = "Remember: Never Eat Soggy Waffles. Start at the top and go round like the hands of a clock.";

  /* ---------- map symbols (simple map-key style, 64×64) ---------- */
  function S(tag, a) { return ui.svg(tag, a); }
  var SYMBOLS = {
    house: { name: "house", hint: "Look at the shape: a square with a pointy roof. Who lives in it?",
      draw: function (g) { g.appendChild(S("rect", { x: 16, y: 30, width: 32, height: 24, fill: "#e8a87c", stroke: "#7a3e1d", "stroke-width": 3 }));
        g.appendChild(S("path", { d: "M10 32 L32 12 L54 32 Z", fill: "#c0392b", stroke: "#7a3e1d", "stroke-width": 3, "stroke-linejoin": "round" })); } },
    church: { name: "church", hint: "A cross on a building: it's where people go to pray and sing on Sunday.",
      draw: function (g) { g.appendChild(S("rect", { x: 14, y: 14, width: 36, height: 36, fill: "#fff", stroke: "#222", "stroke-width": 3 }));
        g.appendChild(S("rect", { x: 29, y: 18, width: 6, height: 28, fill: "#222" }));
        g.appendChild(S("rect", { x: 21, y: 25, width: 22, height: 6, fill: "#222" })); } },
    school: { name: "school", hint: "A building with a flag where children go to learn. You go there every day!",
      draw: function (g) { g.appendChild(S("rect", { x: 10, y: 30, width: 44, height: 24, fill: "#f6d365", stroke: "#8a6d1d", "stroke-width": 3 }));
        g.appendChild(S("line", { x1: 32, y1: 30, x2: 32, y2: 8, stroke: "#333", "stroke-width": 3 }));
        g.appendChild(S("path", { d: "M32 9 L48 14 L32 19 Z", fill: "#e74c3c" }));
        [16, 28, 40].forEach(function (x) { g.appendChild(S("rect", { x: x, y: 37, width: 8, height: 8, fill: "#7fb3ff" })); }); } },
    hospital: { name: "hospital", hint: "Look at the letter. Which place starts with this letter? Doctors help sick people there.",
      draw: function (g) { g.appendChild(S("rect", { x: 10, y: 10, width: 44, height: 44, rx: 6, fill: "#1f6fd1" }));
        g.appendChild(ui.svg("text", { x: 32, y: 45, "text-anchor": "middle", "font-size": 34, "font-weight": 900, fill: "#fff", "font-family": "Arial, sans-serif" }, "H")); } },
    carpark: { name: "car park", hint: "Look at the letter P. It's a place where you leave the car.",
      draw: function (g) { g.appendChild(S("rect", { x: 10, y: 10, width: 44, height: 44, rx: 6, fill: "#1f6fd1" }));
        g.appendChild(ui.svg("text", { x: 32, y: 45, "text-anchor": "middle", "font-size": 34, "font-weight": 900, fill: "#fff", "font-family": "Arial, sans-serif" }, "P")); } },
    river: { name: "river", hint: "Blue means water. This water is a long wiggly line: it flows and moves.",
      draw: function (g) { g.appendChild(S("path", { d: "M2 40 C14 22, 22 22, 32 34 S50 46, 62 26", fill: "none", stroke: "#2e86de", "stroke-width": 8, "stroke-linecap": "round" })); } },
    lake: { name: "lake", hint: "Blue means water. This water stays still in one place, with land all around it.",
      draw: function (g) { g.appendChild(S("path", { d: "M12 34 C10 18, 30 12, 42 16 C56 20, 58 38, 48 48 C38 56, 16 52, 12 34 Z", fill: "#7ec8f5", stroke: "#2e86de", "stroke-width": 3 })); } },
    road: { name: "road", hint: "A long grey band with a dashed line in the middle. Cars drive on it.",
      draw: function (g) { g.appendChild(S("rect", { x: 2, y: 22, width: 60, height: 20, fill: "#8e8e8e" }));
        g.appendChild(S("line", { x1: 4, y1: 32, x2: 60, y2: 32, stroke: "#fff", "stroke-width": 3, "stroke-dasharray": "7 6" })); } },
    railway: { name: "railway", hint: "A black line with little lines across it, like a ladder. Trains go on it.",
      draw: function (g) { g.appendChild(S("line", { x1: 2, y1: 32, x2: 62, y2: 32, stroke: "#222", "stroke-width": 4 }));
        for (var x = 8; x < 60; x += 9) g.appendChild(S("line", { x1: x, y1: 24, x2: x, y2: 40, stroke: "#222", "stroke-width": 3 })); } },
    station: { name: "train station", hint: "A railway line with a red stop on it. This is where the train stops and people get on.",
      draw: function (g) { g.appendChild(S("line", { x1: 2, y1: 32, x2: 62, y2: 32, stroke: "#222", "stroke-width": 4 }));
        for (var x = 6; x < 62; x += 9) g.appendChild(S("line", { x1: x, y1: 25, x2: x, y2: 39, stroke: "#222", "stroke-width": 3 }));
        g.appendChild(S("circle", { cx: 32, cy: 32, r: 11, fill: "#e74c3c", stroke: "#fff", "stroke-width": 3 })); } },
    bridge: { name: "bridge", hint: "A road going over the blue water. How do you get across a river without getting wet?",
      draw: function (g) { g.appendChild(S("path", { d: "M32 0 C22 16, 42 30, 30 64", fill: "none", stroke: "#2e86de", "stroke-width": 10 }));
        g.appendChild(S("rect", { x: 2, y: 24, width: 60, height: 16, fill: "#8e8e8e" }));
        g.appendChild(S("path", { d: "M18 18 L24 24 L24 40 L18 46 M46 18 L40 24 L40 40 L46 46", fill: "none", stroke: "#222", "stroke-width": 3 })); } },
    woods: { name: "woods", hint: "Lots and lots of trees together. What do we call a place full of trees?",
      draw: function (g) { [[18, 20], [40, 18], [28, 36], [50, 38], [14, 46]].forEach(function (p) {
          g.appendChild(S("circle", { cx: p[0], cy: p[1], r: 9, fill: "#27ae60", stroke: "#145a32", "stroke-width": 2 })); }); } },
    park: { name: "park", hint: "A green space with grass and one tree. You can play and have a picnic there.",
      draw: function (g) { g.appendChild(S("rect", { x: 6, y: 10, width: 52, height: 44, rx: 8, fill: "#b8e994", stroke: "#3c763d", "stroke-width": 3 }));
        g.appendChild(S("rect", { x: 30, y: 30, width: 4, height: 14, fill: "#7a3e1d" }));
        g.appendChild(S("circle", { cx: 32, cy: 26, r: 9, fill: "#27ae60" })); } },
    castle: { name: "castle", hint: "A big strong building with towers. Kings and queens lived in it long ago.",
      draw: function (g) { g.appendChild(S("path", { d: "M10 54 L10 18 L18 18 L18 26 L26 26 L26 18 L38 18 L38 26 L46 26 L46 18 L54 18 L54 54 Z", fill: "#bdc3c7", stroke: "#555", "stroke-width": 3, "stroke-linejoin": "round" }));
        g.appendChild(S("path", { d: "M27 54 L27 42 A5 5 0 0 1 37 42 L37 54 Z", fill: "#555" })); } },
    hill: { name: "hill", hint: "A brown bump that goes up high. You walk up it and you can see far.",
      draw: function (g) { g.appendChild(S("path", { d: "M4 54 L26 16 L36 30 L42 22 L60 54 Z", fill: "#c8a07a", stroke: "#7a4e2d", "stroke-width": 3, "stroke-linejoin": "round" })); } }
  };
  var SYM_EASY = ["house", "church", "school", "hospital", "river", "road", "woods", "park"];
  var SYM_ALL = Object.keys(SYMBOLS);

  function symbolSvg(key, size) {
    var s = ui.svg("svg", { viewBox: "0 0 64 64", width: size || 64, height: size || 64, class: "msym" });
    SYMBOLS[key].draw(s);
    return s;
  }

  /* ---------- town & city ---------- */
  var CITY_PLACES = ["a cathedral", "a big airport", "a university", "skyscrapers", "a big football stadium",
                     "a zoo", "a big museum", "trams and lots of buses", "a very big hospital", "a big concert hall"];
  var TOWN_THINGS = ["a few shops and a small train station", "one high street and a market square",
                     "a small library and a few cafés", "a small school and a post office"];
  function townCityRound(level) {
    var r = Math.random(), opts2 = ["town", "city"], opts3 = ["village", "town", "city"];
    var bigHint = "Big, special places need lots and lots of people. Which one is the BIGGER place?";
    var smallHint = "Only a few small things… is that the BIGGER place or the SMALLER place?";
    if (level >= 3 && r < 0.25) {
      var q = [
        { q: "Village, town, city: which one is the SMALLEST?", ans: "village", hint: "Think of the order from small to big: a few houses, then more, then lots and lots." },
        { q: "Village, town, city: which one is the BIGGEST?", ans: "city", hint: "Think of the order from small to big: a few houses, then more, then lots and lots." },
        { q: "Which one is bigger than a village but smaller than a city?", ans: "town", hint: "It's the one in the middle." }
      ][ui.randInt(0, 2)];
      return { topic: "town", q: q.q, ans: q.ans, opts: opts3, hint: q.hint };
    }
    if (r < 0.2) {
      return Math.random() < 0.5
        ? { topic: "town", q: "Which is bigger: a town or a city?", ans: "city", opts: opts2, hint: "Lots and lots of people live in the bigger one, with tall buildings and an airport." }
        : { topic: "town", q: "Which is smaller: a town or a city?", ans: "town", opts: opts2, hint: "The smaller one has fewer people and fewer buildings." };
    }
    if (r < 0.35) {
      return Math.random() < 0.5
        ? { topic: "town", q: "Zürich has an airport, a zoo, a university and lots of trams. Zürich is a …", ans: "city", opts: opts2, hint: bigHint }
        : { topic: "town", q: "More people live in a …", ans: "city", opts: opts2, hint: "The bigger place has more houses and more people." };
    }
    if (r < 0.6) {
      return { topic: "town", q: "This place has " + TOWN_THINGS[ui.randInt(0, TOWN_THINGS.length - 1)] + ". Is it a town or a city?", ans: "town", opts: opts2, hint: smallHint };
    }
    var p = CITY_PLACES[ui.randInt(0, CITY_PLACES.length - 1)];
    return { topic: "town", q: "Where would you find " + p + ": in a town or in a city?", ans: "city", opts: opts2, hint: bigHint };
  }

  /* ---------- compass ---------- */
  function compassRound(level) {
    var r = Math.random();
    if (level >= 2 && r < 0.4) return mapRound(level);
    if (level >= 3 && r < 0.6) {
      var qs = [
        { q: "What is opposite North?", ans: "South", hint: "Opposite means on the other side: if North is at the top, look at the bottom." },
        { q: "What is opposite East?", ans: "West", hint: "Opposite means on the other side: East and … are on the two sides." },
        { q: "Start at North and go round clockwise. What comes next?", ans: "East", hint: HINT_NESW },
        { q: "Start at East and go round clockwise. What comes next?", ans: "South", hint: HINT_NESW },
        { q: "Start at South and go round clockwise. What comes next?", ans: "West", hint: HINT_NESW }
      ];
      var x = qs[ui.randInt(0, qs.length - 1)];
      return { topic: "compass", kind: "text", q: x.q, ans: x.ans, opts: DIRS, hint: x.hint };
    }
    var d = ui.randInt(0, 3);
    if (level <= 1 && Math.random() < 0.3) {
      return { topic: "compass", kind: "rose", dir: d, letters: true, q: "Which letter goes on the pink arrow?",
        ans: DIRS[d].charAt(0), opts: ["N", "E", "S", "W"], hint: HINT_NESW };
    }
    return { topic: "compass", kind: "rose", dir: d, letters: false, q: "Which direction does the pink arrow show?",
      ans: DIRS[d], opts: DIRS, hint: HINT_NESW };
  }

  // mini-map: a 3×3 grid, one place in the middle, another one N/E/S/W of it
  function mapRound(level) {
    var pool = ui.shuffle(["house", "church", "school", "hospital", "castle", "park", "lake", "station"]);
    var center = pool[0], other = pool[1], d = ui.randInt(0, 3);
    var extra = level >= 4 ? pool.slice(2, 4) : [];
    return { topic: "compass", kind: "map", center: center, other: other, dir: d, extra: extra,
      q: "The " + SYMBOLS[other].name + " is ___ of the " + SYMBOLS[center].name + ".",
      ans: DIRS[d], opts: DIRS,
      hint: "Look at the little compass: N is at the top. Go round clockwise: N, E, S, W. Start from the " + SYMBOLS[center].name + "." };
  }

  /* ---------- symbols ---------- */
  function symbolRound(level) {
    var pool = level <= 1 ? SYM_EASY : SYM_ALL;
    var key = pool[ui.randInt(0, pool.length - 1)];
    var reverse = level >= 2 && Math.random() < 0.4;
    if (level >= 3 && Math.random() < 0.2) {
      var x = [
        { q: "Why do maps use symbols?", ans: "they are small and quick to read", opts: ["they are small and quick to read", "they make the map heavy", "nobody knows"], hint: "A map is small, but the world is big. Is there space to write long words everywhere?" },
        { q: "Where can you find what the symbols mean?", ans: "in the key", opts: ["in the key", "on the back of the paper", "in the compass"], hint: "Every good map has a little box that explains the symbols. It's called the …" },
        { q: "On a map, what colour is water?", ans: "blue", opts: ["blue", "green", "brown"], hint: "Think of the sea and the lakes on a map." },
        { q: "On a map, what colour are woods and parks?", ans: "green", opts: ["green", "blue", "grey"], hint: "Think of the colour of grass and leaves." }
      ][ui.randInt(0, 3)];
      return { topic: "symbol", kind: "fact", q: x.q, ans: x.ans, opts: x.opts, hint: x.hint };
    }
    return { topic: "symbol", kind: reverse ? "find" : "name", key: key, pool: pool, ans: SYMBOLS[key].name,
      q: reverse ? "Which symbol shows the " + SYMBOLS[key].name + "?" : "What does this map symbol mean?",
      hint: SYMBOLS[key].hint };
  }

  // 3 symbol keys: the right one + 2 others (new ones after every mistake)
  function symbolOptions(round) {
    var others = ui.shuffle(round.pool.filter(function (k) { return k !== round.key; })).slice(0, 2);
    return ui.shuffle([round.key].concat(others));
  }

  /* ---------- drawing ---------- */
  var ROSE_POS = [[100, 22], [178, 100], [100, 178], [22, 100]];   // N E S W
  function compassRose(dir, letters) {
    var s = ui.svg("svg", { viewBox: "0 0 200 200", width: 210, height: 210, class: "rose" });
    s.appendChild(S("circle", { cx: 100, cy: 100, r: 64, fill: "#fff", stroke: "#6a4bb6", "stroke-width": 4 }));
    var pts = ["M100 40 L112 100 L88 100 Z", "M160 100 L100 112 L100 88 Z", "M100 160 L88 100 L112 100 Z", "M40 100 L100 88 L100 112 Z"];
    pts.forEach(function (p, i) { s.appendChild(S("path", { d: p, fill: i === dir ? "#ec4899" : "#c4b5fd", stroke: "#4b2e83", "stroke-width": 2 })); });
    s.appendChild(S("circle", { cx: 100, cy: 100, r: 6, fill: "#4b2e83" }));
    ROSE_POS.forEach(function (p, i) {
      var lab = i === dir ? "?" : (letters ? "" : DIRS[i].charAt(0));
      if (i === dir) s.appendChild(S("circle", { cx: p[0], cy: p[1], r: 17, fill: "#fde047", stroke: "#ec4899", "stroke-width": 3 }));
      if (lab) s.appendChild(ui.svg("text", { x: p[0], y: p[1] + 8, "text-anchor": "middle", "font-size": 24, "font-weight": 900, fill: "#2b2350", "font-family": "Arial, sans-serif" }, lab));
    });
    return s;
  }

  var MAP_OFF = [[1, 0], [2, 1], [1, 2], [0, 1]];   // N E S W cell (col,row) around the centre (1,1)
  function miniMap(round) {
    var cell = 70, s = ui.svg("svg", { viewBox: "0 0 260 230", width: 260, height: 230, class: "minimap" });
    s.appendChild(S("rect", { x: 2, y: 2, width: 214, height: 214, rx: 10, fill: "#f3f9e8", stroke: "#3c763d", "stroke-width": 3 }));
    for (var i = 1; i < 3; i++) {
      s.appendChild(S("line", { x1: 2 + i * cell + i, y1: 4, x2: 2 + i * cell + i, y2: 214, stroke: "#cfe3b8", "stroke-width": 2 }));
      s.appendChild(S("line", { x1: 4, y1: 2 + i * cell + i, x2: 214, y2: 2 + i * cell + i, stroke: "#cfe3b8", "stroke-width": 2 }));
    }
    function put(key, c, r) {
      var g = ui.svg("g", { transform: "translate(" + (6 + c * 71 + 3) + "," + (6 + r * 71 + 3) + ")" });
      g.appendChild(symbolSvg(key, 58));
      s.appendChild(g);
    }
    put(round.center, 1, 1);
    var o = MAP_OFF[round.dir]; put(round.other, o[0], o[1]);
    // extra places on the corners (distractors, not N/E/S/W of the centre)
    var corners = ui.shuffle([[0, 0], [2, 0], [0, 2], [2, 2]]);
    (round.extra || []).forEach(function (k, j) { put(k, corners[j][0], corners[j][1]); });
    // little compass in the corner
    s.appendChild(S("path", { d: "M240 20 L248 48 L240 42 L232 48 Z", fill: "#ec4899" }));
    s.appendChild(ui.svg("text", { x: 240, y: 16, "text-anchor": "middle", "font-size": 16, "font-weight": 900, fill: "#2b2350", "font-family": "Arial, sans-serif" }, "N"));
    return s;
  }

  // like ui.askChoices, but the buttons can contain a map symbol
  function askSymbols(holder, round, onAnswer) {
    function render() {
      ui.clear(holder);
      var wrap = ui.el("div", { class: "choices" }), locked = false;
      symbolOptions(round).forEach(function (k) {
        var b = ui.el("button", { class: "choice symchoice", "aria-label": "symbol" });
        b.appendChild(symbolSvg(k, 64));
        b.addEventListener("click", function () {
          if (locked) return; locked = true; MM.audio.unlock();
          var ok = (k === round.key);
          b.classList.add(ok ? "correct" : "wrong");
          onAnswer(ok);
          if (!ok) setTimeout(render, 1100);
        });
        wrap.appendChild(b);
      });
      holder.appendChild(wrap);
    }
    render();
  }

  MM.games.maps = {
    id: "maps", nameKey: "g_maps", subKey: "g_maps_sub", emoji: "🧭", gem: "🗺️", rounds: 9, lang: "en",

    // ogni livello mescola i 3 obiettivi; più alto = più vario
    // 1: compass rose + easy symbols + town/city · 2: + mini-map directions, all symbols, "which symbol is…"
    // 3: + opposite/clockwise/sun, village-town-city, map facts · 4-5: mini-map with more places
    makeRound: function (level, idx) {
      var k = (idx || 0) % 3;
      if (k === 0) return compassRound(level);
      if (k === 1) return symbolRound(level);
      return townCityRound(level);
    },

    render: function (mount, round, api) {
      api.prompt(round.q);
      var holder = ui.el("div", { class: "holder words maps-holder" });
      if (round.kind === "rose") mount.appendChild(ui.el("div", { class: "maps-pic" }, [compassRose(round.dir, round.letters)]));
      else if (round.kind === "map") mount.appendChild(ui.el("div", { class: "maps-pic" }, [miniMap(round)]));
      else if (round.kind === "name") mount.appendChild(ui.el("div", { class: "maps-pic sym-big" }, [symbolSvg(round.key, 120)]));
      else mount.appendChild(ui.el("div", { class: "maps-pic" }, [ui.el("div", { class: "maps-emoji" }, [round.topic === "town" ? "🏘️ 🏙️" : round.topic === "symbol" ? "🗺️" : "🧭"])]));
      mount.appendChild(holder);
      function done(ok) { api.submit(ok, { recall: true, hint: round.hint }); }
      if (round.kind === "find") return askSymbols(holder, round, done);
      if (round.kind === "name") {
        return ui.askChoices(holder, SYMBOLS[round.key].name, function () {
          return symbolOptions(round).map(function (k) { return SYMBOLS[k].name; });
        }, done);
      }
      ui.askChoices(holder, round.ans, function () { return ui.shuffle(round.opts); }, done);
    }
  };
  MM.maps = { SYMBOLS: SYMBOLS, symbolSvg: symbolSvg };
})();
