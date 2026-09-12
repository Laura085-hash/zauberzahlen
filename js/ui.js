/* ===== ui: helper DOM condivisi tra i giochi ===== */
(function () {
  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        if (k === "class") n.className = props[k];
        else if (k === "html") n.innerHTML = props[k];
        else if (k.slice(0, 2) === "on" && typeof props[k] === "function") n.addEventListener(k.slice(2), props[k]);
        else n.setAttribute(k, props[k]);
      });
    }
    (kids || []).forEach(function (c) {
      if (c == null) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // genera scelte: la corretta + distrattori vicini, entro [min,max]
  function answerChoices(correct, count, min, max) {
    var set = {}; set[correct] = true;
    var guard = 0;
    while (Object.keys(set).length < count && guard++ < 200) {
      var d = correct + randInt(-2, 2);
      if (d < min) d = min + randInt(0, 1);
      if (d > max) d = max - randInt(0, 1);
      if (d !== correct) set[d] = true;
    }
    // riempi se ancora pochi
    var v = min;
    while (Object.keys(set).length < count && v <= max) { set[v] = true; v++; }
    return shuffle(Object.keys(set).map(Number)).slice(0, count);
  }

  // scelte da una lista di candidati "intelligenti" (trappole tipiche), completata con vicini
  function choicesFrom(correct, cands, count, min, max) {
    var set = {}; set[correct] = true;
    var list = shuffle((cands || []).filter(function (v) {
      return typeof v === "number" && !isNaN(v) && v === Math.floor(v) && v !== correct && v >= min && v <= max;
    }));
    for (var i = 0; i < list.length && Object.keys(set).length < count; i++) set[list[i]] = true;
    var guard = 0;
    while (Object.keys(set).length < count && guard++ < 200) {
      var d = correct + randInt(-3, 3);
      if (d >= min && d <= max && d !== correct) set[d] = true;
    }
    var v = min;
    while (Object.keys(set).length < count && v <= max) { set[v] = true; v++; }
    return shuffle(Object.keys(set).map(Number)).slice(0, count);
  }

  // bottoni-numero grandi; gestisce feedback visivo, poi richiama onResult(correct:boolean).
  // REGOLA: se sbaglia NON si mostra la risposta giusta — deve arrivarci da sola.
  function choices(values, correct, onResult) {
    var wrap = el("div", { class: "choices" });
    var locked = false;
    values.forEach(function (v) {
      var b = el("button", { class: "choice" }, [String(v)]);
      b.addEventListener("click", function () {
        if (locked) return; locked = true;
        MM.audio.unlock();
        var ok = (v === correct);
        b.classList.add(ok ? "correct" : "wrong");
        onResult(ok);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  // scelte con "nuovo tentativo": dopo un errore le scelte vengono rimescolate con altri
  // distrattori (così non può andare per esclusione) finché non trova quella giusta.
  // gen() restituisce ogni volta la lista di valori (che contiene sempre la risposta giusta).
  function askChoices(holder, correct, gen, onAnswer) {
    function render() {
      clear(holder);
      var c = choices(gen(), correct, function (ok) {
        onAnswer(ok);
        if (!ok) setTimeout(render, 1100);
      });
      holder.appendChild(c);
      return c;
    }
    return render();
  }

  // rappresentazione "quaderno": barre arancioni = decine, punti = unità
  function tensBars(tens, ones) {
    var box = el("div", { class: "tenones" });
    var col = el("div", { class: "tens-col" });
    for (var i = 0; i < tens; i++) col.appendChild(el("span", { class: "tbar" }));
    var row = el("div", { class: "ones-row" });
    for (var j = 0; j < ones; j++) row.appendChild(el("span", { class: "odot" }));
    box.appendChild(col); box.appendChild(row);
    return box;
  }

  // elementi SVG (triangoli, linea dei numeri)
  function svg(tag, attrs, text) {
    var n = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (text != null) n.textContent = String(text);
    return n;
  }

  // gruppo di gemme; structured=true => righe da 5 (come dadi / cornice)
  function gems(count, emoji, structured) {
    emoji = emoji || "💎";
    var box = el("div", { class: "gems" });
    if (structured) {
      box.style.maxWidth = "300px";
      var rows = el("div", { class: "" });
      rows.style.display = "flex"; rows.style.flexDirection = "column"; rows.style.gap = "10px";
      var left = count;
      while (left > 0) {
        var n = Math.min(5, left);
        var row = el("div", { class: "" });
        row.style.display = "flex"; row.style.gap = "10px"; row.style.justifyContent = "center";
        for (var i = 0; i < n; i++) row.appendChild(el("span", { class: "gem" }, [emoji]));
        rows.appendChild(row);
        left -= n;
      }
      box.appendChild(rows);
    } else {
      for (var k = 0; k < count; k++) box.appendChild(el("span", { class: "gem" }, [emoji]));
    }
    return box;
  }

  // scintille festose dentro #fx
  function sparkle(n) {
    var fx = document.getElementById("fx");
    if (!fx) return;
    var emojis = ["✨", "⭐", "🌟", "💫"];
    for (var i = 0; i < (n || 10); i++) {
      var s = el("span", { class: "spark" }, [emojis[Math.floor(Math.random() * emojis.length)]]);
      s.style.left = (10 + Math.random() * 80) + "%";
      s.style.top = (30 + Math.random() * 50) + "%";
      s.style.animationDelay = (Math.random() * 0.25) + "s";
      fx.appendChild(s);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 1100); })(s);
    }
  }

  // FESTA: tanti coriandoli che cadono dall'alto
  function party(n) {
    var fx = document.getElementById("fx");
    if (!fx) return;
    var emojis = ["🎉", "🎊", "🎈", "⭐", "🌟", "✨", "🦄", "🌈", "💖", "🍭", "🪄"];
    for (var i = 0; i < (n || 40); i++) {
      var c = el("span", { class: "confetti" }, [emojis[Math.floor(Math.random() * emojis.length)]]);
      c.style.left = (Math.random() * 100) + "%";
      c.style.fontSize = (1.2 + Math.random() * 1.8) + "rem";
      c.style.animationDuration = (1.8 + Math.random() * 1.6) + "s";
      c.style.animationDelay = (Math.random() * 0.5) + "s";
      fx.appendChild(c);
      (function (node) { setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 3600); })(c);
    }
  }

  function shake(node) {
    node.classList.remove("shake");
    void node.offsetWidth; // reflow per riavviare l'animazione
    node.classList.add("shake");
  }

  window.MM = window.MM || {};
  window.MM.ui = {
    el: el, clear: clear, randInt: randInt, shuffle: shuffle,
    answerChoices: answerChoices, choicesFrom: choicesFrom, choices: choices, askChoices: askChoices,
    gems: gems, tensBars: tensBars, svg: svg, sparkle: sparkle, party: party, shake: shake
  };
})();
