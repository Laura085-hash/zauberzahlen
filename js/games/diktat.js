/* ===== Gioco 13: Diktat "Im Wald" — Lernwörter hören, erkennen und schreiben =====
   Testo della scuola: Mia geht mit ihrem Bruder in den Wald. Die Sonne scheint und die Vögel singen.
   Am Bach sehen die Kinder ein Eichhörnchen. Es springt schnell auf einen Baum. Mia isst einen Apfel.
   Am Abend gehen sie müde nach Hause.
   Le parole sono sempre pronunciate in tedesco, qualunque sia la lingua dell'app.
   Regola: se sbaglia non si mostra mai la parola giusta — solo dove sta l'errore e un suggerimento. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var DE = "de-DE";

  // gaps: [inizio, lunghezza, [giusto, sbagliato, sbagliato…]] · syl: sillabe (voce) · art: articolo · hard: difficoltà 1–5
  var WORDS = [
    { w: "Bruder", noun: true,  art: "der", syl: ["Bru", "der"], hard: 2, gaps: [[0, 1, ["B", "b", "P"]], [3, 1, ["d", "t", "dd"]]] },
    { w: "Wald", noun: true,  art: "der", syl: ["Wald"], hard: 1, gaps: [[3, 1, ["d", "t", "dt"]], [0, 1, ["W", "V", "w"]]] },
    { w: "Sonne", noun: true,  art: "die", syl: ["Son", "ne"], hard: 2, gaps: [[2, 2, ["nn", "n", "hn"]], [0, 1, ["S", "s", "Z"]]] },
    { w: "Vögel", noun: true,  art: "die", syl: ["Vö", "gel"], hard: 4, gaps: [[0, 1, ["V", "F", "W"]], [1, 1, ["ö", "o", "e"]]] },
    { w: "Bach", noun: true,  art: "der", syl: ["Bach"], hard: 1, gaps: [[2, 2, ["ch", "g", "k"]], [0, 1, ["B", "b", "P"]]] },
    { w: "Eichhörnchen", noun: true,  art: "das", syl: ["Eich", "hörn", "chen"], hard: 5, gaps: [[0, 2, ["Ei", "Ai", "Ie"]], [5, 1, ["ö", "o", "e"]], [2, 3, ["chh", "ch", "hh"]]] },
    { w: "springt", noun: false, syl: ["springt"], hard: 4, gaps: [[0, 2, ["sp", "schp", "sb"]], [4, 2, ["ng", "nk", "n"]]] },
    { w: "isst", noun: false, syl: ["isst"], hard: 3, gaps: [[1, 2, ["ss", "s", "ß"]], [0, 1, ["i", "I", "ie"]]] },
    { w: "schnell", noun: false, syl: ["schnell"], hard: 4, gaps: [[5, 2, ["ll", "l", "hl"]], [0, 3, ["sch", "sh", "ch"]]] },
    { w: "Apfel", noun: true,  art: "der", syl: ["Ap", "fel"], hard: 3, gaps: [[1, 2, ["pf", "f", "ff"]], [0, 1, ["A", "a", "E"]]] },
    { w: "Abend", noun: true,  art: "der", syl: ["A", "bend"], hard: 2, gaps: [[4, 1, ["d", "t", "dt"]], [0, 1, ["A", "a", "O"]]] },
    { w: "müde", noun: false, syl: ["mü", "de"], hard: 3, gaps: [[1, 1, ["ü", "u", "ie"]], [0, 1, ["m", "M", "n"]]] }
  ];
  var SENTENCES = [
    "Mia geht mit ihrem Bruder in den Wald.",
    "Die Sonne scheint und die Vögel singen.",
    "Am Bach sehen die Kinder ein Eichhörnchen.",
    "Es springt schnell auf einen Baum.",
    "Mia isst einen Apfel.",
    "Am Abend gehen sie müde nach Hause."
  ];

  function say(text, rate, queue) { MM.audio.unlock(); MM.audio.speak(text, DE, rate || 0.85, queue); }
  function pickWord() { return WORDS[ui.randInt(0, WORDS.length - 1)]; }
  function wordsIn(sentence) { return WORDS.filter(function (w) { return sentence.indexOf(w.w) >= 0; }); }

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

  function listenBtn(text, rate) {
    var b = ui.el("button", { class: "btn" }, [t("listen")]);
    b.addEventListener("click", function () { MM.audio.sfx("tap"); say(text, rate); });
    return b;
  }

  function input(wide) {
    var i = ui.el("input", { type: "text", class: "typein" + (wide ? " wide" : ""), autocapitalize: "off", autocorrect: "off",
                             spellcheck: "false", autocomplete: "off", placeholder: t("typeHere"), enterkeyhint: "done" });
    return i;
  }

  // mostra la parola scritta con le lettere sbagliate in rosso (senza dire quali sarebbero giuste)
  function diffWord(typed, target) {
    var d = ui.el("div", { class: "diff" });
    for (var i = 0; i < typed.length; i++) {
      var bad = i >= target.length || typed[i] !== target[i];
      d.appendChild(ui.el("span", { class: bad ? "bad" : "" }, [typed[i]]));
    }
    return d;
  }
  function diffSentence(typedWords, targetWords) {
    var d = ui.el("div", { class: "diff" });
    d.style.fontSize = "1.15rem";
    typedWords.forEach(function (w, i) {
      if (i > 0) d.appendChild(document.createTextNode(" "));
      var bad = i >= targetWords.length || w !== targetWords[i];
      d.appendChild(ui.el("span", { class: bad ? "bad" : "" }, [w]));
    });
    return d;
  }

  function checkWord(typed, target) {
    var tt = typed.trim();
    if (tt === target) return { ok: true };
    if (!tt) return { ok: false, hint: t("h_dSpell") };
    if (tt.toLowerCase() === target.toLowerCase()) return { ok: false, hint: t("h_dCase"), diff: diffWord(tt, target) };
    if (tt.length !== target.length) return { ok: false, hint: t("h_dLength"), diff: diffWord(tt, target) };
    return { ok: false, hint: t("h_dLetters"), diff: diffWord(tt, target) };
  }
  function norm(s) { return s.replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim(); }
  function checkSentence(typed, target) {
    var a = norm(typed), b = norm(target);
    if (a === b) return { ok: true };
    if (!a) return { ok: false, hint: t("h_dSentence") };
    if (a.toLowerCase() === b.toLowerCase()) return { ok: false, hint: t("h_dCase"), diff: diffSentence(a.split(" "), b.split(" ")) };
    return { ok: false, hint: t("h_dWords"), diff: diffSentence(a.split(" "), b.split(" ")) };
  }

  // campo di scrittura + bottoni; verifica con check(typed) → {ok, hint, diff}
  // hooks (opzionali): onWrong(res) / onOk(res), chiamati dopo api.submit
  function typeBox(mount, api, check, wide, recall, hooks) {
    hooks = hooks || {};
    var box = ui.el("div", { class: "typebox" });
    var inp = input(wide);
    var fb = ui.el("div", {});
    var btn = ui.el("button", { class: "btn btn-pink check" }, [t("check")]);
    function go() {
      MM.audio.unlock();
      var res = check(inp.value);
      ui.clear(fb);
      if (res.diff) fb.appendChild(res.diff);
      if (!res.ok) ui.shake(inp);
      api.submit(res.ok, { recall: recall, hint: res.hint });
      if (!res.ok) { try { inp.focus(); } catch (e) {} }
      if (res.ok) { if (hooks.onOk) hooks.onOk(res); } else if (hooks.onWrong) hooks.onWrong(res);
    }
    btn.addEventListener("click", go);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go(); } });
    box.appendChild(inp); box.appendChild(fb);
    mount.appendChild(box);
    return { input: inp, button: btn };
  }

  // helper condivisi con "Schwere Wörter" e "Ganzes Diktat"
  MM.diktat = { WORDS: WORDS, SENTENCES: SENTENCES, say: say, listenBtn: listenBtn, input: input, typeBox: typeBox,
                checkWord: checkWord, diffWord: diffWord, diffSentence: diffSentence, norm: norm, wordsIn: wordsIn };

  MM.games.diktat = {
    id: "diktat", nameKey: "g_diktat", subKey: "g_diktat_sub", emoji: "📝", gem: "🌲", rounds: 6,

    // 1: richtige Schreibweise wählen · 2: fehlende Buchstaben · 3: Wort schreiben · 4: Lückensatz · 5: ganzer Satz
    makeRound: function (level) {
      var word = pickWord();
      if (level === 1) return { mode: "spell", word: word };
      if (level === 2) return { mode: "gap", word: word, gap: word.gaps[ui.randInt(0, word.gaps.length - 1)] };
      if (level === 3) return { mode: "type", word: word };
      var s = SENTENCES[ui.randInt(0, SENTENCES.length - 1)];
      if (level === 4) { var ws = wordsIn(s); return { mode: "sentence", sentence: s, word: ws[ui.randInt(0, ws.length - 1)] }; }
      return { mode: "full", sentence: s };
    },

    render: function (mount, round, api) {
      var holder = ui.el("div", { class: "holder words" });
      var w = round.word;

      if (round.mode === "spell") {
        api.prompt(t("p_dSpell"));
        say(w.w, 0.85, true);
        mount.appendChild(listenBtn(w.w));
        mount.appendChild(holder);
        ui.askChoices(holder, w.w, function () { return ui.shuffle([w.w].concat(variants(w, 2))); }, function (ok) {
          api.submit(ok, { recall: false, hint: t("h_dSpell") });
        });

      } else if (round.mode === "gap") {
        api.prompt(t("p_dGap"));
        say(w.w, 0.85, true);
        var g = round.gap;
        var gapEl = ui.el("span", { class: "gap" }, ["?"]);
        mount.appendChild(ui.el("div", { class: "gapword" }, [
          ui.el("span", {}, [w.w.slice(0, g[0])]), gapEl, ui.el("span", {}, [w.w.slice(g[0] + g[1])])
        ]));
        mount.appendChild(listenBtn(w.w));
        mount.appendChild(holder);
        ui.askChoices(holder, g[2][0], function () { return ui.shuffle(g[2].slice()); }, function (ok) {
          if (ok) gapEl.textContent = g[2][0];
          api.submit(ok, { recall: false, hint: t("h_dGap") });
        });

      } else if (round.mode === "type") {
        api.prompt(t("p_dType"));
        say(w.w, 0.85, true);
        mount.appendChild(listenBtn(w.w));
        var tb = typeBox(mount, api, function (typed) { return checkWord(typed, w.w); }, false, true);
        mount.appendChild(tb.button);

      } else if (round.mode === "sentence") {
        api.prompt(t("p_dSentence"));
        say(round.sentence, 0.8, true);
        var parts = round.sentence.split(w.w);
        mount.appendChild(ui.el("div", { class: "sentence" }, [
          ui.el("span", {}, [parts[0]]), ui.el("span", { class: "blank" }, [" "]), ui.el("span", {}, [parts.slice(1).join(w.w)])
        ]));
        mount.appendChild(listenBtn(round.sentence, 0.8));
        var tb2 = typeBox(mount, api, function (typed) {
          var r = checkWord(typed, w.w);
          if (!r.ok && !r.diff) r.hint = t("h_dSentence");
          return r;
        }, false, true);
        mount.appendChild(tb2.button);

      } else { // full
        api.prompt(t("p_dFull"));
        say(round.sentence, 0.8, true);
        mount.appendChild(listenBtn(round.sentence, 0.8));
        var tb3 = typeBox(mount, api, function (typed) { return checkSentence(typed, round.sentence); }, true, true);
        mount.appendChild(tb3.button);
      }
    }
  };
})();
