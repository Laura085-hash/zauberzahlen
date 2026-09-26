/* ===== storage: progressi su localStorage, tutto sul dispositivo ===== */
(function () {
  var KEY = "mm.v1";
  var SKILL_IDS = ["subitizing", "fives", "bonds", "addition", "subtraction",
                   "tens", "hundred", "wall", "triangle", "patterns", "numberline", "neighbours",
                   "plus100", "minus100", "complete", "always100", "double", "francs", "times", "compare",
                   "diktat", "words", "diktatfull"];
  var MAX_LEVEL = { subitizing: 5, fives: 4, bonds: 4, addition: 5, subtraction: 5,
                    tens: 5, hundred: 5, wall: 4, triangle: 4, patterns: 5, numberline: 5, neighbours: 4,
                    plus100: 5, minus100: 5, complete: 5, always100: 5, double: 5, francs: 5, times: 5, compare: 5,
                    diktat: 5, words: 5, diktatfull: 5 };
  var STICKERS = ["🦄", "✨", "🌈", "⭐", "💎", "🧚", "🍄", "🌸", "🪄", "👑", "🦋", "🌟", "🐉", "🧜", "🌷", "🍀"];

  function blankSkill() {
    return {
      level: 1, attempts: 0, correct: 0,
      recent: [],                 // ultimi esiti (1/0), cap 30
      recall: { c: 0, t: 0 },     // risposte SENZA contare
      count: { c: 0, t: 0 },      // risposte contando (dita/visivo)
      sessions: 0
    };
  }

  // completa un oggetto progressi (anche uno arrivato da un altro dispositivo) con i default
  function withDefaults(data) {
    if (!data || typeof data !== "object") data = {};
    data.skills = data.skills || {};
    SKILL_IDS.forEach(function (id) {
      var sk = data.skills[id];
      if (!sk) { data.skills[id] = blankSkill(); return; }
      sk.recent = sk.recent || []; sk.recall = sk.recall || { c: 0, t: 0 }; sk.count = sk.count || { c: 0, t: 0 };
      sk.level = sk.level || 1; sk.attempts = sk.attempts || 0; sk.correct = sk.correct || 0; sk.sessions = sk.sessions || 0;
    });
    data.collection = data.collection || {};   // emoji -> count
    data.words = data.words || {};             // Lernwort -> { r: giuste al 1° colpo, w: sbagliate }
    return data;
  }

  function load() {
    var data;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    return withDefaults(data);
  }

  // copia grezza dei progressi (per la sincronizzazione)
  function raw() {
    try { return localStorage.getItem(KEY) || ""; } catch (e) { return ""; }
  }

  function save(data) {
    try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
  }

  function avg(arr) {
    if (!arr.length) return 0;
    var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i];
    return s / arr.length;
  }

  function recordSession(id, results) {
    var data = load();
    var sk = data.skills[id];
    results.forEach(function (r) {
      sk.attempts++;
      sk.recent.push(r.correct ? 1 : 0);
      if (sk.recent.length > 30) sk.recent.shift();
      if (r.correct) sk.correct++;
      var b = r.recall ? sk.recall : sk.count;
      b.t++; if (r.correct) b.c++;
    });
    sk.sessions++;

    var recentArr = sk.recent.slice(-12);
    var recentAcc = avg(recentArr);
    var leveledUp = false;
    if (recentArr.length >= 10 && recentAcc >= 0.85 && sk.level < (MAX_LEVEL[id] || 4)) {
      sk.level++; leveledUp = true; sk.recent = [];
    }

    // ricompensa: un nuovo zauberwesen
    var reward = STICKERS[Math.floor(Math.random() * STICKERS.length)];
    data.collection[reward] = (data.collection[reward] || 0) + 1;

    save(data);
    return { leveledUp: leveledUp, reward: reward, level: sk.level };
  }

  function statusOf(sk, id) {
    if (sk.attempts < 8) return "started";
    var acc = sk.correct / sk.attempts;
    var recentAcc = avg(sk.recent.slice(-12));
    if (sk.level >= (MAX_LEVEL[id] || 4) && recentAcc >= 0.85) return "mastered";
    if (acc >= 0.6) return "consolidating";
    return "started";
  }

  // riepilogo per la dashboard; con `src` usa quei progressi (es. arrivati dal telefono) invece dei locali
  function getSummary(src) {
    var data = src ? withDefaults(src) : load();
    return SKILL_IDS.map(function (id) {
      var sk = data.skills[id];
      var acc = sk.attempts ? sk.correct / sk.attempts : 0;
      var recallCorrect = sk.recall.c;
      var totalCorrect = sk.recall.c + sk.count.c;
      var recallShare = totalCorrect ? recallCorrect / totalCorrect : 0;
      return {
        id: id,
        level: sk.level,
        maxLevel: MAX_LEVEL[id] || 4,
        attempts: sk.attempts,
        accuracy: acc,
        recallShare: recallShare,
        sessions: sk.sessions || 0,
        status: statusOf(sk, id)
      };
    });
  }

  // totali per la dashboard e per il riepilogo inviato ai genitori
  function totals(src) {
    var data = src ? withDefaults(src) : load();
    var att = 0, cor = 0, sess = 0, played = 0;
    SKILL_IDS.forEach(function (id) {
      var sk = data.skills[id];
      if (!sk.attempts) return;
      played++; att += sk.attempts; cor += sk.correct; sess += sk.sessions || 0;
    });
    return { attempts: att, correct: cor, sessions: sess, games: played };
  }

  function stars(id) {
    var data = load();
    var sk = data.skills[id];
    return { level: sk.level, max: MAX_LEVEL[id] || 4 };
  }

  function collection() {
    var data = load();
    return data.collection;
  }

  function addSticker() {
    var data = load();
    var s = STICKERS[Math.floor(Math.random() * STICKERS.length)];
    data.collection[s] = (data.collection[s] || 0) + 1;
    save(data);
    return s;
  }

  // statistiche per Lernwort: le parole sbagliate tornano più spesso (gioco "Schwere Wörter")
  function wordStats(src) { return (src ? withDefaults(src) : load()).words; }
  function recordWord(word, ok) {
    var data = load();
    var s = data.words[word] || { r: 0, w: 0 };
    if (ok) s.r++; else s.w++;
    data.words[word] = s;
    save(data);
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  window.MM = window.MM || {};
  window.MM.storage = {
    SKILL_IDS: SKILL_IDS,
    getSkill: function (id) { return load().skills[id]; },
    recordSession: recordSession,
    getSummary: getSummary,
    totals: totals,
    raw: raw,
    stars: stars,
    collection: collection,
    addSticker: addSticker,
    wordStats: wordStats,
    recordWord: recordWord,
    reset: reset
  };
})();
