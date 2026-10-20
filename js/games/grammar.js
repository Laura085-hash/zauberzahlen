/* ===== Gioco 25: Grammar Detective — grammar quiz (SIS, Mrs Wennek, Tuesday 27.10.2026) =====
   Units 1–7 del workbook Oxford, senza la Unit 3. Learning goals: "I can understand what a noun, verb and
   adjective are" · "I can make a contraction" · "I know what a pronoun is".
   Contenuti dal quaderno di Joy (foto 20.10): Unit 1 nouns/adjectives (cage grass happy beautiful lamp old…),
   Unit 2 adjectives (due per frase, opposti long/short soft/hard clean/dirty good/bad, un- words, panda),
   Unit 4 verbs (am/is/are, verb webs is barking/is pouring, to push/to pack → she is packing),
   Unit 5 proper nouns + maiuscole (Chester Zoo, London, Monday, August), Unit 6 frasi che hanno senso,
   Unit 7 contractions (I'm … they're, lettera mancante, fumetti "She's wet" → "I'm wet").
   Errori di Joy visti: noun/adjective mescolati, "drdi" (dirty), "had" (bad), "They Ar", "ridding",
   "chester zoo", "Folly farm", "he's barking" al posto di "I'm barking".
   Sempre in inglese (game.lang = "en"). 10 round = 2 per ciascuno dei 5 temi (idx % 5).
   Regola: se sbaglia non si mostra mai la risposta, solo il suggerimento e le scelte rimescolate. */
(function () {
  var ui = MM.ui;
  var A = "’";   // apostrofo come nel libro
  function pick(a) { return a[ui.randInt(0, a.length - 1)]; }
  function c(s) { return s.replace(/'/g, A); }

  var HINT_PRON = "A pronoun is a little word that stands in place of a person’s name or a thing.";
  var CLASS_NAMES = ["noun", "verb", "adjective"];
  var HINT_CLASS = "Noun = a naming word (a person, place or thing). Verb = a doing word. Adjective = a describing word.";
  var NOUNS = ["cage", "grass", "lamp", "telephone", "box", "dog", "ladder", "pillow", "towel", "panda", "bicycle", "tree",
               "spider", "wall", "shed", "book", "frog", "tent", "desk", "boat", "ball", "girl", "garden", "bush", "monster", "sweets"];
  var VERBS = ["run", "jump", "push", "reach", "stack", "ride", "pack", "bark", "howl", "paint", "swim", "chase", "eat",
               "sing", "sleep", "wipe", "write", "play", "climb", "hide"];
  var ADJS = ["happy", "beautiful", "old", "cold", "big", "small", "dirty", "clean", "soft", "hard", "long", "short", "furry",
              "black", "tall", "thin", "fat", "green", "shiny", "lovely", "new", "blue", "scary", "kind", "messy", "wet"];
  var BANK = { noun: NOUNS, verb: VERBS, adjective: ADJS };

  // frasi del libro con le parole etichettate: /n noun, /v verb, /a adjective, /p pronoun
  var SENTENCES = [
    "The small/a dog/n is lost in the big/a wood/n.", "I/p wipe/v my dirty/a hands/n with the clean/a towel/n.",
    "There are hard/a and soft/a sweets/n in the box/n.", "The dog/n is barking/v at the black/a cat/n.",
    "The wolf/n is howling/v at the moon/n.", "He/p wanted a blue/a bicycle/n with red/a handles/n.",
    "The furry/a panda/n eats/v green/a leaves/n.", "The girl/n is playing/v with her happy/a dog/n.",
    "Mum/n hid/v the shiny/a bicycle/n in the old/a shed/n.", "They/p are running/v in the park/n.",
    "She/p is packing/v the heavy/a bags/n.", "The tall/a man/n is pushing/v the trolley/n.",
    "We/p are swimming/v in the cold/a river/n.", "The scary/a monster/n jumps/v on the bed/n.",
    "It/p is a very hot/a day/n.", "The spider/n climbs/v up the long/a wall/n."
  ];
  function parse(s) {
    return s.split(" ").map(function (tok) {
      var m = /^([^/]+)\/([nvap])([.,]?)$/.exec(tok);
      if (!m) return { w: tok, t: "" };
      return { w: m[1], t: { n: "noun", v: "verb", a: "adjective", p: "pronoun" }[m[2]], end: m[3] };
    });
  }
  function plain(words) { return words.map(function (x) { return x.w + (x.end || ""); }).join(" "); }

  // tocca la parola del tipo giusto nella frase: opzioni = una giusta + parole di altri tipi dalla stessa frase
  function findWordRound(cls, topic) {
    var cand = SENTENCES.map(parse).filter(function (ws) { return ws.some(function (x) { return x.t === cls; }); });
    var ws = pick(cand), right = pick(ws.filter(function (x) { return x.t === cls; })).w;
    var others = ws.filter(function (x) { return x.t && x.t !== cls; }).map(function (x) { return x.w; });
    var article = cls === "adjective" ? "an " : "a ";
    return { topic: topic, kind: "find", sentence: plain(ws), q: "Which word is " + article + cls + "?", ans: right,
      opts: [right].concat(ui.shuffle(others).slice(0, 3)), n: 3,
      hint: cls === "pronoun" ? HINT_PRON : HINT_CLASS };
  }

  /* ---------- 0: noun, verb or adjective? ---------- */
  function classRound(level) {
    if (level >= 2 && Math.random() < 0.45) return findWordRound(pick(CLASS_NAMES), "class");
    if (Math.random() < 0.2) {
      var x = pick([
        { q: "A naming word (a person, place or thing) is a …", ans: "noun" },
        { q: "A doing word is a …", ans: "verb" },
        { q: "A describing word is an …", ans: "adjective" }
      ]);
      return { topic: "class", kind: "text", q: x.q, ans: x.ans, opts: CLASS_NAMES, n: 3, hint: "Think: a naming word, a doing word, a describing word. Which name goes with which?" };
    }
    var cls = pick(CLASS_NAMES), w = pick(BANK[cls]);
    return { topic: "class", kind: "word", word: w, q: "“" + w + "” is a …", ans: cls, opts: CLASS_NAMES, n: 3,
      hint: "Try it: “a " + w + "” (a thing?), “I " + w + "” (something you do?), “it is " + w + "” (what it is like?)." };
  }

  /* ---------- 1: adjectives ---------- */
  var OPPOSITES = [["long", "short", ["shot", "schort"]], ["soft", "hard", ["had", "hart"]], ["clean", "dirty", ["drdi", "durty"]],
                   ["good", "bad", ["bed", "bat"]], ["big", "small", ["smal", "smoll"]], ["hot", "cold", ["colt", "kold"]],
                   ["happy", "sad", ["sed", "sadd"]], ["old", "new", ["knew", "nwe"]], ["tidy", "messy", ["mesy", "missy"]],
                   ["fat", "thin", ["tin", "thinn"]], ["wet", "dry", ["drie", "dri"]], ["full", "empty", ["emty", "empti"]]];
  var UN = [["sad", "unhappy"], ["ill", "unwell"], ["foolish", "unwise"], ["false", "untrue"], ["messy", "untidy"], ["cruel", "unkind"]];
  function adjRound(level) {
    var r = Math.random();
    if (level >= 2 && r < 0.3) return findWordRound("adjective", "adj");
    if (level >= 2 && r < 0.5) {
      var u = pick(UN), others = UN.filter(function (x) { return x !== u; }).map(function (x) { return x[1]; });
      return { topic: "adj", kind: "text", q: "Which “un” word means the same as “" + u[0] + "”?", ans: u[1],
        opts: [u[1]].concat(ui.shuffle(others).slice(0, 2)), n: 3, hint: "First think of the opposite of “" + u[0] + "”. Then the un- word is its opposite again." };
    }
    var p = pick(OPPOSITES), flip = Math.random() < 0.3, from = flip ? p[1] : p[0], to = flip ? p[0] : p[1];
    if (level >= 2 && !flip && Math.random() < 0.4) {
      return { topic: "adj", kind: "spell", q: "The opposite of “" + from + "” is … Which one is spelled right?", ans: to,
        opts: [to].concat(p[2]), n: 3, hint: "Say the word slowly and listen to every sound. Then check each letter." };
    }
    var dist = OPPOSITES.filter(function (x) { return x !== p; }).map(function (x) { return x[1]; });
    return { topic: "adj", kind: "text", q: "What is the opposite of “" + from + "”?", ans: to,
      opts: [to, from].concat(ui.shuffle(dist).slice(0, 2)), n: 3, hint: "Opposite means the other side: if one is up, the opposite is down." };
  }

  /* ---------- 2: verbs ---------- */
  var BE = [["The dog", "is", "barking"], ["The wolf", "is", "howling"], ["I", "am", "painting"], ["They", "are", "running"],
            ["We", "are", "swimming"], ["She", "is", "packing the shopping"], ["You", "are", "riding"], ["The children", "are", "playing"],
            ["It", "is", "raining"], ["He", "is", "pushing the trolley"], ["Mum and Dad", "are", "reaching"], ["I", "am", "happy"]];
  var ING = [["ride", "riding", ["ridding", "rideing"]], ["run", "running", ["runing", "runnig"]], ["swim", "swimming", ["swiming", "swimmin"]],
             ["stack", "stacking", ["stackking", "staking"]], ["push", "pushing", ["pushhing", "puching"]], ["pack", "packing", ["packking", "paking"]],
             ["reach", "reaching", ["reching", "reachin"]], ["bark", "barking", ["barkking", "barcking"]], ["sit", "sitting", ["siting", "sittin"]],
             ["write", "writing", ["writting", "writeing"]], ["chase", "chasing", ["chaseing", "chassing"]], ["paint", "painting", ["painteing", "paintting"]]];
  var WHO = [["She", "is"], ["He", "is"], ["They", "are"], ["I", "am"], ["We", "are"]];
  function verbRound(level) {
    var r = Math.random();
    if (level >= 2 && r < 0.3) return findWordRound("verb", "verb");
    if (r < 0.45) {
      var b = pick(BE);
      return { topic: "verb", kind: "text", q: b[0] + " ___ " + b[2] + ".", ans: b[1], opts: ["am", "is", "are"], n: 3,
        hint: "Who is doing it? Just me (I)? One person or thing? Or more than one?" };
    }
    var g = pick(ING);
    if (level >= 2 && r < 0.75) {
      return { topic: "verb", kind: "spell", q: "to " + g[0] + " → Which one is spelled right?", ans: g[1], opts: [g[1]].concat(g[2]), n: 3,
        hint: "Short word with one vowel (run, sit, swim)? Double the last letter. Ends in e (ride, write)? Drop the e, then add -ing." };
    }
    var w = pick(WHO);
    return { topic: "verb", kind: "text", q: "to " + g[0] + " → " + w[0] + " " + w[1] + " ___ .", ans: g[1],
      opts: [g[1], g[0], g[0] + "s"], n: 3, hint: "After am, is or are the doing word gets -ing at the end." };
  }

  /* ---------- 3: nouns (proper nouns, capital letters, sentences that make sense) ---------- */
  var PROPER = ["Tim", "Miss Swift", "Thursday", "Tracey", "May", "Sue", "Leeds", "Sunday", "June", "London", "Monday", "August", "Zürich", "Joy", "Dublin"];
  var COMMON = ["cart", "ball", "boat", "tent", "desk", "frog", "cage", "lamp", "box", "ladder", "tree", "spider", "city", "day", "month"];
  var CAPS = [["Mrs Brown is going on holiday in August.", ["Mrs", "Brown", "August"]], ["We visited London on Monday.", ["London", "Monday"]],
              ["Tim and Sue went to Chester Zoo.", ["Tim", "Sue", "Chester", "Zoo"]], ["My birthday is in June.", ["June"]],
              ["Joy lives in Zürich.", ["Joy", "Zürich"]], ["On Sunday we went to Folly Farm.", ["Sunday", "Folly", "Farm"]],
              ["Miss Swift went to Dublin in May.", ["Miss", "Swift", "Dublin", "May"]]];
  var SIGNS = [["chester zoo", "Chester Zoo"], ["dublin", "Dublin"], ["folly farm", "Folly Farm"], ["london", "London"], ["lake zurich", "Lake Zurich"]];
  var SENSE = [["This is a panda. It is called ___.", "Chi", "panda"], ["This is a ___. It is called Chi.", "panda", "Chi"],
               ["This is a spider. It is on the ___.", "wall", "spider"], ["This is a ___. It is on the wall.", "spider", "wall"],
               ["This is a bicycle. It has a ___ tyre.", "flat", "bicycle"], ["Look at the tree. It has no ___.", "leaves", "tree"],
               ["Look at the ___. It has no leaves.", "tree", "leaves"]];
  function lowerWords(s, words) {
    var out = s;
    words.forEach(function (w) { out = out.replace(new RegExp("\\b" + w + "\\b"), w.charAt(0).toLowerCase() + w.slice(1)); });
    return out;
  }
  var HINT_PROPER = "Is it the special name of one person, place, day or month? Those always start with a capital letter.";
  function nounRound(level) {
    var r = Math.random();
    if (level >= 2 && r < 0.2) return findWordRound("noun", "noun");
    if (r < 0.4) {
      var isP = Math.random() < 0.5, w = pick(isP ? PROPER : COMMON);
      return { topic: "noun", kind: "word", word: w, q: "“" + w + "” is a …", ans: isP ? "proper noun" : "common noun",
        opts: ["proper noun", "common noun"], n: 2, hint: HINT_PROPER };
    }
    if (r < 0.65) {
      if (level <= 1 || Math.random() < 0.4) {
        var sg = pick(SIGNS), parts = sg[1].split(" ");
        var bad = [sg[0]];
        if (parts.length > 1) { bad.push(parts[0] + " " + parts[1].toLowerCase()); bad.push(parts[0].toLowerCase() + " " + parts[1]); }
        else bad.push(sg[1].toUpperCase().slice(0, 1) + sg[1].slice(1).toUpperCase());
        return { topic: "noun", kind: "text", q: "Write it on the signpost correctly: “" + sg[0] + "”", ans: sg[1], opts: [sg[1]].concat(bad), n: 3,
          hint: "Names of places are proper nouns: every word of the name starts with a capital letter." };
      }
      var cs = pick(CAPS), all = lowerWords(cs[0], cs[1]), one = lowerWords(cs[0], [pick(cs[1])]);
      var noDot = cs[0].charAt(0).toLowerCase() + cs[0].slice(1, -1);
      var o = [cs[0], all]; if (one !== all && one !== cs[0]) o.push(one); else o.push(noDot);
      return { topic: "noun", kind: "text", q: "Which sentence is written correctly?", ans: cs[0], opts: o, n: 3,
        hint: "Check every name, day and month: capital letter? And a capital at the start and a full stop at the end." };
    }
    var s = pick(SENSE);
    return { topic: "noun", kind: "text", q: s[0] + " Which word makes sense?", ans: s[1], opts: [s[1], s[2]], n: 2,
      hint: "Read the whole sentence aloud with each word. Remember: sentences must make sense!" };
  }

  /* ---------- 4: contractions & pronouns ---------- */
  var CONTR = [["I am", "I'm", ["Im", "I'am"], "a"], ["you are", "you're", ["your", "you'are"], "a"], ["he is", "he's", ["hes", "h'es"], "i"],
               ["she is", "she's", ["shes", "she'is"], "i"], ["it is", "it's", ["its", "it'is"], "i"], ["we are", "we're", ["were", "w'ere"], "a"],
               ["they are", "they're", ["theyre", "they'r"], "a"]];
  var CONTR2 = [["is not", "isn't", ["is'nt", "isnt"], "o"], ["do not", "don't", ["dont", "do'nt"], "o"], ["was not", "wasn't", ["was'nt", "wasnt"], "o"]];
  var HINT_C = "Push the two words together, miss out a letter and put an apostrophe ’ where the letter was.";
  var REPL = [["Tom", "is running.", "He"], ["Mia", "is painting.", "She"], ["The dog", "is barking.", "It"], ["Tom and Mia", "are swimming.", "They"],
              ["Mum and I", "are having a picnic.", "We"], ["Dad", "is pushing the trolley.", "He"], ["Grandma", "is reading.", "She"],
              ["The ball", "is under the bush.", "It"], ["The twins", "are riding.", "They"], ["Ben", "is happy.", "He"]];
  var BUBBLE = [["She’s wet.", "What does she say?", "I’m wet."], ["They’re twins.", "What do they say?", "We’re twins."],
                ["He’s happy.", "What does he say?", "I’m happy."], ["They’re riding.", "What do they say?", "We’re riding."],
                ["It’s barking.", "What does the dog say?", "I’m barking."]];
  var PRONOUNS = ["I", "you", "he", "she", "it", "we", "they"];
  function contrRound(level) {
    var r = Math.random();
    if (r < 0.35) {   // pronomi
      var rr = Math.random();
      if (rr < 0.5) {
        var x = pick(REPL);
        return { topic: "contr", kind: "repl", sentence: x[0] + " " + x[1], under: x[0], q: "Which pronoun can we use instead of “" + x[0] + "”?",
          ans: x[2], opts: ["He", "She", "It", "They", "We"], n: 3,
          hint: "A pronoun stands for the name. Is it a boy or man, a girl or woman, a thing or animal, or more than one?" };
      }
      if (level >= 2 && rr < 0.8) {
        var b = pick(BUBBLE), wrongs = [b[0], b[2].replace("I’m", "We’re").replace("We’re twins", "I’m twins")];
        if (wrongs[1] === b[2]) wrongs[1] = b[2].replace("We’re", "I’m");
        return { topic: "contr", kind: "bubble", sentence: b[0], q: b[1] + " 💬", ans: b[2], opts: [b[2]].concat(wrongs), n: 3,
          hint: "In a speech bubble they talk about themselves: one person says “I”, two people say “we”." };
      }
      if (level >= 2) return findWordRound("pronoun", "contr");
      var pr = pick(PRONOUNS);
      return { topic: "contr", kind: "text", q: "Which word is a pronoun?", ans: pr,
        opts: [pr, pick(NOUNS), pick(ADJS)], n: 3, hint: HINT_PRON };
    }
    var pool = level >= 3 ? CONTR.concat(CONTR2) : CONTR, k = pick(pool), ap = c(k[1]);
    if (level >= 2 && r < 0.55) {
      return { topic: "contr", kind: "text", q: "Which letter is missed out in “" + ap + "”?", ans: k[3], opts: ["a", "i", "o", "e"], n: 3,
        hint: "Say the two long words: “" + k[0] + "”. Which letter is not there any more?" };
    }
    if (r < 0.7) {
      var full = CONTR.concat(CONTR2).filter(function (y) { return y !== k; }).map(function (y) { return y[0]; });
      return { topic: "contr", kind: "text", q: "“" + ap + "” is short for …", ans: k[0], opts: [k[0]].concat(ui.shuffle(full).slice(0, 2)), n: 3,
        hint: "Put the missing letter back in where the apostrophe ’ is." };
    }
    return { topic: "contr", kind: "text", q: k[0] + " = ?", ans: ap, opts: [ap].concat(k[2].map(c)), n: 3, hint: HINT_C };
  }

  function subset(ans, opts, n) {
    var uniq = opts.filter(function (o, i) { return o !== ans && opts.indexOf(o) === i; });
    return ui.shuffle([ans].concat(ui.shuffle(uniq).slice(0, (n || 3) - 1)));
  }

  MM.games.grammar = {
    id: "grammar", nameKey: "g_grammar", subKey: "g_grammar_sub", emoji: "🔍", gem: "📘", rounds: 10, lang: "en",

    // 5 temi a rotazione: noun/verb/adjective · adjectives · verbs · nouns & capitals · contractions & pronouns
    // 1: parole singole, opposti, am/is/are, proper/common, cartelli, I'm…they're, pronome al posto del nome
    // 2: + trova la parola nella frase, un-words, spelling (dirty, riding…), maiuscole nelle frasi, lettera mancante, fumetti
    // 3: + isn't / don't / wasn't
    makeRound: function (level, idx) {
      var k = (idx || 0) % 5;
      if (k === 0) return classRound(level);
      if (k === 1) return adjRound(level);
      if (k === 2) return verbRound(level);
      if (k === 3) return nounRound(level);
      return contrRound(level);
    },

    render: function (mount, round, api) {
      api.prompt(round.q);
      if (round.sentence) {
        var card = ui.el("div", { class: "gram-card" });
        if (round.under) {
          card.appendChild(ui.el("u", {}, [round.under]));
          card.appendChild(document.createTextNode(round.sentence.slice(round.under.length)));
        } else card.appendChild(document.createTextNode(round.sentence));
        if (round.kind === "bubble") card.classList.add("bubble");
        mount.appendChild(card);
        if (round.kind !== "bubble") MM.audio.speak(round.sentence, null, null, true);
      } else if (round.kind === "word") {
        mount.appendChild(ui.el("div", { class: "gram-card big" }, [round.word]));
      }
      var holder = ui.el("div", { class: "holder words gram-holder" });
      mount.appendChild(holder);
      ui.askChoices(holder, round.ans, function () { return subset(round.ans, round.opts, round.n); }, function (ok) {
        api.submit(ok, { recall: true, hint: round.hint });
      });
    }
  };
})();
