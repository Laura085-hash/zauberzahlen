/* Test automatico: DOM finto in Node, gioca tutte le sessioni di tutti i giochi a tutti i livelli.
   Verifica: nessun crash, ogni sessione arriva alla ricompensa, dopo un errore NON viene mai
   rivelata la risposta (nessun .choice.correct), compare un suggerimento e non si avanza.
   Uso:  node tests/run.js */
"use strict";
var fs = require("fs"), path = require("path"), assert = require("assert");
var ROOT = path.join(__dirname, "..");

/* ---------- DOM finto ---------- */
function Txt(d) { this.data = String(d); this.nodeType = 3; this.parentNode = null; }
Object.defineProperty(Txt.prototype, "textContent", { get: function () { return this.data; } });

function Node(tag) {
  this.tag = String(tag).toLowerCase(); this.tagName = this.tag.toUpperCase(); this.nodeType = 1;
  this.childNodes = []; this.parentNode = null; this.attrs = {}; this._cls = []; this.style = {};
  this.listeners = {}; this.hidden = false; this.value = "";
}
Node.prototype = {
  get children() { return this.childNodes.filter(function (n) { return n.nodeType === 1; }); },
  get firstChild() { return this.childNodes[0] || null; },
  appendChild: function (n) { if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; this.childNodes.push(n); return n; },
  removeChild: function (n) { var i = this.childNodes.indexOf(n); if (i < 0) throw new Error("removeChild: not a child"); this.childNodes.splice(i, 1); n.parentNode = null; return n; },
  get className() { return this._cls.join(" "); },
  set className(v) { this._cls = String(v).split(/\s+/).filter(Boolean); },
  get classList() {
    var self = this;
    return {
      add: function () { for (var i = 0; i < arguments.length; i++) if (self._cls.indexOf(arguments[i]) < 0) self._cls.push(arguments[i]); },
      remove: function () { for (var i = 0; i < arguments.length; i++) { var k = self._cls.indexOf(arguments[i]); if (k >= 0) self._cls.splice(k, 1); } },
      toggle: function (c) { var k = self._cls.indexOf(c); if (k >= 0) { self._cls.splice(k, 1); return false; } self._cls.push(c); return true; },
      contains: function (c) { return self._cls.indexOf(c) >= 0; }
    };
  },
  setAttribute: function (k, v) { if (k === "class") this.className = v; else this.attrs[k] = String(v); },
  getAttribute: function (k) { return k === "class" ? this.className : (k in this.attrs ? this.attrs[k] : null); },
  get textContent() { return this.childNodes.map(function (c) { return c.textContent; }).join(""); },
  set textContent(v) { this.childNodes.forEach(function (c) { c.parentNode = null; }); this.childNodes = []; if (v != null && v !== "") this.appendChild(new Txt(v)); },
  set innerHTML(v) { this.textContent = v; },
  addEventListener: function (t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); },
  removeEventListener: function (t, fn) { var l = this.listeners[t] || []; var i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); },
  dispatch: function (t, ev) { ev = ev || { type: t, target: this, preventDefault: function () {}, key: "" }; (this.listeners[t] || []).slice().forEach(function (fn) { fn(ev); }); },
  click: function () { this.dispatch("click"); },
  focus: function () {},
  get offsetWidth() { return 100; },
  all: function () { var out = []; (function walk(n) { n.childNodes.forEach(function (c) { if (c.nodeType === 1) { out.push(c); walk(c); } }); })(this); return out; },
  querySelectorAll: function (sel) {
    var chain = sel.trim().split(/\s+/).map(parseCompound);
    return this.all().filter(function (n) { return matchChain(n, chain, chain.length - 1); });
  },
  querySelector: function (sel) { return this.querySelectorAll(sel)[0] || null; }
};
function parseCompound(s) {
  var c = { tag: null, cls: [], attrs: [] };
  var m = s.match(/^[a-z]+/i); if (m) c.tag = m[0].toLowerCase();
  var re = /\.([\w-]+)|\[([\w-]+)="([^"]*)"\]/g, x;
  while ((x = re.exec(s))) { if (x[1]) c.cls.push(x[1]); else c.attrs.push([x[2], x[3]]); }
  return c;
}
function matches(n, c) {
  if (c.tag && n.tag !== c.tag) return false;
  for (var i = 0; i < c.cls.length; i++) if (n._cls.indexOf(c.cls[i]) < 0) return false;
  for (var j = 0; j < c.attrs.length; j++) if (n.getAttribute(c.attrs[j][0]) !== c.attrs[j][1]) return false;
  return true;
}
function matchChain(n, chain, idx) {
  if (!matches(n, chain[idx])) return false;
  if (idx === 0) return true;
  var p = n.parentNode;
  while (p && p.nodeType === 1) { if (matchChain(p, chain, idx - 1)) return true; p = p.parentNode; }
  return false;
}

var appNode = new Node("div"), fxNode = new Node("div"), body = new Node("body"), html = new Node("html");
body.appendChild(appNode); body.appendChild(fxNode);
var store = {};
global.window = global;
global.document = {
  createElement: function (t) { return new Node(t); },
  createElementNS: function (ns, t) { return new Node(t); },
  createTextNode: function (d) { return new Txt(d); },
  getElementById: function (id) { return id === "app" ? appNode : id === "fx" ? fxNode : null; },
  body: body, documentElement: html, title: ""
};
global.localStorage = { getItem: function (k) { return k in store ? store[k] : null; }, setItem: function (k, v) { store[k] = String(v); }, removeItem: function (k) { delete store[k]; } };
try { Object.defineProperty(global, "navigator", { value: {}, configurable: true }); } catch (e) {}
global.location = { protocol: "file:" };
global.addEventListener = function () {}; global.removeEventListener = function () {};
global.confirm = function () { return true; };

/* timer finti, deterministici */
var timers = [], now = 0, tid = 0;
global.setTimeout = function (fn, ms) { timers.push({ fn: fn, at: now + (ms || 0), id: ++tid }); return tid; };
global.clearTimeout = function (id) { timers = timers.filter(function (t) { return t.id !== id; }); };
function flush() {
  var guard = 0;
  while (timers.length && guard++ < 10000) {
    timers.sort(function (a, b) { return a.at - b.at || a.id - b.id; });
    var t = timers.shift(); now = t.at; t.fn();
  }
}

/* ---------- carica l'app ---------- */
["js/i18n.js", "js/storage.js", "js/audio.js", "js/ui.js",
 "js/games/subitizing.js", "js/games/fives.js", "js/games/bonds.js", "js/games/addition.js", "js/games/subtraction.js",
 "js/games/tens.js", "js/games/hundred.js", "js/games/neighbours.js", "js/games/numberline.js", "js/games/patterns.js",
 "js/games/wall.js", "js/games/triangle.js", "js/games/diktat.js", "js/parent.js", "js/app.js"
].forEach(function (f) { (new Function(fs.readFileSync(path.join(ROOT, f), "utf8")))(); });

var spoken = [];
MM.audio.speak = function (text, lang) { spoken.push({ text: String(text), lang: lang || MM.i18n.voiceLang() }); };

/* ---------- helper ---------- */
function setLevel(id, level) {
  var data = JSON.parse(store["mm.v1"] || "{}"); data.skills = data.skills || {};
  data.skills[id] = { level: level, attempts: 0, correct: 0, recent: [], recall: { c: 0, t: 0 }, count: { c: 0, t: 0 }, sessions: 0 };
  store["mm.v1"] = JSON.stringify(data);
}
function dotsDone() { return appNode.querySelectorAll(".progress-dots i.on").length + appNode.querySelectorAll(".progress-dots i.late").length; }
function num(s) { var m = String(s).match(/\d+/); return m ? parseInt(m[0], 10) : null; }
function lastGerman() { for (var i = spoken.length - 1; i >= 0; i--) if (spoken[i].lang === "de-DE") return spoken[i].text; return null; }

var stats = { wrong: 0, rounds: 0, sessions: 0 };

function expectWrongFeedback(before, where) {
  var hint = appNode.querySelector(".hint");
  assert.ok(hint && !hint.hidden && hint.textContent.length > 4, where + ": manca il suggerimento dopo l'errore");
  assert.strictEqual(appNode.querySelectorAll(".choice.correct").length, 0, where + ": RIVELATA la risposta giusta dopo un errore!");
  assert.strictEqual(dotsDone(), before, where + ": avanzato dopo un errore");
  stats.wrong++;
}

function drive(id, level) {
  setLevel(id, level); spoken = []; timers = [];
  MM.app.runSession(id);
  var where = id + " L" + level, guard = 0, lastSig = "", same = 0;
  while (!appNode.querySelector(".reward")) {
    flush();
    if (appNode.querySelector(".reward")) break;
    if (guard++ > 4000) throw new Error(where + ": troppe iterazioni");
    var before = dotsDone();

    // 1) scelte a bottoni
    var free = appNode.querySelectorAll(".choice").filter(function (b) { return !b.classList.contains("wrong") && !b.classList.contains("correct"); });
    if (free.length) {
      var b = free[Math.floor(Math.random() * free.length)];
      b.click();
      if (b.classList.contains("wrong")) expectWrongFeedback(before, where);
      continue;
    }
    // 2) scrittura (Diktat)
    var inp = appNode.querySelector(".typein");
    if (inp) {
      var check = appNode.querySelector(".check");
      var S = lastGerman(); assert.ok(S, where + ": nessuna parola tedesca pronunciata");
      var target = S;
      var sent = appNode.querySelector(".sentence");
      if (sent) {
        var spans = sent.children; var p0 = spans[0].textContent, rest = spans[2].textContent;
        target = S.slice(p0.length, S.length - rest.length);
        assert.ok(target && S.indexOf(target) >= 0, where + ": parola mancante non ricavabile");
      }
      // prima sbaglio apposta (minuscola / lettere sbagliate), poi scrivo giusto
      inp.value = target.toLowerCase() === target ? "xyz" : target.toLowerCase(); check.click();
      expectWrongFeedback(before, where);
      assert.ok(appNode.querySelector(".diff") || appNode.querySelector(".hint"), where + ": nessun feedback visivo sull'errore");
      inp.value = target; check.click();
      assert.ok(dotsDone() === before + 1 || appNode.querySelector(".reward") || timers.length, where + ": risposta giusta non accettata: " + target);
      continue;
    }
    // 3) costruzione (Kraft der 5 / Zehner legen)
    var chk = appNode.querySelector(".check");
    if (chk) {
      var n = num(appNode.querySelector(".prompt").textContent);
      chk.click(); expectWrongFeedback(before, where);             // vuoto = sbagliato
      var bb = appNode.querySelectorAll(".build-btns .btn");
      if (bb.length) { for (var i = 0; i < Math.floor(n / 10); i++) bb[0].click(); for (var j = 0; j < n % 10; j++) bb[1].click(); }
      else { var cells = appNode.querySelectorAll(".cell.tappable"); for (var k = 0; k < n; k++) cells[k].click(); }
      chk.click();
      continue;
    }
    // 4) creature sulla linea dei numeri
    var marks = appNode.querySelectorAll(".nline .mark.tappable").filter(function (m) { return !m.classList.contains("dim") && !m.classList.contains("ok"); });
    if (marks.length) {
      var m = marks[Math.floor(Math.random() * marks.length)]; m.click();
      if (m.classList.contains("dim")) expectWrongFeedback(before, where);
      continue;
    }
    if (!timers.length) {
      var sig = appNode.textContent;
      if (sig === lastSig && ++same > 3) throw new Error(where + ": bloccato, niente da fare.\n" + sig.slice(0, 400));
      lastSig = sig;
    }
  }
  stats.sessions++;
  var rw = appNode.querySelector(".reward");
  assert.ok(rw, where + ": nessuna schermata ricompensa");
}

/* ---------- generazione: invarianti ---------- */
function genChecks() {
  var lvl = { subitizing: 5, fives: 4, bonds: 4, addition: 5, subtraction: 5, tens: 5, hundred: 5, wall: 4, triangle: 4, patterns: 5, numberline: 5, neighbours: 4, diktat: 5 };
  Object.keys(lvl).forEach(function (id) {
    for (var L = 1; L <= lvl[id]; L++) for (var i = 0; i < 400; i++) {
      var r = MM.games[id].makeRound(L);
      assert.ok(r && typeof r === "object", id + " makeRound");
      if (id === "wall") { assert.ok(r.steps.length > 0 && r.steps.length === Object.keys(r.hidden).length, "wall steps"); assert.ok(r.rows[r.rows.length - 1][0] <= 100, "wall top"); }
      if (id === "triangle") assert.strictEqual(r.steps.length, Object.keys(r.hidden).length, "triangle steps");
      if (id === "patterns" && r.mode === "num") r.seq.forEach(function (v) { assert.ok(v >= 0 && v <= 100, "pattern range " + v); });
      if (id === "neighbours") r.steps.forEach(function (s) { assert.ok(s.v >= 0 && s.v <= 100, "neighbour range"); });
      if (id === "numberline" && r.mode !== "board") assert.ok(r.n >= r.lo && r.n <= r.hi, "numberline range");
      if (id === "hundred") assert.ok(r.ans >= 0 && r.ans <= 100, "hundred range " + r.ans);
      if (id === "tens") assert.ok(r.n >= 0 && r.n <= 99, "tens range");
    }
  });
  // choicesFrom: sempre 3 valori unici con la risposta giusta dentro
  for (var k = 0; k < 2000; k++) {
    var c = MM.ui.randInt(0, 100), out = MM.ui.choicesFrom(c, [c + 1, c - 1, c + 10, 999, -5, c], 3, 0, 100);
    assert.strictEqual(out.length, 3); assert.ok(out.indexOf(c) >= 0); assert.strictEqual(new Set(out).size, 3);
    out.forEach(function (v) { assert.ok(v >= 0 && v <= 100); });
  }
}

/* ---------- esegui ---------- */
var t0 = Date.now();
assert.strictEqual(appNode.querySelectorAll(".game-card").length, 13, "13 carte in home");
assert.strictEqual(appNode.querySelectorAll(".section-label").length, 3, "3 sezioni in home");
genChecks();
var LV = { subitizing: 5, fives: 4, bonds: 4, addition: 5, subtraction: 5, tens: 5, hundred: 5, wall: 4, triangle: 4, patterns: 5, numberline: 5, neighbours: 4, diktat: 5 };
["de", "en"].forEach(function (lang) {
  MM.i18n.setLang(lang);
  Object.keys(LV).forEach(function (id) {
    for (var L = 1; L <= LV[id]; L++) for (var rep = 0; rep < 3; rep++) drive(id, L);
  });
});
var summary = MM.storage.getSummary();
assert.strictEqual(summary.length, 13, "summary 13 skill");
summary.forEach(function (s) { assert.ok(s.attempts > 0, "attempts " + s.id); });
// pannello genitori
var wrap = new Node("div"); MM.parent.render(wrap);
assert.ok(wrap.querySelectorAll(".skill-row").length === 13, "parent rows");
console.log("OK — sessioni: " + stats.sessions + ", errori simulati con suggerimento: " + stats.wrong + ", " + (Date.now() - t0) + " ms");
