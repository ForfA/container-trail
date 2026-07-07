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

(function () {
  var S = window.Screens;

  function sceneNode(scene, mod, onAdvance) {
    var box = S.el("div", "panel");
    if (scene.type === "dialogue") {
      var d = S.el("div", "dialogue-box");
      var who = scene.speaker === "carl" ? "Carl" : (mod ? mod.mentor.name : "???");
      var spriteId = scene.speaker === "carl" ? "carl" : (mod ? mod.mentor.spriteId : "carl");
      d.appendChild(window.Sprites.el(spriteId, 4));
      var t = S.el("div");
      t.appendChild(S.el("div", "speaker", who));
      t.appendChild(S.el("p", null, scene.text));
      d.appendChild(t);
      box.appendChild(d);
      return { node: box, interactive: false };
    }
    if (scene.type === "vignette") {
      box.appendChild(window.Sprites.el(scene.id, 6));
      box.appendChild(S.el("p", null, scene.caption));
      return { node: box, interactive: false };
    }
    if (scene.type === "diagram") {
      var step = 0;
      var holder = S.el("div");
      box.appendChild(holder);
      var cap = S.el("p");
      box.appendChild(cap);
      function render() {
        holder.innerHTML = "";
        window.Diagrams[scene.id](holder, step);
        cap.textContent = scene.steps[step].caption;
      }
      render();
      // Diagram consumes "advance" until its last step is shown.
      return {
        node: box, interactive: true,
        advance: function () {
          if (step < scene.steps.length - 1) { step++; render(); return false; }
          return true;
        },
      };
    }
    if (scene.type === "terminal") {
      var term = S.el("div", "term");
      box.appendChild(term);
      var i = 0, waitingInput = null;
      function showLine() {
        if (i >= scene.lines.length) return true;
        var line = scene.lines[i];
        if (scene.playerTypes) {
          term.appendChild(document.createTextNode("$ "));
          var inp = document.createElement("input");
          term.appendChild(inp);
          setTimeout(function () { inp.focus(); }, 0);
          waitingInput = { inp: inp, line: line };
          return false;
        }
        term.appendChild(document.createTextNode("$ " + line.cmd + "\n" + line.output + "\n"));
        i++;
        return false;
      }
      showLine();
      return {
        node: box, interactive: true,
        advance: function () {
          if (waitingInput) {
            var w = waitingInput;
            if (window.Answers.normalizeCmd(w.inp.value) !== window.Answers.normalizeCmd(w.line.cmd)) {
              w.inp.value = ""; w.inp.placeholder = "try: " + w.line.cmd; return false;
            }
            w.inp.replaceWith(document.createTextNode(w.line.cmd));
            term.appendChild(document.createTextNode("\n" + w.line.output + "\n"));
            waitingInput = null; i++;
          }
          if (i >= scene.lines.length) return true;
          return showLine() === true;
        },
      };
    }
    if (scene.type === "widget") {
      var done = false;
      window.Widgets.mount(scene.id, box, function () { done = true; onAdvance(); });
      return { node: box, interactive: true, advance: function () { return done; } };
    }
    throw new Error("unknown scene type: " + scene.type);
  }

  S.playScenes = function (app, ctx, scenes, mod, onDone) {
    var idx = 0;
    var currentNext;
    function onKeydown(e) {
      if (e.key !== " ") return;
      var active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      e.preventDefault();
      currentNext();
    }
    document.addEventListener("keydown", onKeydown);
    function show() {
      S.clear(app);
      var screen = S.el("div", "screen");
      var current = sceneNode(scenes[idx], mod, next);
      screen.appendChild(current.node);
      var b = S.el("button", "btn", "Onward");
      b.onclick = next;
      screen.appendChild(b);
      app.appendChild(screen);
      currentNext = next;
      function next() {
        if (!current) return;
        if (current.interactive && current.advance && current.advance() === false) return;
        idx++;
        if (idx >= scenes.length) {
          document.removeEventListener("keydown", onKeydown);
          return onDone();
        }
        show();
      }
    }
    show();
  };

  S.teach = function (app, ctx, m, l) {
    var mod = window.GameData.modules[m];
    var seq = [];
    if (l === 0 && !ctx.state.hasAttempted(m, 0)) seq = seq.concat(mod.arrival);
    seq = seq.concat(mod.levels[l].scenes);
    S.playScenes(app, ctx, seq, mod, function () { ctx.go("showdown", { m: m, l: l }); });
  };
})();

(function () {
  var Diagrams = {};

  function stackDiagram(container, layers, upto) {
    var c = document.createElement("canvas");
    c.className = "pixel-canvas";
    c.width = 560; c.height = 40 * layers.length + 8;
    var g = c.getContext("2d");
    g.font = "16px monospace";
    for (var i = 0; i <= upto && i < layers.length; i++) {
      var y = c.height - 40 * (i + 1);
      layers[i].forEach(function (cell, j) {
        var x = 8 + j * (540 / layers[i].length);
        g.fillStyle = cell.fill;
        g.fillRect(x, y, 540 / layers[i].length - 8, 32);
        g.fillStyle = cell.fill === "#000" ? "#fff" : "#000";
        g.fillText(cell.label, x + 6, y + 21);
      });
    }
    container.appendChild(c);
  }

  Diagrams["vm-vs-container"] = function (container, step) {
    // steps: 0 hardware, 1 host OS, 2 hypervisor|runtime, 3 guests|apps
    var rows = [
      [{ label: "HARDWARE", fill: "#000" }, { label: "HARDWARE", fill: "#000" }],
      [{ label: "HOST OS", fill: "#888" }, { label: "HOST OS", fill: "#888" }],
      [{ label: "HYPERVISOR", fill: "#ccc" }, { label: "CONTAINER RUNTIME", fill: "#ccc" }],
      [{ label: "GUEST OS + APP x3", fill: "#fff" }, { label: "APP  APP  APP", fill: "#fff" }],
    ];
    stackDiagram(container, rows, step);
  };

  Diagrams["image-layers"] = function (container, step) {
    var rows = [
      [{ label: "BASE IMAGE (alpine)", fill: "#000" }],
      [{ label: "LAYER: install deps", fill: "#888" }],
      [{ label: "LAYER: copy app", fill: "#ccc" }],
      [{ label: "CONTAINER: writable layer", fill: "#fff" }],
    ];
    stackDiagram(container, rows, step);
  };

  window.Diagrams = Diagrams;
  window.DIAGRAM_IDS = Object.keys(Diagrams);
})();
