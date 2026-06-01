/* ===== storage: progressi su localStorage, tutto sul dispositivo ===== */
(function () {
  var KEY = "mm.v1";
  var SKILL_IDS = ["subitizing", "fives", "bonds", "addition", "subtraction"];
  var MAX_LEVEL = { subitizing: 5, fives: 4, bonds: 4, addition: 5, subtraction: 5 };
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

  function load() {
    var data;
    try { data = JSON.parse(localStorage.getItem(KEY)); } catch (e) { data = null; }
    if (!data || typeof data !== "object") data = {};
    data.skills = data.skills || {};
    SKILL_IDS.forEach(function (id) {
      if (!data.skills[id]) data.skills[id] = blankSkill();
    });
    data.collection = data.collection || {};   // emoji -> count
    return data;
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

  function getSummary() {
    var data = load();
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
        status: statusOf(sk, id)
      };
    });
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

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) {}
  }

  window.MM = window.MM || {};
  window.MM.storage = {
    SKILL_IDS: SKILL_IDS,
    getSkill: function (id) { return load().skills[id]; },
    recordSession: recordSession,
    getSummary: getSummary,
    stars: stars,
    collection: collection,
    addSticker: addSticker,
    reset: reset
  };
})();
