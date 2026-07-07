const test = require("node:test");
const assert = require("node:assert");
const { createShowdown } = require("../js/engine.js");

const qs = [
  { type: "mc", prompt: "q1", options: ["a", "b"], answer: 0, explain: "e1" },
  { type: "tf", prompt: "q2", answer: true, explain: "e2" },
];
const noShuffle = (a) => a.slice();

test("correct answers advance and finish", () => {
  const s = createShowdown(qs, noShuffle);
  assert.equal(s.waters(), 3);
  assert.deepEqual(s.progress(), { answered: 0, total: 2 });
  const r1 = s.answer(0);
  assert.equal(r1.correct, true);
  assert.equal(r1.finished, false);
  const r2 = s.answer(true);
  assert.equal(r2.finished, true);
});

test("wrong answer costs water, repeats question, surfaces explanation", () => {
  const s = createShowdown(qs, noShuffle);
  const r = s.answer(1);
  assert.equal(r.correct, false);
  assert.equal(r.explain, "e1");
  assert.equal(s.waters(), 2);
  assert.equal(s.current().prompt, "q1");
});

test("third wrong answer restarts with refilled canteen and reshuffle", () => {
  let shuffled = 0;
  const s = createShowdown(qs, (a) => { shuffled++; return a.slice().reverse(); });
  s.answer(1); s.answer(1);
  const r = s.answer(1);
  assert.equal(r.restarted, true);
  assert.equal(s.waters(), 3);
  assert.equal(shuffled, 1);
  assert.equal(s.current().prompt, "q2"); // reversed order
  assert.deepEqual(s.progress(), { answered: 0, total: 2 });
});

test("progress survives wrong answers on later questions", () => {
  const s = createShowdown(qs, noShuffle);
  s.answer(0);
  s.answer(false); // wrong on q2
  assert.deepEqual(s.progress(), { answered: 1, total: 2 });
  assert.equal(s.current().prompt, "q2");
});
