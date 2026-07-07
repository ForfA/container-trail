const test = require("node:test");
const assert = require("node:assert");
const { parse, define, get } = require("../js/sprites.js");

test("parse maps chars to palette", () => {
  const s = parse(["#.", "o+"]);
  assert.equal(s.w, 2);
  assert.equal(s.h, 2);
  assert.deepEqual(s.px, ["#000", null, "#fff", "#888"]);
});

test("parse rejects ragged rows", () => {
  assert.throws(() => parse(["##", "#"]), /ragged sprite/);
});

test("parse rejects unknown chars", () => {
  assert.throws(() => parse(["#x"]), /bad char: x/);
});

test("define/get round-trips and carl exists", () => {
  define("t", ["#"]);
  assert.equal(get("t").w, 1);
  assert.ok(get("carl"), "built-in carl sprite must be defined");
  assert.ok(get("carl").h >= 12, "carl is a full character sprite");
});
