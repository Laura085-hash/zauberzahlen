/* ===== audio: voce (Web Speech) + effetti sonori (WebAudio) ===== */
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
    } else if (name === "tap") {
      tone(520, 0.06, "sine", 0, 0.1);
    } else if (name === "sparkle") {
      tone(1320, 0.08, "sine", 0, 0.08);
      tone(1760, 0.1, "sine", 0.06, 0.06);
    }
  }

  var voices = [];
  function loadVoices() { try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; } }
  if ("speechSynthesis" in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }

  function speak(text) {
    if (!soundOn || !text || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      var lang = MM.i18n.voiceLang();
      u.lang = lang;
      var v = voices.filter(function (x) { return x.lang && x.lang.toLowerCase().indexOf(lang.slice(0, 2)) === 0; })[0];
      if (v) u.voice = v;
      u.rate = 0.95; u.pitch = 1.15;   // voce più giocosa
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }

  // pronuncia un numero nella lingua corrente
  function speakNumber(n) { speak(String(n)); }

  function setSound(on) {
    soundOn = !!on;
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch (e) {}
    if (!soundOn && "speechSynthesis" in window) { try { window.speechSynthesis.cancel(); } catch (e) {} }
  }

  window.MM = window.MM || {};
  window.MM.audio = {
    sfx: sfx,
    speak: speak,
    speakNumber: speakNumber,
    setSound: setSound,
    get on() { return soundOn; },
    // sblocca l'audio al primo tocco (richiesto dai browser)
    unlock: function () { ac(); }
  };
})();
