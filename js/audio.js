/* ===== audio: voce (clip pre-registrati + Web Speech) + effetti sonori (WebAudio) ===== */
(function () {
  var SOUND_KEY = "mm.sound";
  var soundOn = (function () {
    try { return localStorage.getItem(SOUND_KEY) !== "0"; } catch (e) { return true; }
  })();

  var ctx = null;
  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; }
    }
    if (ctx && ctx.state === "suspended") { try { ctx.resume(); } catch (e) {} }
    return ctx;
  }

  function tone(freq, dur, type, when, gainPeak) {
    var c = ac(); if (!c) return;
    var t0 = c.currentTime + (when || 0);
    var osc = c.createOscillator();
    var g = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(gainPeak || 0.18, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g); g.connect(c.destination);
    osc.start(t0); osc.stop(t0 + dur + 0.02);
  }

  function sfx(name) {
    if (!soundOn) return;
    if (name === "correct") {            // arpeggio allegro
      tone(660, 0.12, "triangle", 0);
      tone(880, 0.12, "triangle", 0.1);
      tone(1175, 0.18, "triangle", 0.2);
    } else if (name === "wrong") {       // morbido, non punitivo
      tone(300, 0.18, "sine", 0, 0.12);
    } else if (name === "win") {         // fanfara magica
      tone(523, 0.12, "triangle", 0);
      tone(659, 0.12, "triangle", 0.12);
      tone(784, 0.12, "triangle", 0.24);
      tone(1047, 0.28, "triangle", 0.36);
    } else if (name === "cheer") {        // squillo per la "combo"
      tone(784, 0.1, "triangle", 0);
      tone(988, 0.1, "triangle", 0.1);
      tone(1319, 0.18, "triangle", 0.2);
    } else if (name === "party") {        // fanfara lunga per la festa "perfetto"
      var seq = [523, 659, 784, 1047, 880, 1047, 1319, 1568];
      for (var p = 0; p < seq.length; p++) tone(seq[p], 0.16, "triangle", p * 0.13);
    } else if (name === "tap") {
      tone(520, 0.06, "sine", 0, 0.1);
    } else if (name === "sparkle") {
      tone(1320, 0.08, "sine", 0, 0.08);
      tone(1760, 0.1, "sine", 0.06, 0.06);
    }
  }

  /* ---------- voci del dispositivo (Web Speech): usate solo per i testi senza clip ---------- */
  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  // dà un punteggio alle voci: preferisci quelle naturali/amichevoli, scarta le robotiche
  function scoreVoice(v) {
    var n = (v.name || "").toLowerCase();
    var s = 0;
    if (/natural|neural|enhanced|premium|wavenet/.test(n)) s += 100;
    if (/siri/.test(n)) s += 70;
    if (/google/.test(n)) s += 45;
    if (/compact|eloquence|espeak|pico/.test(n)) s -= 120;   // tipicamente robotiche
    var nice = ["samantha", "aria", "jenny", "libby", "sonia", "ava", "allison", "nicky", "zoe", "evie", // EN
                "anna", "petra", "katja", "marlene", "vicki", "helena", "seraphina", "google deutsch"];   // DE
    for (var i = 0; i < nice.length; i++) { if (n.indexOf(nice[i]) >= 0) { s += 30; break; } }
    if (v.localService) s += 5;
    return s;
  }

  function voicesFor(lang) {
    var p = lang.slice(0, 2);
    var c = voices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(p) === 0; });
    return c.length ? c : voices;
  }

  function savedVoiceName(lang) { try { return localStorage.getItem("mm.voice_" + lang.slice(0, 2)) || ""; } catch (e) { return ""; } }
  function setVoiceName(lang, name) { try { localStorage.setItem("mm.voice_" + lang.slice(0, 2), name || ""); } catch (e) {} }

  function chooseVoice(lang) {
    var saved = savedVoiceName(lang);
    if (saved) { var m = voices.filter(function (v) { return v.name === saved; })[0]; if (m) return m; }
    var c = voicesFor(lang).slice();
    c.sort(function (a, b) { return scoreVoice(b) - scoreVoice(a); });
    return c[0];
  }

  /* ---------- clip pre-registrati (voce neurale Katja/Sonia, js/voice-manifest.js) ----------
     Le Lernwörter, le sillabe, le frasi del Diktat, il saluto e le lodi hanno un mp3 registrato:
     suonano uguali su ogni dispositivo, anche dove non c'è nessuna voce tedesca installata. */
  function norm(text) { return String(text).replace(/\s+/g, " ").trim(); }
  function speedOf(rate) { return rate <= 0.75 ? "x" : (rate < 0.9 ? "s" : "n"); }

  function clipFor(text, lang, rate) {
    var clips = window.MM && MM.voiceClips;
    if (!clips) return null;
    var l = lang.slice(0, 2), n = norm(text), sp = speedOf(rate);
    var order = sp === "n" ? ["n", "s"] : (sp === "s" ? ["s", "n", "x"] : ["x", "s", "n"]);
    for (var i = 0; i < order.length; i++) {
      var c = clips[l + "|" + order[i] + "|" + n];
      if (c) return c;
    }
    return null;
  }

  // testo intero → un clip; altrimenti frase per frase ("PERFEKT! Alles richtig!") se esistono tutte
  function clipParts(text, lang, rate) {
    var one = clipFor(text, lang, rate);
    if (one) return [{ clip: one, text: norm(text) }];
    var parts = norm(text).replace(/([.!?])\s+/g, "$1\u0001").split("\u0001").filter(Boolean);
    if (parts.length < 2) return null;
    var out = [];
    for (var i = 0; i < parts.length; i++) {
      var c = clipFor(parts[i], lang, rate);
      if (!c) return null;
      out.push({ clip: c, text: parts[i] });
    }
    return out;
  }

  /* ---------- coda unica: clip e voce del dispositivo in sequenza ---------- */
  var queue = [], playing = false, current = null;

  function stopAll() {
    queue = [];
    if (current && current.audio) { try { current.audio.pause(); current.audio.src = ""; } catch (e) {} }
    current = null; playing = false;
    if ("speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  function ttsNow(text, lang, rate, cb) {
    if (!("speechSynthesis" in window)) { cb(); return; }
    var done = false, tm = null;
    function fin() { if (done) return; done = true; clearTimeout(tm); cb(); }
    try {
      var u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      var v = chooseVoice(lang);
      if (v) { u.voice = v; u.lang = v.lang; }
      u.rate = rate || 0.96; u.pitch = 1.05;   // più morbida e naturale
      u.onend = fin; u.onerror = fin;
      tm = setTimeout(fin, Math.min(20000, 1500 + text.length * 90));   // Chrome a volte non manda onend
      current = { utter: u };
      window.speechSynthesis.speak(u);
    } catch (e) { fin(); }
  }

  function playNext() {
    var item = queue.shift();
    if (!item) { playing = false; current = null; return; }
    playing = true;
    if (!item.clip) { ttsNow(item.text, item.lang, item.rate, playNext); return; }
    var a = new Audio(item.clip), done = false;
    a.preload = "auto";
    current = { audio: a };
    function fin() { if (done) return; done = true; if (current && current.audio === a) current = null; playNext(); }
    function fallback() { if (done) return; done = true; ttsNow(item.text, item.lang, item.rate, playNext); }   // offline / clip mancante
    a.onended = fin;
    a.onerror = fallback;
    try {
      var p = a.play();
      if (p && p.catch) p.catch(fallback);
    } catch (e) { fallback(); }
  }

  function enqueue(item) { queue.push(item); if (!playing) playNext(); }

  // speak(testo [, lingua forzata es. "de-DE", velocità, accoda=true per non interrompere la frase in corso])
  function speak(text, forceLang, rate, queueIt) {
    if (!soundOn || !text) return;
    text = String(text);
    var lang = forceLang || MM.i18n.voiceLang();
    rate = rate || 0.96;
    if (!queueIt) stopAll();
    var parts = clipParts(text, lang, rate);
    if (parts) parts.forEach(function (p) { enqueue({ clip: p.clip, text: p.text, lang: lang, rate: rate }); });
    else enqueue({ text: text, lang: lang, rate: rate });
  }

  // pronuncia un numero nella lingua corrente
  function speakNumber(n) { speak(String(n)); }

  // parola sillaba per sillaba (Diktat): ogni sillaba in coda, lenta, senza interrompere la frase in corso
  function speakSyllables(syllables, lang) {
    (syllables || []).forEach(function (s) { speak(s, lang || "de-DE", 0.7, true); });
  }

  function setSound(on) {
    soundOn = !!on;
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch (e) {}
    if (!soundOn) stopAll();
  }

  window.MM = window.MM || {};
  window.MM.audio = {
    sfx: sfx,
    speak: speak,
    speakNumber: speakNumber,
    speakSyllables: speakSyllables,
    setSound: setSound,
    stop: stopAll,
    get on() { return soundOn; },
    // c'è un clip registrato per questo testo?
    hasClip: function (text, lang, rate) { return !!clipParts(text, lang || "de-DE", rate || 0.96); },
    // per il menù "Voce" nelle impostazioni
    listVoices: function (lang) { return voicesFor(lang).map(function (v) { return { name: v.name, lang: v.lang }; }); },
    getVoiceName: function (lang) { return savedVoiceName(lang); },
    setVoiceName: setVoiceName,
    // sblocca l'audio al primo tocco (richiesto dai browser)
    unlock: function () { ac(); }
  };
})();
