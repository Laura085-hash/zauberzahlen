/* ===== Gioco 20: Schwere Wörter — die Lernwörter selbst schreiben =====
   Qui si scrive subito (niente scelte): le parole difficili (Eichhörnchen, springt, schnell, Vögel …)
   escono più spesso, e quelle che Joy sbaglia tornano ancora di più (statistiche per parola).
   Metodo della scuola: anschauen – merken – schreiben, Silbe für Silbe.
   Regola: dopo un errore mai la parola giusta: lettere rosse + sillabe a voce. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); }, D = MM.diktat;
  var lastWord = null;

  function weightOf(w, stats) {
    var s = stats[w.w] || { r: 0, w: 0 };
    return Math.max(1, w.hard + 3 * s.w - s.r);
  }
  function pickWeighted() {
    var stats = MM.storage.wordStats();
    var pool = D.WORDS.filter(function (w) { return w !== lastWord; });
    var total = 0, i;
    for (i = 0; i < pool.length; i++) total += weightOf(pool[i], stats);
    var r = Math.random() * total;
    for (i = 0; i < pool.length; i++) { r -= weightOf(pool[i], stats); if (r < 0) break; }
    lastWord = pool[Math.min(i, pool.length - 1)];
    return lastWord;
  }
  function sentenceOf(w) { return D.SENTENCES.filter(function (s) { return s.indexOf(w.w) >= 0; })[0]; }

  // la parola con le sillabe colorate a turno (anschauen & merken)
  function merkwort(w) {
    var el = ui.el("div", { class: "merkwort" });
    w.syl.forEach(function (s, i) { el.appendChild(ui.el("span", { class: i % 2 ? "s2" : "s1" }, [s])); });
    return el;
  }

  // statistiche per parola (solo il 1° tentativo conta) + sillabe a voce dopo un errore
  function hooks(w, api) {
    return {
      onWrong: function () { if (api.attempts === 1) MM.storage.recordWord(w.w, false); MM.audio.speakSyllables(w.syl); },
      onOk: function () { if (api.attempts === 0) MM.storage.recordWord(w.w, true); }
    };
  }

  function checkArticle(typed, w) {
    var tt = typed.trim().replace(/\s+/g, " "), target = w.art + " " + w.w;
    if (tt === target) return { ok: true };
    if (!tt) return { ok: false, hint: t("h_wArticle") };
    var parts = tt.split(" ");
    if (parts.length < 2 || parts[0].toLowerCase() !== w.art) return { ok: false, hint: t("h_wArticle"), diff: D.diffWord(tt, target) };
    return D.checkWord(tt, target);
  }

  function wordBox(mount, api, w) {
    var tb = D.typeBox(mount, api, function (typed) { return D.checkWord(typed, w.w); }, false, true, hooks(w, api));
    mount.appendChild(tb.button);
    return tb;
  }

  MM.games.words = {
    id: "words", nameKey: "g_words", subKey: "g_words_sub", emoji: "✍️", gem: "🌲", rounds: 6,

    // 1: anschauen, merken, schreiben · 2: Silben hören, schreiben · 3: nur hören, schreiben
    // 4: das Wort im Satz · 5: Nomen mit Artikel (der/die/das), andere Wörter nur hören
    makeRound: function (level) {
      var w = pickWeighted();
      if (level === 1) return { mode: "merk", word: w };
      if (level === 2) return { mode: "syll", word: w };
      if (level === 3) return { mode: "hear", word: w };
      if (level === 4) return { mode: "sentence", word: w, sentence: sentenceOf(w) };
      return w.noun ? { mode: "article", word: w } : { mode: "hear", word: w };
    },

    render: function (mount, round, api) {
      var w = round.word;

      if (round.mode === "merk") {
        api.prompt(t("p_wMerk"));
        var mk = merkwort(w); mount.appendChild(mk);
        D.say(w.w, 0.85, true);
        setTimeout(function () {
          if (mk.parentNode) mk.parentNode.removeChild(mk);
          api.prompt(t("p_wType"), true);
          D.say(w.w, 0.85);   // la parola sparisce, la voce la ripete
          mount.appendChild(D.listenBtn(w.w));
          wordBox(mount, api, w);
        }, 1800 + 700 * w.syl.length);

      } else if (round.mode === "syll") {
        api.prompt(t("p_wSyll"));
        D.say(w.w, 0.85, true); MM.audio.speakSyllables(w.syl);
        var b = ui.el("button", { class: "btn" }, [t("listen")]);
        b.addEventListener("click", function () { MM.audio.sfx("tap"); D.say(w.w, 0.85); MM.audio.speakSyllables(w.syl); });
        mount.appendChild(b);
        wordBox(mount, api, w);

      } else if (round.mode === "hear") {
        api.prompt(t("p_dType"));
        D.say(w.w, 0.85, true);
        mount.appendChild(D.listenBtn(w.w));
        wordBox(mount, api, w);

      } else if (round.mode === "sentence") {
        api.prompt(t("p_dSentence"));
        D.say(round.sentence, 0.8, true);
        var parts = round.sentence.split(w.w);
        mount.appendChild(ui.el("div", { class: "sentence" }, [
          ui.el("span", {}, [parts[0]]), ui.el("span", { class: "blank" }, [" "]), ui.el("span", {}, [parts.slice(1).join(w.w)])
        ]));
        mount.appendChild(D.listenBtn(round.sentence, 0.8));
        var tb = D.typeBox(mount, api, function (typed) {
          var r = D.checkWord(typed, w.w);
          if (!r.ok && !r.diff) r.hint = t("h_dSentence");
          return r;
        }, false, true, hooks(w, api));
        mount.appendChild(tb.button);

      } else { // article: "der Bruder"
        api.prompt(t("p_wArticle"));
        var full = w.art + " " + w.w;
        D.say(full, 0.85, true);
        mount.appendChild(D.listenBtn(full));
        var tb2 = D.typeBox(mount, api, function (typed) { return checkArticle(typed, w); }, false, true, hooks(w, api));
        mount.appendChild(tb2.button);
      }
    }
  };
})();
