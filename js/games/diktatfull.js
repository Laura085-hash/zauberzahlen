/* ===== Gioco 21: Ganzes Diktat — alle sechs Sätze "Im Wald" in der richtigen Reihenfolge =====
   Come a scuola: una sessione = tutto il dettato, frase per frase (round 1 = frase 1 … round 6 = frase 6).
   Scala d'aiuto che si toglie: abschreiben → merken (Dosendiktat) → hören con un tratto per parola →
   hören e basta → a velocità normale. Qui contano anche la maiuscola iniziale e il punto finale.
   Regola: dopo un errore mai la frase giusta: parole rosse + suggerimento. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); }, D = MM.diktat;

  // controllo severo: maiuscole, parole e punto finale
  function checkStrict(typed, target) {
    var a = typed.replace(/\s+/g, " ").trim(), b = target;
    if (a === b) return { ok: true };
    if (!a) return { ok: false, hint: t("h_dSentence") };
    var ta = a.split(" "), tb = b.split(" ");
    var diff = D.diffSentence(ta, tb);
    if (a.toLowerCase() === b.toLowerCase()) return { ok: false, hint: t(a[0] !== b[0] ? "h_fStart" : "h_dCase"), diff: diff };
    if (D.norm(a) === D.norm(b)) return { ok: false, hint: t("h_fPeriod"), diff: diff };
    if (ta.length < tb.length) return { ok: false, hint: t("h_fMissing"), diff: diff };
    return { ok: false, hint: t("h_dWords"), diff: diff };
  }

  function showtext(s) { return ui.el("div", { class: "showtext" }, [s]); }

  // un tratto per ogni parola (lungo quanto la parola), più il punto
  function blanks(s) {
    var box = ui.el("div", { class: "blanks" });
    D.norm(s).split(" ").forEach(function (w) {
      var l = ui.el("span", { class: "wline" }); l.style.width = (10 + 9 * w.length) + "px"; box.appendChild(l);
    });
    box.appendChild(ui.el("span", { class: "dot" }, ["."]));
    return box;
  }

  function sentenceBox(mount, api, s) {
    var tb = D.typeBox(mount, api, function (typed) { return checkStrict(typed, s); }, true, true);
    mount.appendChild(tb.button);
    return tb;
  }

  MM.games.diktatfull = {
    id: "diktatfull", nameKey: "g_diktatfull", subKey: "g_diktatfull_sub", emoji: "📖", gem: "🌲", rounds: 6,

    // 1: abschreiben · 2: lesen, merken, auswendig schreiben · 3: hören, ein Strich pro Wort
    // 4: hören und schreiben · 5: wie in der Schule (normales Tempo)
    makeRound: function (level, idx) {
      var i = idx || 0;
      var modes = ["copy", "memo", "blanks", "dictate", "dictate"];
      return { mode: modes[Math.min(level, 5) - 1], sentence: D.SENTENCES[i % D.SENTENCES.length], i: i + 1, rate: level >= 5 ? 0.95 : 0.8 };
    },

    render: function (mount, round, api) {
      var s = round.sentence, i = round.i;

      if (round.mode === "copy") {
        api.prompt(t("p_fCopy", { i: i }));
        D.say(s, round.rate, true);
        mount.appendChild(showtext(s));
        mount.appendChild(D.listenBtn(s, round.rate));
        sentenceBox(mount, api, s);

      } else if (round.mode === "memo") {
        api.prompt(t("p_fMemo", { i: i }));
        D.say(s, round.rate, true);
        var txt = showtext(s); mount.appendChild(txt);
        var ms = 1200 + 900 * D.norm(s).split(" ").length;
        var again = ui.el("button", { class: "btn" }, [t("showAgain")]); again.hidden = true;
        var writing = ui.el("div", { class: "typebox-wrap" }); writing.hidden = true;
        var checked = false;
        function hideText() {
          txt.hidden = true; writing.hidden = false; again.hidden = checked;
          api.prompt(t("p_fMemoType"), true);
          D.say(s, round.rate);   // come la maestra: il testo sparisce, la frase si sente
        }
        again.addEventListener("click", function () {
          if (checked) return;
          MM.audio.sfx("tap"); txt.hidden = false; writing.hidden = true; again.hidden = true; D.say(s, round.rate);
          setTimeout(hideText, ms);
        });
        mount.appendChild(again);
        mount.appendChild(writing);
        writing.appendChild(D.listenBtn(s, round.rate));
        var tb = D.typeBox(writing, api, function (typed) { return checkStrict(typed, s); }, true, true,
                           { onWrong: function () { checked = true; again.hidden = true; } });
        writing.appendChild(tb.button);
        setTimeout(hideText, ms);

      } else if (round.mode === "blanks") {
        api.prompt(t("p_fBlanks", { i: i }));
        D.say(s, round.rate, true);
        mount.appendChild(blanks(s));
        mount.appendChild(D.listenBtn(s, round.rate));
        sentenceBox(mount, api, s);

      } else { // dictate
        api.prompt(t("p_fDictate", { i: i }));
        D.say(s, round.rate, true);
        mount.appendChild(D.listenBtn(s, round.rate));
        sentenceBox(mount, api, s);
      }
    }
  };
})();
