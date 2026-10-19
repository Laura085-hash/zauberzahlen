/* ===== Gioco 24: Map Explorer — geography test (SIS, Mrs Wennek, Tuesday 20.10.2026) =====
   Learning goals: "I can label a compass" · "I can identify a map symbol" ·
   "I can understand how a town is smaller than a city (what places would be in a city and not in a town)".
   Contenuti presi dal quaderno di Joy (foto 19.10): Compass Rose a 8 punti, Compass Directions (griglia
   "go north 4 squares, where are you now?"), Maptown Zoo, Map Symbol Matching Sheet (Twinkl), cartelli
   stradali, Maps and Directions with Locations (go straight / turn left / first right), Directions in the
   City, "Tick the correct option" (luoghi), Towns versus Cities / countryside, me → street → … → world.
   Errori di Joy visti sul quaderno: Hspitil, Polic Starshin, Fire Stashin, laBare, restorad, Soper market,
   tern, Eaest, stait → livello "spelling" con queste trappole.
   Sempre in inglese (game.lang = "en"). 10 round = 2 per ciascuno dei 5 temi (idx % 5).
   Regola: se sbaglia non si mostra mai la risposta, solo il suggerimento e le scelte rimescolate. */
(function () {
  var ui = MM.ui;
  var DIR8 = ["North", "North-East", "East", "South-East", "South", "South-West", "West", "North-West"];
  var SHORT8 = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  var LOWER8 = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"];
  var STEP8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // (col,row) per N, NE, …
  var HINT_NESW = "Remember: Never Eat Soggy Waffles. Start at the top and go round like the hands of a clock.";
  var HINT_DIAG = "The in-between points mix two directions. Say the North or South part first, then East or West.";
  function pick(a) { return a[ui.randInt(0, a.length - 1)]; }
  function S(tag, a) { return ui.svg(tag, a); }
  function T(x, y, size, fill, txt, extra) {
    var a = { x: x, y: y, "text-anchor": "middle", "font-size": size, "font-weight": 900, fill: fill, "font-family": "Arial, sans-serif" };
    Object.keys(extra || {}).forEach(function (k) { a[k] = extra[k]; });
    return ui.svg("text", a, txt);
  }

  /* ---------- map symbols: the school's sheet (Twinkl) + road signs from the workbook ---------- */
  var SYMBOLS = {
    police: { name: "police station", hint: "A blue badge with a star: the people who keep us safe work there.",
      draw: function (g) { g.appendChild(S("path", { d: "M32 6 L52 13 L50 36 C48 48 40 54 32 58 C24 54 16 48 14 36 L12 13 Z", fill: "#1f5fbf" }));
        g.appendChild(S("path", { d: "M32 20 L35.5 29 L45 29 L37.5 35 L40.5 44 L32 38.5 L23.5 44 L26.5 35 L19 29 L28.5 29 Z", fill: "#f9d71c" })); } },
    worship: { name: "place of worship", hint: "Many different signs together: churches, mosques, temples… where people pray.",
      draw: function (g) { g.appendChild(S("path", { d: "M8 58 L8 44 L18 36 L28 44 L28 58 Z", fill: "#f2b705" }));
        g.appendChild(S("path", { d: "M18 22 L18 34 M14 26 L22 26", stroke: "#f2b705", "stroke-width": 3 }));
        g.appendChild(S("path", { d: "M50 12 A12 12 0 1 0 54 34 A9 9 0 1 1 50 12 Z", fill: "#f2b705" }));
        g.appendChild(S("path", { d: "M44 40 L52 54 L36 54 Z M44 58 L36 44 L52 44 Z", fill: "none", stroke: "#f2b705", "stroke-width": 2.5 }));
        g.appendChild(S("path", { d: "M12 6 L20 18 L4 18 Z M12 22 L4 10 L20 10 Z", fill: "none", stroke: "#f2b705", "stroke-width": 2 })); } },
    train: { name: "train station", hint: "A red train on the tracks: here people get on and off the train.",
      draw: function (g) { g.appendChild(S("rect", { x: 6, y: 18, width: 52, height: 26, rx: 6, fill: "#d62828" }));
        [12, 22, 32, 42].forEach(function (x) { g.appendChild(S("rect", { x: x, y: 23, width: 7, height: 9, fill: "#fff" })); });
        g.appendChild(S("line", { x1: 2, y1: 50, x2: 62, y2: 50, stroke: "#d62828", "stroke-width": 3 }));
        for (var x = 6; x < 62; x += 6) g.appendChild(S("line", { x1: x, y1: 47, x2: x, y2: 53, stroke: "#d62828", "stroke-width": 2 })); } },
    majorroad: { name: "major road", hint: "Long thick coloured lines: big roads where lots of cars drive.",
      draw: function (g) { g.appendChild(S("rect", { x: 4, y: 20, width: 56, height: 7, fill: "#f26b1d" }));
        g.appendChild(S("line", { x1: 4, y1: 42, x2: 60, y2: 42, stroke: "#111", "stroke-width": 5 }));
        g.appendChild(S("line", { x1: 4, y1: 42, x2: 60, y2: 42, stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "4 4" })); } },
    river: { name: "river", hint: "A long blue wiggly band: water that flows and moves.",
      draw: function (g) { g.appendChild(S("path", { d: "M2 38 C16 26, 26 26, 34 34 S52 42, 62 30", fill: "none", stroke: "#2e86de", "stroke-width": 11, "stroke-linecap": "round" }));
        g.appendChild(S("path", { d: "M2 38 C16 26, 26 26, 34 34 S52 42, 62 30", fill: "none", stroke: "#a9d6f5", "stroke-width": 6, "stroke-linecap": "round" })); } },
    beach: { name: "beach", hint: "Waves, sun and an umbrella: where you swim and play in the sand.",
      draw: function (g) { g.appendChild(S("circle", { cx: 22, cy: 30, r: 7, fill: "#f9c80e" }));
        g.appendChild(S("path", { d: "M30 30 A18 12 0 0 1 60 22 Z", fill: "#e63946" }));
        g.appendChild(S("line", { x1: 45, y1: 26, x2: 40, y2: 44, stroke: "#333", "stroke-width": 2 }));
        [42, 50, 58].forEach(function (y) { g.appendChild(S("path", { d: "M2 " + y + " q7 -6 14 0 t14 0 t14 0 t14 0 t14 0", fill: "none", stroke: "#1d7fd1", "stroke-width": 3 })); }); } },
    walking: { name: "walking track", hint: "A person on the move on a dotted path: where you go on foot.",
      draw: function (g) { g.appendChild(S("circle", { cx: 34, cy: 10, r: 6, fill: "#f26b1d" }));
        g.appendChild(S("path", { d: "M33 18 L28 34 L22 48 M30 30 L40 48 M31 20 L42 28 M31 20 L22 30", fill: "none", stroke: "#f26b1d", "stroke-width": 5, "stroke-linecap": "round" }));
        g.appendChild(S("line", { x1: 4, y1: 56, x2: 60, y2: 56, stroke: "#f26b1d", "stroke-width": 3, "stroke-dasharray": "4 3" })); } },
    park: { name: "park", hint: "A green space with grass, trees and benches.",
      draw: function (g) { g.appendChild(S("rect", { x: 8, y: 14, width: 48, height: 36, fill: "#8bc34a" })); } },
    railway: { name: "railway", hint: "One thin black line: the track where trains run.",
      draw: function (g) { g.appendChild(S("line", { x1: 4, y1: 32, x2: 60, y2: 32, stroke: "#222", "stroke-width": 3 })); } },
    bicycle: { name: "bicycle track", hint: "Two wheels and pedals in a blue square: a path for riding.",
      draw: function (g) { g.appendChild(S("rect", { x: 4, y: 10, width: 56, height: 44, rx: 4, fill: "#1f7fd6" }));
        g.appendChild(S("circle", { cx: 19, cy: 39, r: 8, fill: "none", stroke: "#fff", "stroke-width": 2.5 }));
        g.appendChild(S("circle", { cx: 45, cy: 39, r: 8, fill: "none", stroke: "#fff", "stroke-width": 2.5 }));
        g.appendChild(S("path", { d: "M19 39 L27 25 L40 25 L45 39 M27 25 L32 39 L40 25 M25 21 L30 21 M40 25 L38 19 L43 19", fill: "none", stroke: "#fff", "stroke-width": 2.5 })); } },
    hospital: { name: "hospital", hint: "A white cross on red: doctors and nurses help sick people there.",
      draw: function (g) { g.appendChild(S("rect", { x: 8, y: 8, width: 48, height: 48, fill: "#e02020" }));
        g.appendChild(S("path", { d: "M26 16 H38 V26 H48 V38 H38 V48 H26 V38 H16 V26 H26 Z", fill: "#fff" })); } },
    restaurant: { name: "restaurant", hint: "A fork, a plate and a knife: where you go out to eat.",
      draw: function (g) { g.appendChild(S("circle", { cx: 32, cy: 32, r: 15, fill: "#fff", stroke: "#888", "stroke-width": 3 }));
        g.appendChild(S("circle", { cx: 32, cy: 32, r: 10, fill: "none", stroke: "#bbb", "stroke-width": 2 }));
        g.appendChild(S("path", { d: "M9 12 V26 M6 12 V22 Q9 28 12 22 V12 M9 26 V54", fill: "none", stroke: "#888", "stroke-width": 2.5 }));
        g.appendChild(S("path", { d: "M55 12 Q50 24 52 34 L55 34 V54", fill: "none", stroke: "#888", "stroke-width": 3 })); } },
    hall: { name: "hall", hint: "A big important building with a flag on top, where people meet.",
      draw: function (g) { g.appendChild(S("path", { d: "M6 26 L32 14 L58 26 Z", fill: "#d9b48f" }));
        g.appendChild(S("rect", { x: 8, y: 26, width: 48, height: 28, fill: "#e8cba8", stroke: "#a07a50", "stroke-width": 2 }));
        [13, 21, 39, 47].forEach(function (x) { g.appendChild(S("rect", { x: x, y: 31, width: 5, height: 7, fill: "#6b4f2f" })); g.appendChild(S("rect", { x: x, y: 42, width: 5, height: 7, fill: "#6b4f2f" })); });
        g.appendChild(S("rect", { x: 29, y: 40, width: 7, height: 14, fill: "#4a3520" }));
        g.appendChild(S("line", { x1: 32, y1: 14, x2: 32, y2: 4, stroke: "#333", "stroke-width": 2 }));
        g.appendChild(S("rect", { x: 32, y: 4, width: 10, height: 6, fill: "#e02020" })); } },
    petrol: { name: "petrol station", hint: "A pump with a hose: cars stop there to fill up the tank.",
      draw: function (g) { g.appendChild(S("rect", { x: 14, y: 10, width: 26, height: 46, rx: 4, fill: "#222" }));
        g.appendChild(S("rect", { x: 19, y: 16, width: 16, height: 11, fill: "#ccc" }));
        g.appendChild(S("path", { d: "M40 20 L48 26 L48 48 Q48 54 52 50 L52 30", fill: "none", stroke: "#222", "stroke-width": 3 })); } },
    library: { name: "library", hint: "An open book: there you can borrow lots of books to read.",
      draw: function (g) { g.appendChild(S("path", { d: "M32 18 C24 12 12 12 6 16 L6 50 C12 46 24 46 32 52 C40 46 52 46 58 50 L58 16 C52 12 40 12 32 18 Z", fill: "#fff", stroke: "#4a2c17", "stroke-width": 3 }));
        g.appendChild(S("line", { x1: 32, y1: 18, x2: 32, y2: 52, stroke: "#4a2c17", "stroke-width": 3 }));
        [24, 31, 38].forEach(function (y) { g.appendChild(S("line", { x1: 12, y1: y, x2: 26, y2: y + 2, stroke: "#4a2c17", "stroke-width": 2 })); g.appendChild(S("line", { x1: 38, y1: y + 2, x2: 52, y2: y, stroke: "#4a2c17", "stroke-width": 2 })); }); } },
    // cartelli dal quaderno
    stop: { name: "stop sign", hint: "A red sign with eight sides: cars must wait here.",
      draw: function (g) { g.appendChild(S("path", { d: "M22 6 H42 L58 22 V42 L42 58 H22 L6 42 V22 Z", fill: "#d62828", stroke: "#fff", "stroke-width": 3 }));
        g.appendChild(T(32, 38, 15, "#fff", "STOP")); } },
    lights: { name: "traffic lights", hint: "Red, yellow and green: they tell cars when to go and when to wait.",
      draw: function (g) { g.appendChild(S("rect", { x: 22, y: 4, width: 20, height: 46, rx: 5, fill: "#333" }));
        g.appendChild(S("circle", { cx: 32, cy: 13, r: 5, fill: "#e53935" })); g.appendChild(S("circle", { cx: 32, cy: 27, r: 5, fill: "#fdd835" })); g.appendChild(S("circle", { cx: 32, cy: 41, r: 5, fill: "#43a047" }));
        g.appendChild(S("rect", { x: 30, y: 50, width: 4, height: 12, fill: "#555" })); } },
    speed: { name: "speed limit", hint: "A number in a red ring: cars must not drive faster than that.",
      draw: function (g) { g.appendChild(S("circle", { cx: 32, cy: 32, r: 25, fill: "#fff", stroke: "#d62828", "stroke-width": 7 }));
        g.appendChild(T(32, 41, 22, "#111", "50")); } },
    crossing: { name: "zebra crossing", hint: "White stripes across the road, like an animal from Africa: walk over here.",
      draw: function (g) { g.appendChild(S("rect", { x: 4, y: 8, width: 56, height: 48, fill: "#8e8e8e" }));
        [12, 22, 32, 42, 52].forEach(function (x) { g.appendChild(S("rect", { x: x - 3, y: 12, width: 6, height: 40, fill: "#fff" })); }); } },
    // per la mini-mappa
    house: { name: "house", hint: "A square with a pointy roof: people live in it.",
      draw: function (g) { g.appendChild(S("rect", { x: 16, y: 30, width: 32, height: 24, fill: "#e8a87c", stroke: "#7a3e1d", "stroke-width": 3 }));
        g.appendChild(S("path", { d: "M10 32 L32 12 L54 32 Z", fill: "#c0392b", stroke: "#7a3e1d", "stroke-width": 3, "stroke-linejoin": "round" })); } },
    school: { name: "school", hint: "A building with a flag where children go to learn.",
      draw: function (g) { g.appendChild(S("rect", { x: 10, y: 30, width: 44, height: 24, fill: "#f6d365", stroke: "#8a6d1d", "stroke-width": 3 }));
        g.appendChild(S("line", { x1: 32, y1: 30, x2: 32, y2: 8, stroke: "#333", "stroke-width": 3 }));
        g.appendChild(S("path", { d: "M32 9 L48 14 L32 19 Z", fill: "#e74c3c" }));
        [16, 28, 40].forEach(function (x) { g.appendChild(S("rect", { x: x, y: 37, width: 8, height: 8, fill: "#7fb3ff" })); }); } },
    lake: { name: "lake", hint: "Blue water that stays still in one place.",
      draw: function (g) { g.appendChild(S("path", { d: "M12 34 C10 18, 30 12, 42 16 C56 20, 58 38, 48 48 C38 56, 16 52, 12 34 Z", fill: "#7ec8f5", stroke: "#2e86de", "stroke-width": 3 })); } }
  };
  var SYM_SHEET = ["police", "worship", "train", "majorroad", "river", "beach", "walking", "park", "railway", "bicycle",
                   "hospital", "restaurant", "hall", "petrol", "library"];
  var SYM_EASY = ["police", "train", "river", "beach", "park", "bicycle", "hospital", "restaurant", "petrol", "library", "stop", "lights"];
  var SYM_ALL = SYM_SHEET.concat(["stop", "lights", "speed", "crossing"]);
  var MAP_PLACES = ["house", "school", "hospital", "police", "library", "restaurant", "lake", "park", "train", "petrol"];

  function symbolSvg(key, size) {
    var s = ui.svg("svg", { viewBox: "0 0 64 64", width: size || 64, height: size || 64, class: "msym" });
    SYMBOLS[key].draw(s);
    return s;
  }

  /* ---------- places in a town (emoji) + spelling traps ---------- */
  var PLACES = [
    { n: "school", e: "🏫", bad: ["scool", "skool"] }, { n: "hospital", e: "🏥", bad: ["hospitel", "hspital", "hospitl"] },
    { n: "library", e: "📚", bad: ["libary", "labrary", "librery"] }, { n: "post office", e: "🏤", bad: ["post ofice", "poost office"] },
    { n: "airport", e: "✈️", bad: ["airpot", "earport"] }, { n: "bank", e: "🏦", bad: ["benk", "banck"] },
    { n: "police station", e: "🚓", bad: ["polic station", "police stashin", "polise station"] },
    { n: "fire station", e: "🚒", bad: ["fire stashin", "fier station", "fire staion"] },
    { n: "bakery", e: "🥐", bad: ["bakry", "bakary", "backery"] }, { n: "bus stop", e: "🚏", bad: ["bus stopp", "bas stop"] },
    { n: "museum", e: "🏛️", bad: ["museam", "muzeum"] }, { n: "cafe", e: "☕", bad: ["caffe", "kafe"] },
    { n: "book shop", e: "📖", bad: ["book shopp", "bok shop"] }, { n: "theatre", e: "🎭", bad: ["thetre", "teatre"] },
    { n: "gym", e: "🏋️", bad: ["jym", "gimm"] }, { n: "restaurant", e: "🍽️", bad: ["resturant", "restorant", "restorad"] },
    { n: "zoo", e: "🦁", bad: ["zu", "zooo"] }, { n: "supermarket", e: "🛒", bad: ["soper market", "supermarkit", "supermarked"] },
    { n: "playground", e: "🛝", bad: ["playgrond", "plaiground"] }, { n: "pharmacy", e: "💊", bad: ["farmacy", "pharmasy"] },
    { n: "butcher", e: "🥩", bad: ["bucher", "butsher"] }, { n: "fish shop", e: "🐟", bad: ["fisch shop", "fish shopp"] },
    { n: "hairdresser", e: "💇", bad: ["hairdreser", "hairdrsser"] }, { n: "kiosk", e: "📰", bad: ["kiosck", "kiosc"] },
    { n: "swimming pool", e: "🏊", bad: ["swiming pool", "swimming pol"] }, { n: "farm", e: "🚜", bad: ["farme", "fahrm"] },
    { n: "train station", e: "🚉", bad: ["train stashion", "trein station"] }, { n: "church", e: "⛪", bad: ["chursh", "cherch"] },
    { n: "petrol station", e: "⛽", bad: ["petrol stashin", "petrole station"] }, { n: "clothes shop", e: "👕", bad: ["clothes shopp", "cloths shop"] }
  ];
  var WORDS_DIR = [
    { n: "North", e: "⬆️", bad: ["Nort", "Norht"] }, { n: "East", e: "➡️", bad: ["Eaest", "Eest"] },
    { n: "South", e: "⬇️", bad: ["Sauth", "Souht"] }, { n: "West", e: "⬅️", bad: ["Vest", "Wesst"] },
    { n: "straight", e: "⬆️", bad: ["strait", "straigt", "stait"] }, { n: "turn", e: "↪️", bad: ["tern", "torn"] },
    { n: "left", e: "⬅️", bad: ["lefft", "leaft"] }, { n: "right", e: "➡️", bad: ["rite", "rigt", "riht"] }
  ];
  var HINT_SPELL = "Say the word slowly and listen to every sound. Then check each letter, one by one.";

  function placesRound(level) {
    if (level >= 2 && Math.random() < 0.45) {
      var w = Math.random() < 0.7 ? pick(PLACES) : pick(WORDS_DIR);
      return { topic: "places", kind: "spell", emoji: w.e, word: w.n, q: "Which one is spelled right?",
        say: "How do you spell " + w.n + "?", ans: w.n, opts: [w.n].concat(w.bad), hint: HINT_SPELL };
    }
    var p = pick(PLACES);
    var others = PLACES.filter(function (x) { return x.n !== p.n; }).map(function (x) { return x.n; });
    return { topic: "places", kind: "place", emoji: p.e, q: "What is this place?", ans: p.n, pool: others,
      hint: "Look closely at the picture. Who works there, and what do people do there?" };
  }

  /* ---------- town, city, countryside, me → world ---------- */
  var CITY_PLACES = ["a big airport", "a university", "skyscrapers", "a big football stadium", "a zoo", "lots of museums",
                     "trams and lots of buses", "a very big hospital", "factories with tall chimneys", "lots of traffic and big roads"];
  var TOWN_THINGS = ["a few shops and a small train station", "one high street and a market square",
                     "a small library and a few cafés", "a small school and a post office"];
  var COUNTRY_THINGS = ["farms and tractors", "big fields and cows", "lots of trees and very few houses", "barns and haystacks"];
  function townCityRound(level) {
    var r = Math.random(), two = ["town", "city"], three = ["village", "town", "city"];
    var bigHint = "Big, special places need lots and lots of people. Which one is the BIGGER place?";
    var smallHint = "Only a few small things… is that the BIGGER place or the SMALLER place?";
    if (level >= 2 && r < 0.3) {
      var x = pick([
        { q: "Switzerland is my …", ans: "country", opts: ["street", "country", "continent"], hint: "Think of the circles in your workbook: me, street, town, then the land with its own flag." },
        { q: "Europe is my …", ans: "continent", opts: ["town", "country", "continent"], hint: "Think of the circles: it's bigger than one land, and smaller than the whole world." },
        { q: "Which is bigger?", ans: "continent", opts: ["country", "continent"], hint: "Think of the circles: me, street, town, land, then a big group of lands, then the world." },
        { q: "Which is the biggest circle of all?", ans: "world", opts: ["town", "country", "world"], hint: "It has every land and every sea in it." },
        { q: "Which is the smallest circle?", ans: "me", opts: ["me", "street", "town"], hint: "The circle in the middle of the page has your picture in it." },
        { q: "Which comes after street?", ans: "town", opts: ["town", "world", "me"], hint: "Me → street → … → country → continent → world." }
      ]);
      return { topic: "town", q: x.q, ans: x.ans, opts: x.opts, hint: x.hint };
    }
    if (level >= 2 && r < 0.5) {
      return Math.random() < 0.6
        ? { topic: "town", q: "Where do you see " + pick(COUNTRY_THINGS) + "?", ans: "countryside", opts: ["city", "countryside"], hint: "Is it full of buildings and cars, or full of nature and animals?" }
        : { topic: "town", q: "Where do you see " + pick(["tall buildings and factories", "cranes, trains and lots of cars", "skyscrapers"]) + "?", ans: "city", opts: ["city", "countryside"], hint: "Is it full of nature and animals, or full of buildings and cars?" };
    }
    if (level >= 3 && r < 0.62) {
      var q = pick([
        { q: "Village, town, city: which one is the SMALLEST?", ans: "village", hint: "Think of the order from small to big: a few houses, then more, then lots and lots." },
        { q: "Village, town, city: which one is the BIGGEST?", ans: "city", hint: "Think of the order from small to big: a few houses, then more, then lots and lots." },
        { q: "Which one is bigger than a village but smaller than a city?", ans: "town", hint: "It's the one in the middle." }
      ]);
      return { topic: "town", q: q.q, ans: q.ans, opts: three, hint: q.hint };
    }
    if (r < 0.7) {
      return pick([
        { topic: "town", q: "Which is bigger: a town or a city?", ans: "city", opts: two, hint: "Lots and lots of people live in the bigger one, with tall buildings and an airport." },
        { topic: "town", q: "Which is smaller: a town or a city?", ans: "town", opts: two, hint: "The smaller one has fewer people and fewer buildings." },
        { topic: "town", q: "Zürich has an airport, a zoo, a university and lots of trams. Zürich is a …", ans: "city", opts: two, hint: bigHint },
        { topic: "town", q: "More people live in a …", ans: "city", opts: two, hint: "The bigger place has more houses and more people." },
        { topic: "town", q: "This place has " + pick(TOWN_THINGS) + ". Is it a town or a city?", ans: "town", opts: two, hint: smallHint }
      ]);
    }
    return { topic: "town", q: "Where would you find " + pick(CITY_PLACES) + ": in a town or in a city?", ans: "city", opts: two, hint: bigHint };
  }

  /* ---------- compass: rose (8 points), mini-map, grid walk ---------- */
  function dirOptions(d, eight) {
    var pool = eight ? DIR8 : [DIR8[0], DIR8[2], DIR8[4], DIR8[6]];
    return pool;
  }
  function compassRound(level) {
    var r = Math.random();
    if (level >= 2 && r < 0.35) return gridRound(level);
    if (level >= 2 && r < 0.6) return mapRound(level);
    if (r < 0.15) {
      var x = pick([
        { q: "What is opposite North?", ans: "South", hint: "Opposite means on the other side: if North is at the top, look at the bottom." },
        { q: "What is opposite East?", ans: "West", hint: "Opposite means on the other side of the compass." },
        { q: "What is opposite North-East?", ans: "South-West", hint: "Opposite means on the other side: both parts swap." },
        { q: "What is between North and East?", ans: "North-East", hint: HINT_DIAG },
        { q: "What is between South and West?", ans: "South-West", hint: HINT_DIAG },
        { q: "Start at North and go round clockwise. What comes after East?", ans: "South-East", hint: HINT_NESW }
      ]);
      return { topic: "compass", kind: "text", q: x.q, ans: x.ans, opts: DIR8, n: 4, hint: x.hint };
    }
    var d = level <= 1 && Math.random() < 0.5 ? ui.randInt(0, 3) * 2 : ui.randInt(0, 7);
    if (Math.random() < 0.3) {
      return { topic: "compass", kind: "rose", dir: d, letters: true, q: "Which letters go on the pink arrow?",
        ans: SHORT8[d], opts: SHORT8, n: 4, hint: d % 2 ? HINT_DIAG : HINT_NESW };
    }
    return { topic: "compass", kind: "rose", dir: d, letters: false, q: "Which direction does the pink arrow show?",
      ans: DIR8[d], opts: DIR8, n: 4, hint: d % 2 ? HINT_DIAG : HINT_NESW };
  }

  // mini-map 3×3: one place in the middle, another one in one of the 8 directions
  function mapRound(level) {
    var pool = ui.shuffle(MAP_PLACES);
    var center = pool[0], other = pool[1], d = ui.randInt(0, 7);
    var free = [];
    STEP8.forEach(function (s, i) { if (i !== d) free.push(i); });
    var extra = ui.shuffle(free).slice(0, level >= 3 ? 3 : 1).map(function (i, j) { return { key: pool[2 + j], dir: i }; });
    return { topic: "compass", kind: "map", center: center, other: other, dir: d, extra: extra,
      q: "The " + SYMBOLS[other].name + " is ___ of the " + SYMBOLS[center].name + ".",
      ans: DIR8[d], opts: DIR8, n: 4,
      hint: "Put your finger on the " + SYMBOLS[center].name + " and look at the little compass. " + (d % 2 ? HINT_DIAG : "N is at the top, then go round clockwise.") };
  }

  // griglia come "Compass Directions": dalla stella, "go north 2 squares" → dove sei?
  var GRID = 5;
  function gridRound(level) {
    for (var guard = 0; guard < 200; guard++) {
      var sc = ui.randInt(0, GRID - 1), sr = ui.randInt(0, GRID - 1);
      var moves = [], c = sc, rr = sr, ok = true, nMoves = level >= 4 && Math.random() < 0.6 ? 2 : 1;
      for (var m = 0; m < nMoves; m++) {
        var d = level <= 2 && Math.random() < 0.5 ? ui.randInt(0, 3) * 2 : ui.randInt(0, 7);
        var k = ui.randInt(1, d % 2 ? 2 : 3);
        c += STEP8[d][0] * k; rr += STEP8[d][1] * k;
        if (c < 0 || rr < 0 || c >= GRID || rr >= GRID) { ok = false; break; }
        moves.push({ d: d, k: k });
      }
      if (!ok || (c === sc && rr === sr)) continue;
      var names = ui.shuffle(PLACES.slice()), used = {}, cells = {};
      function put(col, row) {
        var key = col + "," + row;
        if (col < 0 || row < 0 || col >= GRID || row >= GRID || cells[key] || (col === sc && row === sr)) return null;
        var p = names.pop(); cells[key] = p; return p;
      }
      var target = put(c, rr);
      // trappole: direzione opposta, un passo in più/in meno, diagonale specchiata
      var last = moves[moves.length - 1], pc = c - STEP8[last.d][0] * last.k, pr = rr - STEP8[last.d][1] * last.k;
      var traps = [];
      var opp = (last.d + 4) % 8; traps.push([pc + STEP8[opp][0] * last.k, pr + STEP8[opp][1] * last.k]);
      traps.push([c + STEP8[last.d][0], rr + STEP8[last.d][1]]);
      if (last.k > 1) traps.push([c - STEP8[last.d][0], rr - STEP8[last.d][1]]);
      var mir = last.d % 2 ? (8 - last.d) % 8 : (last.d + 2) % 8; traps.push([pc + STEP8[mir][0] * last.k, pr + STEP8[mir][1] * last.k]);
      var trapNames = [];
      traps.forEach(function (t) { var p = put(t[0], t[1]); if (p) trapNames.push(p.n); });
      while (Object.keys(cells).length < 8) put(ui.randInt(0, GRID - 1), ui.randInt(0, GRID - 1));
      var text = moves.map(function (mv, i) { return (i ? "then go " : "Go ") + LOWER8[mv.d] + " " + mv.k + (mv.k > 1 ? " squares" : " square"); }).join(", ");
      var all = Object.keys(cells).map(function (k2) { return cells[k2].n; }).filter(function (n) { return n !== target.n; });
      return { topic: "compass", kind: "grid", start: [sc, sr], cells: cells, q: "Start at the ⭐. " + text + ". Where are you now?",
        ans: target.n, traps: trapNames, pool: all,
        hint: "Count the squares with your finger, one jump at a time. North is up, South is down. " + (moves.some(function (mv) { return mv.d % 2; }) ? "In-between directions go diagonally, corner to corner." : HINT_NESW) };
    }
    return mapRound(level);
  }

  /* ---------- directions: arrow signs, first left / second right ---------- */
  var SIGNS = [{ ans: "go straight", path: "M32 50 V16 M22 26 L32 14 L42 26" },
               { ans: "turn left", path: "M40 52 V30 Q40 22 32 22 H16 M24 13 L14 22 L24 31" },
               { ans: "turn right", path: "M24 52 V30 Q24 22 32 22 H48 M40 13 L50 22 L40 31" }];
  var STREET_SPOTS = { L1: [28, 172], R1: [192, 172], L2: [28, 92], R2: [192, 92], END: [110, 18] };
  function directionsRound(level) {
    if (level <= 1 || Math.random() < 0.3) {
      var s = ui.randInt(0, 2);
      return { topic: "dir", kind: "sign", sign: s, q: "What does this sign tell you?", ans: SIGNS[s].ans,
        opts: ["go straight", "turn left", "turn right"], hint: "Follow the white arrow with your finger, from the bottom to the tip. Does it bend? Which way?" };
    }
    var names = ui.shuffle(PLACES.slice()).slice(0, 5), spots = {};
    ["L1", "R1", "L2", "R2", "END"].forEach(function (k, i) { spots[k] = names[i]; });
    var x = pick([
      { k: "L1", t: "Go straight ahead. Take the first left." }, { k: "R1", t: "Go straight ahead. Take the first right." },
      { k: "L2", t: "Go straight ahead. Take the second left." }, { k: "R2", t: "Go straight ahead. Take the second right." },
      { k: "END", t: "Go straight to the end of the road." }
    ]);
    var mirror = { L1: ["R1", "L2"], R1: ["L1", "R2"], L2: ["R2", "L1"], R2: ["L2", "R1"], END: ["L2", "R2"] }[x.k];
    return { topic: "dir", kind: "street", spots: spots, q: "You are at the ⭐ and you walk up the street. " + x.t + " Where are you?",
      ans: spots[x.k].n, traps: mirror.map(function (k) { return spots[k].n; }),
      hint: "Your left hand makes an L with the thumb and finger. First = the street closest to the star, second = the next one." };
  }

  /* ---------- drawing ---------- */
  function compassRose(dir, letters) {
    var s = ui.svg("svg", { viewBox: "0 0 220 220", width: 230, height: 230, class: "rose" });
    var cx = 110, cy = 110;
    s.appendChild(S("circle", { cx: cx, cy: cy, r: 62, fill: "#fff", stroke: "#6a4bb6", "stroke-width": 3 }));
    for (var i = 0; i < 8; i++) {
      var a = i * Math.PI / 4, R = i % 2 ? 42 : 66, w = i % 2 ? 7 : 11;
      var tx = cx + R * Math.sin(a), ty = cy - R * Math.cos(a);
      var px = Math.cos(a) * w, py = Math.sin(a) * w;
      s.appendChild(S("path", { d: "M" + tx + " " + ty + " L" + (cx + px) + " " + (cy + py) + " L" + (cx - px) + " " + (cy - py) + " Z",
        fill: i === dir ? "#ec4899" : (i % 2 ? "#fcd9a8" : "#c4b5fd"), stroke: "#4b2e83", "stroke-width": 1.5 }));
    }
    s.appendChild(S("circle", { cx: cx, cy: cy, r: 5, fill: "#4b2e83" }));
    for (var j = 0; j < 8; j++) {
      var b = j * Math.PI / 4, LR = j % 2 ? 80 : 90, lx = cx + LR * Math.sin(b), ly = cy - LR * Math.cos(b);
      if (j === dir) { s.appendChild(S("circle", { cx: lx, cy: ly, r: 16, fill: "#fde047", stroke: "#ec4899", "stroke-width": 3 })); s.appendChild(T(lx, ly + 7, 20, "#2b2350", "?")); }
      else if (!letters) s.appendChild(T(lx, ly + 6, j % 2 ? 14 : 18, "#2b2350", SHORT8[j]));
    }
    return s;
  }

  function miniMap(round) {
    var cell = 71, s = ui.svg("svg", { viewBox: "0 0 260 230", width: 260, height: 230, class: "minimap" });
    s.appendChild(S("rect", { x: 2, y: 2, width: 214, height: 214, rx: 10, fill: "#f3f9e8", stroke: "#3c763d", "stroke-width": 3 }));
    for (var i = 1; i < 3; i++) {
      s.appendChild(S("line", { x1: 2 + i * cell, y1: 4, x2: 2 + i * cell, y2: 214, stroke: "#cfe3b8", "stroke-width": 2 }));
      s.appendChild(S("line", { x1: 4, y1: 2 + i * cell, x2: 214, y2: 2 + i * cell, stroke: "#cfe3b8", "stroke-width": 2 }));
    }
    function put(key, c, r) {
      var g = ui.svg("g", { transform: "translate(" + (9 + c * cell) + "," + (9 + r * cell) + ")" });
      g.appendChild(symbolSvg(key, 58)); s.appendChild(g);
    }
    put(round.center, 1, 1);
    put(round.other, 1 + STEP8[round.dir][0], 1 + STEP8[round.dir][1]);
    (round.extra || []).forEach(function (x) { put(x.key, 1 + STEP8[x.dir][0], 1 + STEP8[x.dir][1]); });
    s.appendChild(S("path", { d: "M240 20 L248 48 L240 42 L232 48 Z", fill: "#ec4899" }));
    s.appendChild(T(240, 16, 16, "#2b2350", "N"));
    return s;
  }

  function gridMap(round) {
    var cell = 62, W = GRID * cell, s = ui.svg("svg", { viewBox: "0 0 " + (W + 44) + " " + (W + 4), width: W + 44, height: W + 4, class: "minimap" });
    s.appendChild(S("rect", { x: 2, y: 2, width: W, height: W, fill: "#fff", stroke: "#333", "stroke-width": 2 }));
    for (var i = 1; i < GRID; i++) {
      s.appendChild(S("line", { x1: 2 + i * cell, y1: 2, x2: 2 + i * cell, y2: W + 2, stroke: "#333", "stroke-width": 1.2 }));
      s.appendChild(S("line", { x1: 2, y1: 2 + i * cell, x2: W + 2, y2: 2 + i * cell, stroke: "#333", "stroke-width": 1.2 }));
    }
    Object.keys(round.cells).forEach(function (k) {
      var p = k.split(","), c = +p[0], r = +p[1], pl = round.cells[k];
      s.appendChild(T(2 + c * cell + cell / 2, 2 + r * cell + 36, 28, "#000", pl.e, { "font-weight": 400 }));
      s.appendChild(T(2 + c * cell + cell / 2, 2 + r * cell + 55, 9, "#333", pl.n, { "font-weight": 700 }));
    });
    var sx = 2 + round.start[0] * cell + cell / 2, sy = 2 + round.start[1] * cell + cell / 2;
    s.appendChild(S("circle", { cx: sx, cy: sy, r: 22, fill: "#4caf50" }));
    s.appendChild(T(sx, sy + 10, 26, "#fff", "⭐", { "font-weight": 400 }));
    var nx = W + 24;
    s.appendChild(S("path", { d: "M" + nx + " 22 L" + (nx + 8) + " 50 L" + nx + " 44 L" + (nx - 8) + " 50 Z", fill: "#ec4899" }));
    s.appendChild(T(nx, 18, 16, "#2b2350", "N"));
    return s;
  }

  function signSvg(i) {
    var s = ui.svg("svg", { viewBox: "0 0 64 64", width: 150, height: 150 });
    s.appendChild(S("circle", { cx: 32, cy: 32, r: 29, fill: "#1f6fd1", stroke: "#fff", "stroke-width": 3 }));
    s.appendChild(S("path", { d: SIGNS[i].path, fill: "none", stroke: "#fff", "stroke-width": 6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    return s;
  }

  function streetMap(round) {
    var s = ui.svg("svg", { viewBox: "0 0 220 250", width: 250, height: 284, class: "minimap" });
    s.appendChild(S("rect", { x: 0, y: 0, width: 220, height: 250, rx: 12, fill: "#9ccc65" }));
    s.appendChild(S("rect", { x: 96, y: 34, width: 28, height: 216, fill: "#777" }));
    s.appendChild(S("rect", { x: 46, y: 160, width: 128, height: 24, fill: "#777" }));
    s.appendChild(S("rect", { x: 46, y: 80, width: 128, height: 24, fill: "#777" }));
    s.appendChild(S("line", { x1: 110, y1: 40, x2: 110, y2: 248, stroke: "#fff", "stroke-width": 2, "stroke-dasharray": "8 7" }));
    Object.keys(STREET_SPOTS).forEach(function (k) {
      var p = STREET_SPOTS[k], pl = round.spots[k];
      s.appendChild(S("circle", { cx: p[0], cy: p[1], r: 20, fill: "#fff", stroke: "#555", "stroke-width": 1.5 }));
      s.appendChild(T(p[0], p[1] + 9, 24, "#000", pl.e, { "font-weight": 400 }));
      s.appendChild(T(p[0], p[1] + 32, 9, "#1b1b1b", pl.n, { "font-weight": 700 }));
    });
    s.appendChild(T(110, 244, 24, "#000", "⭐", { "font-weight": 400 }));
    return s;
  }

  /* ---------- choices ---------- */
  // n scelte dalla lista opts (sempre con la giusta dentro), rimescolate a ogni tentativo
  function subset(ans, opts, n) {
    var others = ui.shuffle(opts.filter(function (o) { return o !== ans; })).slice(0, (n || opts.length) - 1);
    return ui.shuffle([ans].concat(others));
  }
  // giusta + trappole (se ci sono) + altri del pool, 3 in tutto
  function trapChoices(round) {
    var traps = ui.shuffle((round.traps || []).filter(function (t) { return t !== round.ans; }));
    var rest = ui.shuffle((round.pool || []).filter(function (t) { return t !== round.ans && traps.indexOf(t) < 0; }));
    return ui.shuffle([round.ans].concat(traps.concat(rest).slice(0, 2)));
  }
  function symbolOptions(round) {
    var others = ui.shuffle(round.pool.filter(function (k) { return k !== round.key; })).slice(0, 2);
    return ui.shuffle([round.key].concat(others));
  }
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

  /* ---------- symbols topic ---------- */
  function symbolRound(level) {
    var pool = level <= 1 ? SYM_EASY : SYM_ALL;
    var key = pick(pool);
    if (level >= 3 && Math.random() < 0.15) {
      var x = pick([
        { q: "Why do maps use symbols?", ans: "they are small and quick to read", opts: ["they are small and quick to read", "they make the map heavy", "nobody knows"], hint: "A map is small, but the world is big. Is there space to write long words everywhere?" },
        { q: "Where can you find what the symbols mean?", ans: "in the key", opts: ["in the key", "on the back of the paper", "in the compass"], hint: "Every good map has a little box that explains the symbols. Look at the Maptown Zoo page." },
        { q: "On a map, what colour is water?", ans: "blue", opts: ["blue", "green", "brown"], hint: "Think of the sea, the rivers and the lakes." },
        { q: "On a map, what colour are parks?", ans: "green", opts: ["green", "blue", "grey"], hint: "Think of the colour of grass and leaves." }
      ]);
      return { topic: "symbol", kind: "fact", q: x.q, ans: x.ans, opts: x.opts, hint: x.hint };
    }
    var reverse = level >= 2 && Math.random() < 0.4;
    return { topic: "symbol", kind: reverse ? "find" : "name", key: key, pool: pool, ans: SYMBOLS[key].name,
      q: reverse ? "Which symbol shows the " + SYMBOLS[key].name + "?" : "What does this map symbol mean?",
      hint: SYMBOLS[key].hint };
  }

  MM.games.maps = {
    id: "maps", nameKey: "g_maps", subKey: "g_maps_sub", emoji: "🧭", gem: "🗺️", rounds: 10, lang: "en",

    // 5 temi a rotazione (idx % 5): compass · symbols · directions · places · town/city
    // 1: rosa a 8 punti, simboli facili, cartelli-freccia, luoghi, town/city
    // 2: + griglia "go north 2 squares", mini-mappa a 8 direzioni, tutti i simboli, "which symbol", first left/second right,
    //    spelling, countryside e me → world · 3: + village/town/city, perché i simboli · 4-5: griglia con 2 mosse, più luoghi
    makeRound: function (level, idx) {
      var k = (idx || 0) % 5;
      if (k === 0) return compassRound(level);
      if (k === 1) return symbolRound(level);
      if (k === 2) return directionsRound(level);
      if (k === 3) return placesRound(level);
      return townCityRound(level);
    },

    render: function (mount, round, api) {
      if (round.say) { api.prompt(round.q, true); MM.audio.speak(round.say); } else api.prompt(round.q);
      var holder = ui.el("div", { class: "holder words maps-holder" });
      var pic;
      if (round.kind === "rose") pic = compassRose(round.dir, round.letters);
      else if (round.kind === "map") pic = miniMap(round);
      else if (round.kind === "grid") pic = gridMap(round);
      else if (round.kind === "street") pic = streetMap(round);
      else if (round.kind === "sign") pic = signSvg(round.sign);
      else if (round.kind === "name") { pic = symbolSvg(round.key, 120); }
      else if (round.kind === "place" || round.kind === "spell") pic = ui.el("div", { class: "maps-emoji big" }, [round.emoji]);
      else pic = ui.el("div", { class: "maps-emoji" }, [round.topic === "town" ? "🏘️ 🏙️ 🌍" : round.topic === "symbol" ? "🗺️" : "🧭"]);
      mount.appendChild(ui.el("div", { class: "maps-pic" + (round.kind === "name" ? " sym-big" : "") }, [pic]));
      mount.appendChild(holder);
      function done(ok) { api.submit(ok, { recall: true, hint: round.hint }); }
      if (round.kind === "find") return askSymbols(holder, round, done);
      if (round.kind === "name") {
        return ui.askChoices(holder, SYMBOLS[round.key].name, function () {
          return symbolOptions(round).map(function (k) { return SYMBOLS[k].name; });
        }, done);
      }
      if (round.kind === "grid" || round.kind === "street" || round.kind === "place") {
        return ui.askChoices(holder, round.ans, function () { return trapChoices(round); }, done);
      }
      ui.askChoices(holder, round.ans, function () { return subset(round.ans, round.opts, round.n || 3); }, done);
    }
  };
  MM.maps = { SYMBOLS: SYMBOLS, SYM_SHEET: SYM_SHEET, symbolSvg: symbolSvg, PLACES: PLACES, signSvg: signSvg, compassRose: compassRose };
})();
