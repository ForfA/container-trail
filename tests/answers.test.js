const test = require("node:test");
const assert = require("node:assert");
const { Answers } = require("../js/engine.js");

test("mc checks index", () => {
  const q = { type: "mc", answer: 2 };
  assert.equal(Answers.check(q, 2), true);
  assert.equal(Answers.check(q, 0), false);
});

test("tf checks boolean", () => {
  const q = { type: "tf", answer: true };
  assert.equal(Answers.check(q, true), true);
  assert.equal(Answers.check(q, false), false);
});

test("cmd is case/whitespace tolerant", () => {
  const q = { type: "cmd", accept: ["docker ps"] };
  assert.equal(Answers.check(q, "  Docker   PS "), true);
  assert.equal(Answers.check(q, "docker ps -a"), false);
});

test("cmd accepts aliases via accept list", () => {
  const q = { type: "cmd", accept: ["docker ps", "docker container ls"] };
  assert.equal(Answers.check(q, "docker container ls"), true);
});

test("cmd tolerates flag order", () => {
  const q = { type: "cmd", accept: ["docker run -d -p 80:80 nginx"] };
  assert.equal(Answers.check(q, "docker run -p 80:80 -d nginx"), true);
  assert.equal(Answers.check(q, "docker run -p 81:80 -d nginx"), false);
});

test("unknown type throws", () => {
  assert.throws(() => Answers.check({ type: "essay" }, "x"), /unknown question type/);
});
