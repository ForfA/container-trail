// engine.js — Answers: pure answer checking; Engine: routing/boot (added in Task 7)
(function () {
  function normalizeCmd(str) {
    var tokens = String(str).toLowerCase().trim().split(/\s+/).filter(Boolean);
    var words = [], rest = [], inFlags = false;
    for (var i = 0; i < tokens.length; i++) {
      if (!inFlags && tokens[i][0] !== "-") { words.push(tokens[i]); }
      else { inFlags = true; rest.push(tokens[i]); }
    }
    return words.concat(rest.slice().sort()).join(" ");
  }

  function check(question, response) {
    if (question.type === "mc") return response === question.answer;
    if (question.type === "tf") return response === question.answer;
    if (question.type === "cmd") {
      var norm = normalizeCmd(response);
      return question.accept.some(function (a) { return normalizeCmd(a) === norm; });
    }
    throw new Error("unknown question type: " + question.type);
  }

  var Answers = { normalizeCmd: normalizeCmd, check: check };

  // --- Showdown state machine (pure, node-testable) ---
  function defaultShuffle(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  function createShowdown(questions, shuffleFn) {
    var shuffle = shuffleFn || defaultShuffle;
    var order = questions.slice();
    var idx = 0, waters = 3;
    return {
      current: function () { return order[idx]; },
      waters: function () { return waters; },
      progress: function () { return { answered: idx, total: order.length }; },
      answer: function (response) {
        var q = order[idx];
        if (check(q, response)) {
          idx++;
          return { correct: true, explain: null, restarted: false, finished: idx >= order.length };
        }
        waters--;
        if (waters <= 0) {
          order = shuffle(questions);
          idx = 0; waters = 3;
          return { correct: false, explain: q.explain, restarted: true, finished: false };
        }
        return { correct: false, explain: q.explain, restarted: false, finished: false };
      },
    };
  }

  // --- Engine: screen routing ---
  var ctx;
  var Engine = {
    go: function (name, params) {
      var app = document.getElementById("app");
      var S = window.Screens;
      if (name === "title") return S.title(app, ctx);
      if (name === "map") return S.map(app, ctx);
      if (name === "levels") return S.levels(app, ctx, params.m);
      if (name === "teach") return S.teach(app, ctx, params.m, params.l);
      if (name === "showdown") return S.showdown(app, ctx, params.m, params.l);
      if (name === "epilogue") return S.epilogue(app, ctx);
      throw new Error("unknown screen: " + name);
    },
  };

  if (typeof window !== "undefined") {
    window.Answers = Answers;
    window.createShowdown = createShowdown;
    window.Engine = Engine;
  }
  if (typeof module !== "undefined") {
    module.exports = { Answers: Answers, createShowdown: createShowdown };
  }

  // --- Boot (browser only; node requires this file for tests) ---
  if (typeof document !== "undefined") {
    var storage = createStorage();
    // Only module 1 is populated during development; filter(Boolean) skips the
    // empty stubs. Once all 8 data files are filled this filter is a no-op.
    var counts = window.GameData.modules.filter(Boolean).map(function (m) {
      return m.levels.length;
    });
    ctx = { state: createState(storage, counts), storage: storage, go: Engine.go };
    document.addEventListener("DOMContentLoaded", function () { Engine.go("title"); });
  }
})();
