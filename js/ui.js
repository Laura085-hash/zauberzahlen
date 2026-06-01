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

  // bottoni-numero grandi; gestisce feedback visivo, poi richiama onResult(correct:boolean)
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
        if (!ok) {
          Array.prototype.forEach.call(wrap.children, function (c) {
            if (c.textContent === String(correct)) c.classList.add("correct");
          });
        }
        onResult(ok);
      });
      wrap.appendChild(b);
    });
    return wrap;
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

  function shake(node) {
    node.classList.remove("shake");
    void node.offsetWidth; // reflow per riavviare l'animazione
    node.classList.add("shake");
  }

  window.MM = window.MM || {};
  window.MM.ui = {
    el: el, clear: clear, randInt: randInt, shuffle: shuffle,
    answerChoices: answerChoices, choices: choices,
    gems: gems, sparkle: sparkle, shake: shake
  };
})();
