/* ===== app: router, home/mappa-mondo, sessioni, ricompense ===== */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };
  var root = document.getElementById("app");
  // sezioni della home: fino a 20 (1ª classe) · fino a 100 (2ª classe, quiz) ·
  // rechnen bis 100 (più difficile: tastierino, niente scelte) · tedesco (Diktat)
  var GAME_GROUPS = [
    { key: "sec20",   ids: ["subitizing", "fives", "bonds", "addition", "subtraction"] },
    { key: "sec100",  ids: ["tens", "hundred", "neighbours", "numberline", "patterns", "wall", "triangle"] },
    { key: "secCalc", ids: ["plus100", "minus100", "complete", "always100", "double", "francs", "times", "compare"] },
    { key: "secDe",   ids: ["diktat", "words", "diktatfull"] }
  ];

  function speak(text) { MM.audio.speak(text); }

  function topbar(titleText, opts) {
    opts = opts || {};
    var bar = ui.el("div", { class: "topbar" });
    if (opts.back) {
      var b = ui.el("button", { class: "icon-btn" }, ["←"]);
      b.addEventListener("click", function () { MM.audio.sfx("tap"); opts.back(); });
      bar.appendChild(b);
    }
    bar.appendChild(ui.el("h1", { class: "title" }, [titleText]));
    bar.appendChild(ui.el("div", { class: "spacer" }));
    (opts.actions || []).forEach(function (a) { bar.appendChild(a); });
    return bar;
  }

  /* ---------- HOME / mappa-mondo ---------- */
  function home() {
    ui.clear(root);
    document.title = t("appTitle");
    if (MM.sync) MM.sync.onHome();   // recupera un invio dei progressi rimasto in sospeso

    var gear = ui.el("button", { class: "icon-btn" }, ["⚙️"]);
    gear.addEventListener("click", function () { MM.audio.sfx("tap"); openSettings(); });

    root.appendChild(topbar(t("appTitle"), { actions: [gear] }));

    // eroe + mascotte
    var hero = ui.el("div", { class: "home-hero" }, [
      ui.el("div", { class: "mascot" }, ["🦄"]),
      ui.el("div", { class: "bubble" }, [t("hello")])
    ]);
    root.appendChild(hero);

    // collezione
    var col = MM.storage.collection();
    var keys = Object.keys(col);
    var collection = ui.el("div", { class: "collection" }, [
      ui.el("div", { class: "label" }, [t("collectionLabel")])
    ]);
    if (keys.length === 0) {
      collection.appendChild(ui.el("div", { class: "muted" }, [t("collectionEmpty")]));
    } else {
      keys.forEach(function (k) {
        collection.appendChild(ui.el("span", { class: "sticker" }, [k + (col[k] > 1 ? "×" + col[k] : "")]));
      });
    }
    root.appendChild(collection);

    // carte gioco, a sezioni
    var games = ui.el("div", { class: "games" });
    GAME_GROUPS.forEach(function (grp) {
      games.appendChild(ui.el("div", { class: "section-label" }, [t(grp.key)]));
      grp.ids.forEach(function (id) {
        var g = MM.games[id];
        if (!g) return;
        var st = MM.storage.stars(id);
        var starStr = "";
        for (var i = 0; i < st.max; i++) starStr += (i < st.level ? "⭐" : "☆");
        var card = ui.el("button", { class: "game-card" }, [
          ui.el("div", { class: "emoji" }, [g.emoji]),
          ui.el("div", { class: "grow" }, [
            ui.el("div", { class: "name" }, [t(g.nameKey)]),
            ui.el("div", { class: "sub" }, [t(g.subKey)]),
            ui.el("div", { class: "stars" }, [starStr])
          ])
        ]);
        card.addEventListener("click", function () { MM.audio.unlock(); MM.audio.sfx("tap"); runSession(id); });
        games.appendChild(card);
      });
    });
    root.appendChild(games);

    // accesso genitori (discreto)
    var actions = ui.el("div", { class: "home-actions" });
    var parentBtn = ui.el("button", { class: "btn btn-ghost" }, ["📊 " + t("parent")]);
    parentBtn.addEventListener("click", function () { MM.audio.sfx("tap"); openParentGate(); });
    actions.appendChild(parentBtn);
    root.appendChild(actions);
  }

  /* ---------- IMPOSTAZIONI ---------- */
  function modal(contentNode) {
    var back = ui.el("div", { class: "modal-back" });
    var box = ui.el("div", { class: "modal" });
    box.appendChild(contentNode);
    back.appendChild(box);
    back.addEventListener("click", function (e) { if (e.target === back) document.body.removeChild(back); });
    document.body.appendChild(back);
    return back;
  }

  function openSettings() {
    var content = ui.el("div", {});
    content.appendChild(ui.el("h2", {}, [t("settings")]));

    // lingua
    var langSeg = ui.el("div", { class: "seg" });
    ["de", "en"].forEach(function (l) {
      var btn = ui.el("button", { class: MM.i18n.lang === l ? "on" : "" }, [l === "de" ? "DE" : "EN"]);
      btn.addEventListener("click", function () {
        MM.i18n.setLang(l);
        if (back.parentNode) document.body.removeChild(back);
        home(); openSettings();
      });
      langSeg.appendChild(btn);
    });
    content.appendChild(ui.el("div", { class: "row" }, [ui.el("span", {}, [t("language")]), langSeg]));

    // suono
    var soundSeg = ui.el("div", { class: "seg" });
    [["1", t("on")], ["0", t("off")]].forEach(function (pair) {
      var on = (pair[0] === "1") === MM.audio.on;
      var btn = ui.el("button", { class: on ? "on" : "" }, [pair[1]]);
      btn.addEventListener("click", function () {
        MM.audio.setSound(pair[0] === "1");
        if (back.parentNode) document.body.removeChild(back);
        openSettings();
      });
      soundSeg.appendChild(btn);
    });
    content.appendChild(ui.el("div", { class: "row" }, [ui.el("span", {}, [t("sound")]), soundSeg]));

    // voce: scegli quella che piace di più, con tasto "ascolta"
    var vlang = MM.i18n.voiceLang();
    var vlist = MM.audio.listVoices(vlang);
    var vcur = MM.audio.getVoiceName(vlang);
    var sel = ui.el("select", { class: "voice-select" });
    sel.appendChild(ui.el("option", { value: "" }, [t("autoVoice")]));
    vlist.forEach(function (v) {
      var o = ui.el("option", { value: v.name }, [v.name]);
      if (v.name === vcur) o.setAttribute("selected", "selected");
      sel.appendChild(o);
    });
    try { sel.value = vcur; } catch (e) {}
    sel.addEventListener("change", function () {
      MM.audio.setVoiceName(vlang, sel.value);
      MM.audio.unlock(); MM.audio.speak(MM.i18n.t("hello"));
    });
    var testBtn = ui.el("button", { class: "icon-btn" }, ["🔊"]);
    testBtn.style.background = "var(--violet)";
    testBtn.addEventListener("click", function () { MM.audio.unlock(); MM.audio.speak(MM.i18n.t("hello")); });
    var vright = ui.el("div", {}, [sel, testBtn]);
    vright.style.display = "flex"; vright.style.gap = "8px"; vright.style.alignItems = "center";
    vright.style.flexWrap = "wrap"; vright.style.justifyContent = "flex-end";
    content.appendChild(ui.el("div", { class: "row" }, [ui.el("span", {}, [t("voice")]), vright]));
    // nel Browser di Samsung Kids (WebView) non c'è nessuna voce del dispositivo: lo diciamo chiaramente
    content.appendChild(ui.el("div", { class: "muted" }, [("speechSynthesis" in window) ? t("voiceDevice") : t("voiceNoDevice")]));

    var close = ui.el("button", { class: "btn btn-pink" }, [t("close")]);
    close.style.marginTop = "12px"; close.style.width = "100%";
    close.addEventListener("click", function () { if (back.parentNode) document.body.removeChild(back); });
    content.appendChild(close);

    var back = modal(content);
  }

  /* ---------- ACCESSO GENITORI (mini-gate) ---------- */
  function openParentGate() {
    var target = ui.randInt(3, 9);
    var content = ui.el("div", {});
    content.appendChild(ui.el("div", { class: "gate-prompt" }, [t("parentGate", { n: target })]));

    var pad = ui.el("div", { class: "choices" });
    pad.style.maxWidth = "320px";
    // sei numeri, con il target garantito tra questi
    var nums = ui.shuffle([target].concat(ui.shuffle([1,2,3,4,5,6,7,8,9].filter(function(x){return x!==target;})).slice(0,5)));
    nums.forEach(function (v) {
      var b = ui.el("button", { class: "choice" }, [String(v)]);
      b.addEventListener("click", function () {
        if (v === target) {
          if (back.parentNode) document.body.removeChild(back);
          renderParent();
        } else { ui.shake(content); }
      });
      pad.appendChild(b);
    });
    content.appendChild(pad);

    var close = ui.el("button", { class: "btn btn-ghost" }, [t("close")]);
    close.style.marginTop = "14px"; close.style.width = "100%"; close.style.color = "#6a4bb6";
    close.style.borderColor = "#6a4bb6";
    close.addEventListener("click", function () { if (back.parentNode) document.body.removeChild(back); });
    content.appendChild(close);

    var back = modal(content);
  }

  function renderParent() {
    ui.clear(root);
    root.appendChild(topbar(t("parent"), { back: home }));
    var wrap = ui.el("div", { class: "parent" });
    root.appendChild(wrap);
    MM.parent.render(wrap);
  }

  /* ---------- SESSIONE DI GIOCO ---------- */
  function runSession(id, levelOverride) {
    var game = MM.games[id];
    var skill = MM.storage.getSkill(id);
    var level = levelOverride || skill.level;
    var total = game.rounds || 6;
    var idx = 0, answered = false, streak = 0, wrongs = 0;
    var results = [];

    ui.clear(root);
    document.title = t(game.nameKey);
    root.appendChild(topbar(t(game.nameKey), { back: home }));

    var dots = ui.el("div", { class: "progress-dots" });
    for (var i = 0; i < total; i++) dots.appendChild(ui.el("i", {}));
    root.appendChild(dots);

    var screen = ui.el("div", { class: "game-screen" });
    var promptEl = ui.el("div", { class: "prompt" });
    var hintEl = ui.el("div", { class: "hint" });
    hintEl.hidden = true;
    var stage = ui.el("div", { class: "stage" });
    screen.appendChild(promptEl);
    screen.appendChild(hintEl);
    screen.appendChild(stage);
    root.appendChild(screen);

    // REGOLA DI LAURA: se sbaglia non si mostra MAI la risposta giusta. Riceve una
    // spiegazione (hint) che l'aiuta a ragionare e riprova finché ci arriva da sola.
    // Per le statistiche conta "giusta" solo se al primo tentativo.
    var api = {
      level: level,
      gem: game.gem || "💎",
      total: total,
      get round() { return idx; },
      get attempts() { return wrongs; },
      prompt: function (text, quiet) {
        promptEl.textContent = text;
        hintEl.hidden = true; hintEl.textContent = "";
        if (!quiet) speak(text);
      },
      submit: function (correct, opts) {
        if (answered) return;
        opts = opts || {};

        if (correct) {
          answered = true;
          var firstTry = (wrongs === 0);
          results.push({ correct: firstTry, recall: !!opts.recall && firstTry });
          hintEl.hidden = true;
          if (firstTry) {
            streak++;
            MM.audio.sfx("correct"); ui.sparkle(16); speak(MM.i18n.pick("praise"));
            if (streak === 3 || streak >= 5) {     // combo: festa extra
              ui.party(40); MM.audio.sfx("cheer"); speak(MM.i18n.pick("streak"));
            }
          } else {
            streak = 0;
            MM.audio.sfx("correct"); ui.sparkle(10); speak(MM.i18n.pick("gotIt"));
          }
          if (dots.children[idx]) dots.children[idx].classList.add(firstTry ? "on" : "late");
          idx++;
          setTimeout(nextRound, 1000);
        } else {
          wrongs++;
          streak = 0;
          MM.audio.sfx("wrong"); ui.shake(stage);
          var msg = MM.i18n.pick("tryAgain");
          var hint = opts.hint || "";
          hintEl.textContent = "💡 " + (hint || msg);
          hintEl.hidden = false;
          speak(msg + " " + hint);
          // nessun avanzamento: il gioco resta aperto per un nuovo tentativo
        }
      }
    };

    function nextRound() {
      if (idx >= total) return endSession();
      answered = false; wrongs = 0;
      ui.clear(stage);
      promptEl.textContent = "";
      hintEl.hidden = true; hintEl.textContent = "";
      var round = game.makeRound(level, idx);   // idx: per i giochi in ordine fisso (Ganzes Diktat)
      game.render(stage, round, api);
    }

    function endSession() {
      var info = MM.storage.recordSession(id, results);
      var correctCount = results.filter(function (r) { return r.correct; }).length;
      var perfect = results.length > 0 && correctCount === results.length;
      var earned = [info.reward];
      if (perfect) { earned.push(MM.storage.addSticker()); earned.push(MM.storage.addSticker()); }
      reward(id, info, { correctCount: correctCount, total: results.length, perfect: perfect, earned: earned });
    }

    nextRound();
  }

  /* ---------- RICOMPENSA ---------- */
  function reward(id, info, sum) {
    ui.clear(root);
    var box = ui.el("div", { class: "reward" });

    if (sum.perfect) {
      MM.audio.sfx("party"); ui.party(90);
      box.appendChild(ui.el("div", { class: "big" }, ["🦄"]));
      box.appendChild(ui.el("div", { class: "banner" }, ["🌈 " + t("perfect") + " 🌈"]));
      box.appendChild(ui.el("h2", {}, [t("allCorrect")]));
    } else {
      MM.audio.sfx("win"); ui.party(30);
      box.appendChild(ui.el("div", { class: "big" }, ["🦄"]));
      box.appendChild(ui.el("h2", {}, [t("sessionDone")]));
    }

    box.appendChild(ui.el("div", { class: "title" }, ["⭐ " + sum.correctCount + "/" + sum.total]));
    if (info.leveledUp) box.appendChild(ui.el("div", { class: "title" }, ["🎉 " + t("levelUp")]));

    box.appendChild(ui.el("div", {}, [t("youEarned")]));
    var row = ui.el("div", { class: "earned" });
    row.style.display = "flex"; row.style.gap = "12px"; row.style.justifyContent = "center";
    sum.earned.forEach(function (e) { row.appendChild(ui.el("span", {}, [e])); });
    box.appendChild(row);
    box.appendChild(ui.el("div", { class: "muted", style: "color:#fff" }, [t("newFriend")]));

    var cont = ui.el("button", { class: "btn btn-pink" }, [t("tapContinue")]);
    cont.style.marginTop = "10px";
    cont.addEventListener("click", function () { MM.audio.sfx("tap"); home(); });
    box.appendChild(cont);

    root.appendChild(box);
    speak((sum.perfect ? t("perfect") + " " + t("allCorrect") : t("sessionDone")) + (info.leveledUp ? " " + t("levelUp") : ""));
  }

  /* ---------- boot ---------- */
  window.MM = window.MM || {};
  window.MM.app = { home: home, runSession: runSession };

  // sblocca l'audio al primo tocco (policy dei browser)
  window.addEventListener("pointerdown", function once() {
    MM.audio.unlock();
    window.removeEventListener("pointerdown", once);
  }, { once: true });

  // import dei progressi da un link (#import=<base64url di mm.v1>): serve per portare i progressi
  // su un altro dispositivo o browser (es. da Chrome al Browser personale di Samsung Kids).
  // Non sovrascrive mai progressi più ricchi di quelli che arrivano.
  (function importFromLink() {
    var m = /[#&]import=([A-Za-z0-9+\/=_-]+)/.exec((typeof location !== "undefined" && location.hash) || "");
    if (!m) return;
    try {
      var b64 = m[1].replace(/-/g, "+").replace(/_/g, "/");
      var data = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (data && data.skills) {
        delete data._meta;
        var here = MM.storage.totals(), there = MM.storage.totals(data);
        if (there.attempts >= here.attempts) {
          localStorage.setItem("mm.v1", JSON.stringify(data));
          try { localStorage.removeItem("mm.sync_hash"); } catch (e) {}   // il nuovo browser rimanda i progressi
        }
      }
    } catch (e) {}
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  })();

  // avvio diretto di un gioco (per prove): index.html#play=tens&level=3
  var direct = /play=(\w+)(?:&level=(\d+))?/.exec((typeof location !== "undefined" && location.hash) || "");
  if (direct && MM.games[direct[1]]) runSession(direct[1], direct[2] ? parseInt(direct[2], 10) : undefined);
  else home();
})();
