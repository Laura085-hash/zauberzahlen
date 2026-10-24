/* ===== Gioco 26: Herbst-Wörter — Wörtchenprüfung «Herbst» vom Montag, 2. November 2026 (Nikola Beric) =====
   15 Lernwörter mit Artikel: der Herbst · der Wind · der Kürbis · das Blatt · der Regen · die Wolke · der Nebel ·
   die Kastanie · die Stiefel · die Jacke · der Schal · die Mütze · der Schirm · die Pfütze · der Igel.
   Metodo del foglio della scuola: 1 Lesen · 2 Merken · 3 Schreiben (Wort abdecken) · 4 Kontrollieren.
   Livelli (un round alterna i modi del livello):
     1 richtige Schreibweise erkennen + fehlende Buchstaben · 2 fehlende Buchstaben + anschauen-merken-schreiben ·
     3 anschauen-merken-schreiben + nur hören · 4 nur hören und schreiben (= so ist die Prüfung) ·
     5 der/die/das wählen und dann schreiben (die Artikel zählen nicht, sind aber empfohlen) + nur hören.
   Ogni parola ha il suo disegno (emoji); le parole sempre in voce tedesca (clip registrati Katja).
   Le parole che Joy sbaglia tornano più spesso (MM.storage.recordWord, come in "Schwere Wörter").
   Regola: dopo un errore mai la parola giusta — lettere rosse, sillabe a voce, suggerimento sul metodo. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); }, D = MM.diktat;

  // gaps: [inizio, lunghezza, [giusto, trappola, trappola]] — trappole = errori tipici di Joy
  // (v/w, f/v, consonante doppia mancante, ck→k, tz→z, ü→u, ie→i, d finale→t, Sch→Sh, Pf→F)
  var WORDS = [
    { w: "Herbst",   art: "der", pic: "🍂", syl: ["Herbst"],           hard: 3, gaps: [[3, 2, ["bs", "ps", "bz"]], [1, 1, ["e", "ä", "ö"]], [0, 1, ["H", "h", "Ch"]]] },
    { w: "Wind",     art: "der", pic: "💨", syl: ["Wind"],             hard: 2, gaps: [[3, 1, ["d", "t", "dt"]], [0, 1, ["W", "V", "w"]]] },
    { w: "Kürbis",   art: "der", pic: "🎃", syl: ["Kür", "bis"],       hard: 4, gaps: [[1, 1, ["ü", "u", "i"]], [4, 2, ["is", "iss", "ies"]], [0, 1, ["K", "C", "G"]]] },
    { w: "Blatt",    art: "das", pic: "🍁", syl: ["Blatt"],            hard: 3, gaps: [[3, 2, ["tt", "t", "d"]], [0, 1, ["B", "P", "b"]]] },
    { w: "Regen",    art: "der", pic: "🌧️", syl: ["Re", "gen"],        hard: 2, gaps: [[1, 1, ["e", "ä", "ee"]], [2, 1, ["g", "k", "ch"]]] },
    { w: "Wolke",    art: "die", pic: "☁️", syl: ["Wol", "ke"],        hard: 3, gaps: [[3, 1, ["k", "ck", "g"]], [0, 1, ["W", "V", "w"]]] },
    { w: "Nebel",    art: "der", pic: "🌫️", syl: ["Ne", "bel"],        hard: 3, gaps: [[2, 1, ["b", "bb", "p"]], [1, 1, ["e", "ä", "ee"]]] },
    { w: "Kastanie", art: "die", pic: "🌰", syl: ["Kas", "ta", "nie"], hard: 5, gaps: [[5, 3, ["nie", "ni", "nje"]], [0, 1, ["K", "C", "G"]], [2, 1, ["s", "ss", "z"]]] },
    { w: "Stiefel",  art: "die", pic: "👢", syl: ["Stie", "fel"],      hard: 4, gaps: [[2, 2, ["ie", "i", "ih"]], [0, 2, ["St", "Scht", "Sd"]], [4, 1, ["f", "ff", "v"]]] },
    { w: "Jacke",    art: "die", pic: "🧥", syl: ["Ja", "cke"],        hard: 3, gaps: [[2, 2, ["ck", "k", "kk"]], [0, 1, ["J", "G", "Y"]]] },
    { w: "Schal",    art: "der", pic: "🧣", syl: ["Schal"],            hard: 3, gaps: [[0, 3, ["Sch", "Sh", "Sc"]], [3, 2, ["al", "all", "ahl"]]] },
    { w: "Mütze",    art: "die", pic: "🧢", syl: ["Müt", "ze"],        hard: 4, gaps: [[1, 1, ["ü", "u", "i"]], [2, 2, ["tz", "z", "ts"]]] },
    { w: "Schirm",   art: "der", pic: "☂️", syl: ["Schirm"],           hard: 4, gaps: [[0, 3, ["Sch", "Sh", "Sc"]], [3, 1, ["i", "ie", "ü"]], [5, 1, ["m", "n", "mm"]]] },
    { w: "Pfütze",   art: "die", pic: "💧", syl: ["Pfüt", "ze"],       hard: 5, gaps: [[0, 2, ["Pf", "F", "Ff"]], [2, 1, ["ü", "u", "i"]], [3, 2, ["tz", "z", "ts"]]] },
    { w: "Igel",     art: "der", pic: "🦔", syl: ["I", "gel"],         hard: 2, gaps: [[0, 1, ["I", "Ie", "Ih"]], [1, 1, ["g", "k", "ch"]]] }
  ];

  // modi per livello: un round alterna i modi del suo livello (così si scrive già dal livello 2)
  var PLAN = { 1: ["spell", "gap"], 2: ["gap", "merk"], 3: ["merk", "hear"], 4: ["hear"], 5: ["article", "hear"] };

  var lastWord = null;
  function weightOf(w, stats) {
    var s = stats[w.w] || { r: 0, w: 0 };
    return Math.max(1, w.hard + 3 * s.w - s.r);
  }
  // le parole difficili e quelle sbagliate escono più spesso; mai la stessa due volte di fila
  function pickWeighted() {
    var stats = MM.storage.wordStats();
    var pool = WORDS.filter(function (w) { return w !== lastWord; });
    var total = 0, i;
    for (i = 0; i < pool.length; i++) total += weightOf(pool[i], stats);
    var r = Math.random() * total;
    for (i = 0; i < pool.length; i++) { r -= weightOf(pool[i], stats); if (r < 0) break; }
    lastWord = pool[Math.min(i, pool.length - 1)];
    return lastWord;
  }

  function misspell(word, gi, oi) {
    var g = word.gaps[gi], w = word.w;
    return w.slice(0, g[0]) + g[2][oi] + w.slice(g[0] + g[1]);
  }
  // n varianti sbagliate diverse della parola
  function variants(word, n) {
    var seen = {}, out = [], guard = 0;
    while (out.length < n && guard++ < 60) {
      var gi = ui.randInt(0, word.gaps.length - 1), g = word.gaps[gi];
      var m = misspell(word, gi, ui.randInt(1, g[2].length - 1));
      if (m !== word.w && !seen[m]) { seen[m] = true; out.push(m); }
    }
    return out;
  }

  function picture(w) { return ui.el("div", { class: "picword" }, [w.pic]); }

  // la parola con le sillabe colorate a turno (Lesen & Merken)
  function merkwort(w) {
    var el = ui.el("div", { class: "merkwort" });
    w.syl.forEach(function (s, i) { el.appendChild(ui.el("span", { class: i % 2 ? "s2" : "s1" }, [s])); });
    return el;
  }

  // statistiche per parola: conta solo il 1° tentativo
  function recordFirst(api, w, ok) { if (api.attempts === 0) MM.storage.recordWord(w.w, ok); }
  function hooks(w, api) {
    return {
      onWrong: function () { if (api.attempts === 1) MM.storage.recordWord(w.w, false); MM.audio.speakSyllables(w.syl); },
      onOk: function () { if (api.attempts === 0) MM.storage.recordWord(w.w, true); }
    };
  }
  function wordBox(mount, api, w) {
    var tb = D.typeBox(mount, api, function (typed) { return D.checkWord(typed, w.w); }, false, true, hooks(w, api));
    mount.appendChild(tb.button);
    return tb;
  }

  MM.games.herbst = {
    id: "herbst", nameKey: "g_herbst", subKey: "g_herbst_sub", emoji: "🍂", gem: "🍁", rounds: 6,

    makeRound: function (level, idx) {
      var modes = PLAN[Math.min(Math.max(level, 1), 5)], mode = modes[(idx || 0) % modes.length];
      var w = pickWeighted();
      if (mode === "gap") { var g = w.gaps[ui.randInt(0, w.gaps.length - 1)]; return { mode: mode, word: w, gap: g, answer: g[2][0] }; }
      return { mode: mode, word: w, answer: w.w };   // answer = ciò che va scritto (per il test automatico)
    },

    render: function (mount, round, api) {
      var w = round.word;
      var holder = ui.el("div", { class: "holder words" });

      if (round.mode === "spell") {            // Lesen: quale è scritta giusta?
        api.prompt(t("p_dSpell"));
        mount.appendChild(picture(w));
        D.say(w.w, 0.85, true);
        mount.appendChild(D.listenBtn(w.w));
        mount.appendChild(holder);
        ui.askChoices(holder, w.w, function () { return ui.shuffle([w.w].concat(variants(w, 2))); }, function (ok) {
          recordFirst(api, w, ok);
          api.submit(ok, { recall: false, hint: t("h_dSpell") });
        });

      } else if (round.mode === "gap") {       // Merken: quali lettere mancano?
        api.prompt(t("p_dGap"));
        mount.appendChild(picture(w));
        D.say(w.w, 0.85, true);
        var g = round.gap;
        var gapEl = ui.el("span", { class: "gap" }, ["?"]);
        mount.appendChild(ui.el("div", { class: "gapword" }, [
          ui.el("span", {}, [w.w.slice(0, g[0])]), gapEl, ui.el("span", {}, [w.w.slice(g[0] + g[1])])
        ]));
        mount.appendChild(D.listenBtn(w.w));
        mount.appendChild(holder);
        ui.askChoices(holder, g[2][0], function () { return ui.shuffle(g[2].slice()); }, function (ok) {
          if (ok) gapEl.textContent = g[2][0];
          recordFirst(api, w, ok);
          api.submit(ok, { recall: false, hint: t("h_dGap") });
        });

      } else if (round.mode === "merk") {      // Lesen – Merken – Schreiben: la parola sparisce, poi si scrive
        api.prompt(t("p_wMerk"));
        mount.appendChild(picture(w));
        var mk = merkwort(w); mount.appendChild(mk);
        D.say(w.w, 0.85, true);
        var ms = 1800 + 700 * w.syl.length, checked = false;
        var again = ui.el("button", { class: "btn" }, [t("showAgain")]); again.hidden = true;
        var writing = ui.el("div", { class: "typebox-wrap" }); writing.hidden = true;
        function hideWord() {
          mk.hidden = true; writing.hidden = false; again.hidden = checked;
          api.prompt(t("p_wType"), true);
          D.say(w.w, 0.85);   // come a scuola: la parola è coperta, si sente ancora
        }
        // "Nochmal zeigen" solo PRIMA del primo controllo: dopo un errore non si sbircia
        again.addEventListener("click", function () {
          if (checked) return;
          MM.audio.sfx("tap"); mk.hidden = false; writing.hidden = true; again.hidden = true; D.say(w.w, 0.85);
          setTimeout(hideWord, ms);
        });
        mount.appendChild(again);
        mount.appendChild(writing);
        writing.appendChild(D.listenBtn(w.w));
        var hk = hooks(w, api);
        var tb = D.typeBox(writing, api, function (typed) { return D.checkWord(typed, w.w); }, false, true,
                           { onWrong: function (r) { checked = true; again.hidden = true; hk.onWrong(r); }, onOk: hk.onOk });
        writing.appendChild(tb.button);
        setTimeout(hideWord, ms);

      } else if (round.mode === "hear") {      // Schreiben: solo la voce, come alla Prüfung
        api.prompt(t("p_dType"));
        mount.appendChild(picture(w));
        D.say(w.w, 0.85, true);
        mount.appendChild(D.listenBtn(w.w));
        wordBox(mount, api, w);

      } else {                                 // article: prima der/die/das, poi la parola
        api.prompt(t("p_hArt"));
        mount.appendChild(picture(w));
        var full = w.art + " " + w.w;
        D.say(full, 0.85, true);
        mount.appendChild(D.listenBtn(full));
        mount.appendChild(holder);
        ui.askChoices(holder, w.art, function () { return ui.shuffle(["der", "die", "das"]); }, function (ok) {
          if (!ok) { recordFirst(api, w, false); api.submit(false, { recall: false, hint: t("h_hArt") }); return; }
          // articolo giusto: resta scritto, ora la parola
          ui.clear(holder);
          mount.appendChild(ui.el("div", { class: "artpick" }, ["✓ " + w.art + " …"]));
          api.prompt(t("p_hThenWrite"));
          mount.appendChild(D.listenBtn(w.w));
          wordBox(mount, api, w);
        });
      }
    }
  };

  // per il test automatico e per tools/make_voice.py
  MM.herbst = { WORDS: WORDS, variants: variants, PLAN: PLAN };
})();
