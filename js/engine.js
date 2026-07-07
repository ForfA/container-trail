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
  if (typeof window !== "undefined") window.Answers = Answers;
  if (typeof module !== "undefined") module.exports = { Answers: Answers };
})();
