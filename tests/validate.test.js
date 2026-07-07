const test = require("node:test");
const assert = require("node:assert");
const { validateModule } = require("../tools/validate.js");

const OPTS = { widgetIds: ["layer-cache"], diagramIds: ["image-layers"] };

function goodModule() {
  return {
    id: 1, town: "T", mentor: { name: "M", spriteId: "mentor1", intro: "hi" },
    arrival: [{ type: "vignette", id: "monolith", caption: "c" }],
    departure: [{ type: "dialogue", speaker: "mentor", text: "bye" }],
    levels: [{
      title: "L1",
      scenes: [{ type: "dialogue", speaker: "carl", text: "yo" }],
      questions: [
        { type: "mc", prompt: "p", options: ["a", "b", "c", "d"], answer: 3, explain: "e" },
        { type: "tf", prompt: "p", answer: false, explain: "e" },
        { type: "cmd", prompt: "p", accept: ["docker ps"], explain: "e" },
        { type: "tf", prompt: "p2", answer: true, explain: "e" },
      ],
    }],
  };
}

test("valid module passes", () => {
  assert.deepEqual(validateModule(goodModule(), OPTS), []);
});

test("mc answer out of range fails", () => {
  const m = goodModule();
  m.levels[0].questions[0].answer = 4;
  assert.ok(validateModule(m, OPTS).some((e) => /answer.*range/.test(e)));
});

test("question count outside 4-6 fails", () => {
  const m = goodModule();
  m.levels[0].questions = m.levels[0].questions.slice(0, 3);
  assert.ok(validateModule(m, OPTS).some((e) => /4-6 questions/.test(e)));
});

test("unknown scene type and unknown widget id fail", () => {
  const m = goodModule();
  m.levels[0].scenes.push({ type: "song", id: "x" });
  m.levels[0].scenes.push({ type: "widget", id: "nope" });
  const errs = validateModule(m, OPTS);
  assert.ok(errs.some((e) => /unknown scene type/.test(e)));
  assert.ok(errs.some((e) => /unknown widget/.test(e)));
});

test("empty strings fail", () => {
  const m = goodModule();
  m.levels[0].scenes[0].text = "";
  assert.ok(validateModule(m, OPTS).some((e) => /empty/.test(e)));
});
