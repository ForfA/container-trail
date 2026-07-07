// screens.js — screen renderers + scene player + Diagrams (player/diagrams added in Task 6)
(function () {
  function clear(app) { app.innerHTML = ""; }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  var BACKSTORY = [
    { type: "vignette", id: "monolith", caption: "Monolith Gulch. Dawn. The Monolith is smoking again." },
    { type: "dialogue", speaker: "carl", text: "Third outage this week. Whole town's frozen: the mill, the bank, the telegraph. All of it lives on that one machine." },
    { type: "dialogue", speaker: "carl", text: "Folks out west pack their work into containers — small, same-shaped, easy to herd. Cattle, not pets." },
    { type: "dialogue", speaker: "carl", text: "I'm ridin' the Orchestration Trail. I'll learn their ways, and I'll come back for Monolith Gulch." },
  ];

  function title(app, ctx) {
    clear(app);
    var s = el("div", "screen");
    s.appendChild(el("h1", null, "The Container Trail"));
    s.appendChild(window.Sprites.el("carl", 8));
    s.appendChild(el("p", null, "A cowboy. A dying monolith. A trail of containers."));
    var b = el("button", "btn", ctx.state.introSeen() ? "Continue" : "Ride");
    b.onclick = function () {
      if (ctx.state.introSeen()) return ctx.go("map");
      window.Screens.playScenes(app, ctx, BACKSTORY, null, function () {
        ctx.state.markIntroSeen();
        ctx.go("map");
      });
    };
    s.appendChild(b);
    if (!ctx.storage.available) s.appendChild(el("div", "notice", "progress won't survive closing the tab"));
    app.appendChild(s);
  }

  function map(app, ctx) {
    clear(app);
    var s = el("div", "screen");
    s.appendChild(el("h2", null, "The Orchestration Trail"));
    var pos = ctx.state.position();
    window.GameData.modules.forEach(function (mod, m) {
      var row = el("div", "panel");
      var b = el("button", "btn", mod.town);
      b.disabled = !ctx.state.isModuleUnlocked(m);
      b.onclick = function () { ctx.go("levels", { m: m }); };
      row.appendChild(b);
      if (ctx.state.isModuleCompleted(m)) row.appendChild(window.Sprites.el("token" + (m + 1), 3));
      if (pos.m === m) row.appendChild(window.Sprites.el("carl", 3));
      s.appendChild(row);
    });
    var bag = el("div", "panel");
    bag.appendChild(el("span", null, "Saddle bag: "));
    ctx.state.tokens().forEach(function (m) { bag.appendChild(window.Sprites.el("token" + (m + 1), 3)); });
    s.appendChild(bag);
    app.appendChild(s);
  }

  function levels(app, ctx, m) {
    clear(app);
    var mod = window.GameData.modules[m];
    var s = el("div", "screen");
    s.appendChild(el("h2", null, mod.town));
    s.appendChild(el("p", null, "Mentor: " + mod.mentor.name));
    mod.levels.forEach(function (lv, l) {
      var row = el("div", "panel");
      var done = ctx.state.isLevelCompleted(m, l);
      var label = (done ? "[x] " : "[ ] ") + lv.title;
      var b = el("button", "btn", label);
      b.disabled = !ctx.state.isLevelUnlocked(m, l);
      b.onclick = function () { ctx.go("teach", { m: m, l: l }); };
      row.appendChild(b);
      if (ctx.state.hasAttempted(m, l)) {
        var skip = el("button", "btn", "Straight to showdown");
        skip.disabled = b.disabled;
        skip.onclick = function () { ctx.go("showdown", { m: m, l: l }); };
        row.appendChild(skip);
      }
      s.appendChild(row);
    });
    var back = el("button", "btn", "Back to trail");
    back.onclick = function () { ctx.go("map"); };
    s.appendChild(back);
    app.appendChild(s);
  }

  window.Screens = { clear: clear, el: el, title: title, map: map, levels: levels };
})();
