/* ===== Gioco 6: Zehner & Einer — Eierschachteln (bündeln), Zehnerstriche/Einerpunkte, Stellentafel =====
   Dal quaderno "Bundling" e "Hundred Array": scatole da 10 uova + uova sciolte, barre = decine,
   punti = unità, tabella Z|E (T|O). Errori tipici visti: "9|10" (10 unità non raggruppate),
   "06" per 6 e "60" letto male. */
(function () {
  var ui = MM.ui, t = function (k, v) { return MM.i18n.t(k, v); };

  function carton() {
    var c = ui.el("div", { class: "carton" });
    for (var i = 0; i < 10; i++) c.appendChild(ui.el("span", { class: "egg" }, ["🥚"]));
    c.appendChild(ui.el("span", { class: "badge" }, ["10"]));
    return c;
  }

  function eggs(cartons, loose) {
    var box = ui.el("div", { class: "eggbox" });
    var cs = ui.el("div", { class: "cartons" });
    for (var i = 0; i < cartons; i++) cs.appendChild(carton());
    var ls = ui.el("div", { class: "loose" });
    for (var j = 0; j < loose; j++) ls.appendChild(ui.el("span", { class: "egg" }, ["🥚"]));
    box.appendChild(cs); box.appendChild(ls);
    return box;
  }

  // 10 uova sciolte "saltano" dentro una scatola nuova
  function bundleAnim(box) {
    var loose = box.querySelectorAll(".loose .egg");
    var n = Math.min(10, loose.length);
    for (var i = 0; i < n; i++) loose[i].classList.add("leave");
    MM.audio.sfx("sparkle");
    setTimeout(function () {
      for (var k = 0; k < n; k++) if (loose[k].parentNode) loose[k].parentNode.removeChild(loose[k]);
      var c = carton(); c.classList.add("pop");
      box.querySelector(".cartons").appendChild(c);
      MM.audio.sfx("sparkle");
    }, 550);
  }

  function pvChart() {
    return ui.el("div", { class: "pv" }, [
      ui.el("div", { class: "h" }, [t("pvT"), ui.el("small", {}, [t("pvTens")])]),
      ui.el("div", { class: "h" }, [t("pvO"), ui.el("small", {}, [t("pvOnes")])]),
      ui.el("div", { class: "v q", "data-slot": "t" }, ["?"]),
      ui.el("div", { class: "v", "data-slot": "o" }, [""])
    ]);
  }

  // due passi: prima i Zehner, poi gli Einer, dentro la Stellentafel
  function askChart(mount, round, api, hintT, hintO, promptT, afterT) {
    var pv = pvChart(); mount.appendChild(pv);
    var tCell = pv.querySelector('[data-slot="t"]'), oCell = pv.querySelector('[data-slot="o"]');
    var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
    api.prompt(promptT || t("p_howManyTens"));
    ui.askChoices(holder, round.t, function () { return ui.choicesFrom(round.t, round.tCands, 3, 0, 9); }, function (ok) {
      if (!ok) return api.submit(false, { hint: hintT });
      tCell.textContent = String(round.t); tCell.classList.remove("q");
      MM.audio.sfx("sparkle"); ui.sparkle(6);
      if (afterT) afterT();
      oCell.textContent = "?"; oCell.classList.add("q");
      setTimeout(function () {
        api.prompt(t("p_howManyOnes"));
        ui.askChoices(holder, round.o, function () { return ui.choicesFrom(round.o, round.oCands, 3, 0, round.oMax || 9); }, function (ok2) {
          if (!ok2) return api.submit(false, { hint: hintO });
          oCell.textContent = String(round.o); oCell.classList.remove("q");
          api.submit(true, { recall: false });
        });
      }, afterT ? 1400 : 450);
    });
  }

  MM.games.tens = {
    id: "tens", nameKey: "g_tens", subKey: "g_tens_sub", emoji: "🥚", gem: "🥚", rounds: 6,

    // 1: Striche/Punkte → Stellentafel · 2: Eierschachteln → Stellentafel (auch 0 Einer)
    // 3: Striche/Punkte lesen (Fallen: 60 vs 6) · 4: Zahl selbst legen · 5: Bündeln (10 Einer = 1 Zehner)
    makeRound: function (level) {
      var tn, on;
      if (level === 1) {
        tn = ui.randInt(1, 3); on = ui.randInt(1, 9);
        return { mode: "chart", rep: "bars", t: tn, o: on, n: tn * 10 + on,
                 tCands: [tn - 1, tn + 1, on, tn + 2], oCands: [on - 1, on + 1, tn, on + 2] };
      }
      if (level === 2) {
        tn = ui.randInt(1, 5); on = Math.random() < 0.3 ? 0 : ui.randInt(1, 9);
        return { mode: "chart", rep: "eggs", t: tn, o: on, n: tn * 10 + on, oMax: 10,
                 tCands: [tn - 1, tn + 1, on, tn + 2], oCands: [on - 1, on + 1, tn, on + 2, 10] };
      }
      if (level === 3) {
        var kind = ui.randInt(1, 3), n, cands;
        if (kind === 1) { tn = ui.randInt(2, 9); on = 0; n = tn * 10; cands = [tn, tn * 10 + tn, n + 10, n - 10, tn * 10 + 1]; }
        else if (kind === 2) { tn = 0; on = ui.randInt(2, 9); n = on; cands = [on * 10, 10 + on, on + 1, on - 1]; }
        else { tn = ui.randInt(1, 9); on = ui.randInt(1, 9); n = tn * 10 + on; cands = [on * 10 + tn, n + 10, n - 10, n + 1, n - 1]; }
        return { mode: "read", t: tn, o: on, n: n, cands: cands };
      }
      if (level === 4) {
        tn = ui.randInt(1, 9); on = ui.randInt(0, 9);
        return { mode: "build", t: tn, o: on, n: tn * 10 + on };
      }
      var c = ui.randInt(0, 4), l = ui.randInt(10, 15);
      return { mode: "bundle", c: c, l: l, t: c + 1, o: l - 10, n: (c + 1) * 10 + (l - 10), oMax: 15,
               tCands: [c, c + 2, c + 3], oCands: [l, l - 10 + 1, l - 10 - 1, 10] };
    },

    render: function (mount, round, api) {
      if (round.mode === "chart") {
        mount.appendChild(round.rep === "eggs" ? eggs(round.t, round.o) : ui.tensBars(round.t, round.o));
        askChart(mount, round, api,
          t(round.rep === "eggs" ? "h_tensEggs" : "h_tensBars"),
          t(round.rep === "eggs" ? "h_onesEggs" : "h_onesDots"));

      } else if (round.mode === "read") {
        api.prompt(t("p_readNumber"));
        mount.appendChild(ui.tensBars(round.t, round.o));
        var holder = ui.el("div", { class: "holder" }); mount.appendChild(holder);
        ui.askChoices(holder, round.n, function () { return ui.choicesFrom(round.n, round.cands, 3, 0, 99); }, function (ok) {
          api.submit(ok, { recall: false, hint: t("h_read") });
        });

      } else if (round.mode === "build") {
        api.prompt(t("p_buildNumber", { n: round.n }));
        mount.appendChild(ui.el("div", { class: "equation" }, [ui.el("span", { class: "q" }, [String(round.n)])]));
        var canvas = ui.tensBars(0, 0); canvas.classList.add("build"); mount.appendChild(canvas);
        var col = canvas.querySelector(".tens-col"), row = canvas.querySelector(".ones-row");

        function addPiece(container, cls, cap) {
          MM.audio.unlock();
          if (container.children.length >= cap) { ui.shake(canvas); return; }
          MM.audio.sfx("tap");
          var p = ui.el("span", { class: cls });
          p.addEventListener("click", function () { MM.audio.sfx("tap"); if (p.parentNode) container.removeChild(p); });
          container.appendChild(p);
        }
        var btns = ui.el("div", { class: "build-btns" });
        var bT = ui.el("button", { class: "btn" }, [ui.el("span", { class: "tbar mini" }), t("addTen")]);
        var bO = ui.el("button", { class: "btn" }, [ui.el("span", { class: "odot mini" }), t("addOne")]);
        bT.addEventListener("click", function () { addPiece(col, "tbar", 9); });
        bO.addEventListener("click", function () { addPiece(row, "odot", 12); });
        btns.appendChild(bT); btns.appendChild(bO);
        mount.appendChild(btns);

        var check = ui.el("button", { class: "btn btn-pink check" }, [t("check")]);
        check.addEventListener("click", function () {
          MM.audio.unlock();
          var tc = col.children.length, oc = row.children.length;
          var ok = (tc === round.t && oc === round.o);
          var hint = oc >= 10 ? t("h_buildTooMany")
                   : (tc !== round.t ? t("h_buildTens", { n: round.n }) : t("h_buildOnes", { n: round.n }));
          if (!ok) ui.shake(canvas);
          api.submit(ok, { recall: false, hint: hint });
        });
        mount.appendChild(check);

      } else { // bundle: prima pensa (quanti Zehner?), poi l'animazione mostra il raggruppamento
        var box = eggs(round.c, round.l);
        mount.appendChild(box);
        askChart(mount, round, api, t("h_bundle"), t("h_bundleOnes"), t("p_bundle"), function () { bundleAnim(box); });
      }
    }
  };
})();
