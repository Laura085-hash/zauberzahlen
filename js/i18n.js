/* ===== i18n: Deutsch / English ===== */
(function () {
  var STR = {
    de: {
      appTitle: "Zauberzahlen",
      tagline: "Magische Mathe mit Stella dem Einhorn",
      hello: "Hallo! Ich bin Stella. Wollen wir zaubern?",
      play: "Spielen",
      collectionLabel: "Deine Zaubersammlung",
      collectionEmpty: "Spiel ein Spiel und sammle Zauberwesen!",

      g_subitizing: "Zauberzahlen",
      g_subitizing_sub: "Wie viele? Schau genau!",
      g_fives: "Kraft der 5",
      g_fives_sub: "Im Fünfer- und Zehnerfeld",
      g_bonds: "Zahlen zerlegen",
      g_bonds_sub: "Teile die Zahl auf",
      g_addition: "Plus-Zauber",
      g_addition_sub: "Zusammenzählen bis 20",
      g_subtraction: "Minus-Zauber",
      g_subtraction_sub: "Wegnehmen bis 20",

      p_howMany: "Wie viele?",
      p_makeNumber: "Lege {n}!",
      p_whichNumber: "Welche Zahl?",
      p_makeTen: "Welche Zahl macht zusammen 10?",
      p_split: "{n} ist {a} und …?",
      p_plus: "Wie viel ist das zusammen?",
      p_takeAway: "Wie viele bleiben?",
      p_difference: "Wie viele mehr?",
      p_inverse: "{a} und wie viel macht {n}?",

      check: "Fertig!",
      back: "Zurück",
      tapContinue: "Tippe zum Weiter",
      sessionDone: "Geschafft!",
      youEarned: "Du hast gefunden:",
      newFriend: "Ein neues Zauberwesen!",
      levelUp: "Wow, nächste Stufe!",

      praise: ["Super!", "Toll gemacht!", "Zauberhaft!", "Genau!", "Bravo!", "Wunderbar!"],
      tryAgain: ["Fast! Versuch's nochmal.", "Schau nochmal genau.", "Kein Problem, nochmal!"],
      itWas: "Es war {n}.",
      streak: ["Super Serie!", "Wow, weiter so!", "Unglaublich!", "Du zauberst!"],
      perfect: "PERFEKT!",
      allCorrect: "Alles richtig!",

      settings: "Einstellungen",
      language: "Sprache",
      sound: "Ton",
      on: "An",
      off: "Aus",
      close: "Schließen",

      parent: "Für Eltern",
      parentGate: "Tippe die {n}",
      parentIntro: "Lernfortschritt",
      colSkill: "Fähigkeit",
      colPractice: "Geübt",
      colStatus: "Stand",
      times: "mal",
      accuracy: "Treffer",
      recallShare: "ohne Zählen",
      status_started: "am Anfang",
      status_consolidating: "festigt sich",
      status_mastered: "sitzt!",
      summary: "Zusammenfassung",
      print: "Drucken / Teilen",
      reset: "Fortschritt löschen",
      resetAsk: "Wirklich allen Fortschritt löschen?",
      reportTitle: "Mathe-Übungsbericht",
      reportNote: "Spielerische Übung zu: Mengenverständnis, Kraft der 5, Zerlegen, Addition und Subtraktion bis 20.",
      generated: "Erstellt am"
    },
    en: {
      appTitle: "Magic Numbers",
      tagline: "Magic maths with Stella the unicorn",
      hello: "Hi! I'm Stella. Shall we make magic?",
      play: "Play",
      collectionLabel: "Your magic collection",
      collectionEmpty: "Play a game and collect magic friends!",

      g_subitizing: "Magic Count",
      g_subitizing_sub: "How many? Look closely!",
      g_fives: "Power of 5",
      g_fives_sub: "On the five & ten frame",
      g_bonds: "Number Bonds",
      g_bonds_sub: "Split the number",
      g_addition: "Plus Magic",
      g_addition_sub: "Adding up to 20",
      g_subtraction: "Minus Magic",
      g_subtraction_sub: "Taking away to 20",

      p_howMany: "How many?",
      p_makeNumber: "Make {n}!",
      p_whichNumber: "Which number?",
      p_makeTen: "Which number makes 10?",
      p_split: "{n} is {a} and …?",
      p_plus: "How many altogether?",
      p_takeAway: "How many are left?",
      p_difference: "How many more?",
      p_inverse: "{a} and how many make {n}?",

      check: "Done!",
      back: "Back",
      tapContinue: "Tap to continue",
      sessionDone: "You did it!",
      youEarned: "You found:",
      newFriend: "A new magic friend!",
      levelUp: "Wow, next level!",

      praise: ["Super!", "Well done!", "Magical!", "That's it!", "Bravo!", "Wonderful!"],
      tryAgain: ["Almost! Try again.", "Look once more.", "No worries, again!"],
      itWas: "It was {n}.",
      streak: ["Great streak!", "Wow, keep going!", "Amazing!", "You're on fire!"],
      perfect: "PERFECT!",
      allCorrect: "All correct!",

      settings: "Settings",
      language: "Language",
      sound: "Sound",
      on: "On",
      off: "Off",
      close: "Close",

      parent: "For parents",
      parentGate: "Tap the {n}",
      parentIntro: "Learning progress",
      colSkill: "Skill",
      colPractice: "Practised",
      colStatus: "Status",
      times: "times",
      accuracy: "correct",
      recallShare: "without counting",
      status_started: "just starting",
      status_consolidating: "getting there",
      status_mastered: "got it!",
      summary: "Summary",
      print: "Print / Share",
      reset: "Clear progress",
      resetAsk: "Really clear all progress?",
      reportTitle: "Maths practice report",
      reportNote: "Playful practice of: number sense, power of 5, decomposition, addition and subtraction to 20.",
      generated: "Generated on"
    }
  };

  var LANG_KEY = "mm.lang";
  var lang = (function () {
    try { return localStorage.getItem(LANG_KEY) || "de"; } catch (e) { return "de"; }
  })();

  function t(key, vars) {
    var s = (STR[lang] && STR[lang][key]) != null ? STR[lang][key] : key;
    if (vars && typeof s === "string") {
      s = s.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
    }
    return s;
  }

  function pick(key) {
    var arr = (STR[lang] && STR[lang][key]) || [];
    if (!arr.length) return "";
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function setLang(l) {
    if (!STR[l]) return;
    lang = l;
    try { localStorage.setItem(LANG_KEY, l); } catch (e) {}
    document.documentElement.lang = l;
  }

  document.documentElement.lang = lang;

  window.MM = window.MM || {};
  window.MM.i18n = {
    t: t,
    pick: pick,
    setLang: setLang,
    get lang() { return lang; },
    voiceLang: function () { return lang === "de" ? "de-DE" : "en-US"; }
  };
})();
