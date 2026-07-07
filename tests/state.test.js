const test = require("node:test");
const assert = require("node:assert");
const { createStorage, createState } = require("../js/state.js");

function fakeBackend(initial) {
  const m = new Map(Object.entries(initial || {}));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, v),
    removeItem: (k) => m.delete(k),
    _map: m,
  };
}

test("storage round-trips through backend under namespaced key", () => {
  const b = fakeBackend();
  const s = createStorage(b);
  s.set({ a: 1 });
  assert.ok(b._map.has("container-trail:save:v1"));
  assert.deepEqual(s.get(), { a: 1 });
  assert.equal(s.available, true);
});

test("storage degrades to memory when backend throws", () => {
  const s = createStorage({
    getItem() { throw new Error("insecure"); },
    setItem() { throw new Error("insecure"); },
    removeItem() { throw new Error("insecure"); },
  });
  s.set({ a: 2 });
  assert.deepEqual(s.get(), { a: 2 });
  assert.equal(s.available, false);
});

test("corrupt save loads as fresh state", () => {
  const b = fakeBackend({ "container-trail:save:v1": "{not json" });
  const st = createState(createStorage(b), [2, 2]);
  assert.equal(st.isLevelCompleted(0, 0), false);
});

test("corrupt save does not flip storage availability", () => {
  const b = fakeBackend({ "container-trail:save:v1": "{not json" });
  const s = createStorage(b);
  s.get();
  assert.equal(s.available, true);
});

test("unlock chain: modules and levels gate in order", () => {
  const st = createState(createStorage(fakeBackend()), [2, 2]);
  assert.equal(st.isModuleUnlocked(0), true);
  assert.equal(st.isModuleUnlocked(1), false);
  assert.equal(st.isLevelUnlocked(0, 1), false);
  st.completeLevel(0, 0);
  assert.equal(st.isLevelUnlocked(0, 1), true);
  st.completeLevel(0, 1);
  assert.equal(st.isModuleUnlocked(1), true);
  assert.equal(st.isModuleCompleted(0), true);
  assert.deepEqual(st.tokens(), [0]);
  assert.deepEqual(st.position(), { m: 1, l: 0 });
});

test("progress persists through storage", () => {
  const b = fakeBackend();
  createState(createStorage(b), [2, 2]).completeLevel(0, 0);
  const st2 = createState(createStorage(b), [2, 2]);
  assert.equal(st2.isLevelCompleted(0, 0), true);
});

test("attempted flag drives teach-skip", () => {
  const st = createState(createStorage(fakeBackend()), [2, 2]);
  assert.equal(st.hasAttempted(0, 0), false);
  st.markAttempted(0, 0);
  assert.equal(st.hasAttempted(0, 0), true);
});
