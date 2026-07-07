// state.js — storage adapter + progress model
(function () {
  var KEY = "container-trail:save:v1";

  function createStorage(backend) {
    if (backend === undefined && typeof window !== "undefined") backend = window.localStorage;
    var memory = null;
    var api = { available: true };
    function fail() { api.available = false; }
    api.get = function () {
      var raw;
      try {
        raw = backend.getItem(KEY);
      } catch (e) { fail(); return memory; }
      if (raw === null || raw === undefined) return memory;
      try {
        return JSON.parse(raw);
      } catch (e) { return memory; }
    };
    api.set = function (obj) {
      memory = obj;
      try { backend.setItem(KEY, JSON.stringify(obj)); } catch (e) { fail(); }
    };
    api.clear = function () {
      memory = null;
      try { backend.removeItem(KEY); } catch (e) { fail(); }
    };
    // Probe availability up front so the UI can show the notice immediately.
    try { backend.getItem(KEY); } catch (e) { fail(); }
    return api;
  }

  function freshData(counts) {
    return {
      completed: counts.map(function (n) { return new Array(n).fill(false); }),
      attempted: counts.map(function (n) { return new Array(n).fill(false); }),
      intro: false,
    };
  }

  function validShape(d, counts) {
    return d && Array.isArray(d.completed) && Array.isArray(d.attempted) &&
      d.completed.length === counts.length && d.attempted.length === counts.length &&
      d.completed.every(function (a, i) { return Array.isArray(a) && a.length === counts[i]; }) &&
      d.attempted.every(function (a, i) { return Array.isArray(a) && a.length === counts[i]; });
  }

  function createState(storage, counts) {
    var loaded = storage.get();
    var data = validShape(loaded, counts) ? loaded : freshData(counts);
    function save() { storage.set(data); }
    function isModuleCompleted(m) {
      return data.completed[m].every(function (x) { return x; });
    }
    var st = {
      isModuleUnlocked: function (m) { return m === 0 || isModuleCompleted(m - 1); },
      isLevelUnlocked: function (m, l) {
        return st.isModuleUnlocked(m) && (l === 0 || data.completed[m][l - 1]);
      },
      isLevelCompleted: function (m, l) { return data.completed[m][l]; },
      completeLevel: function (m, l) { data.completed[m][l] = true; save(); },
      markAttempted: function (m, l) { data.attempted[m][l] = true; save(); },
      hasAttempted: function (m, l) { return data.attempted[m][l]; },
      isModuleCompleted: isModuleCompleted,
      tokens: function () {
        var t = [];
        for (var m = 0; m < counts.length; m++) if (isModuleCompleted(m)) t.push(m);
        return t;
      },
      position: function () {
        for (var m = 0; m < counts.length; m++)
          for (var l = 0; l < counts[m]; l++)
            if (!data.completed[m][l]) return { m: m, l: l };
        return { m: counts.length - 1, l: counts[counts.length - 1] - 1 };
      },
      introSeen: function () { return data.intro; },
      markIntroSeen: function () { data.intro = true; save(); },
      reset: function () { data = freshData(counts); storage.clear(); },
    };
    return st;
  }

  var API = { createStorage: createStorage, createState: createState };
  if (typeof window !== "undefined") {
    window.createStorage = createStorage;
    window.createState = createState;
  }
  if (typeof module !== "undefined") module.exports = API;
})();
