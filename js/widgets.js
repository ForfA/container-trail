// widgets.js — interactive teach widgets, keyed by id
(function () {
  var registry = {};
  function E(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  // Module 1: break the monolith apart; crash one piece, the rest keep running.
  registry["monolith-split"] = function (container, onDone) {
    var stage = E("div", "panel");
    var cap = E("p", null, "The Monolith runs the mill, the bank, and the telegraph. Click it.");
    stage.appendChild(window.Sprites.el("monolith", 6));
    var big = E("button", "btn", "Break it apart");
    big.onclick = function () {
      stage.innerHTML = "";
      cap.textContent = "Three containers, one job each. Crash one and watch the others.";
      ["MILL", "BANK", "TELEGRAPH"].forEach(function (name) {
        var cell = E("div", null);
        cell.appendChild(window.Sprites.el("crate", 3));
        var status = E("div", null, name + ": RUNNING");
        var kill = E("button", "btn", "Crash " + name);
        kill.onclick = function () {
          status.textContent = name + ": CRASHED";
          cap.textContent = "One down — the other two never noticed. That's isolation. (The Monolith would've taken the whole town.)";
          kill.disabled = true;
          onDone();
        };
        cell.appendChild(status); cell.appendChild(kill);
        stage.appendChild(cell);
      });
    };
    container.appendChild(cap);
    container.appendChild(stage);
    container.appendChild(big);
  };

  // Module 2: toggle namespaces and watch what the "container" can see.
  registry["namespace-walls"] = function (container, onDone) {
    var on = { pid: false, net: false, mnt: false };
    var cap = E("p", null, "The host sees everything. Raise each namespace wall and watch the view shrink.");
    var view = E("div", "panel");
    function render() {
      view.textContent =
        "container sees —\n" +
        "processes: " + (on.pid ? "PID 1 (its own app) only" : "ALL host processes (PID 1..2417)") + "\n" +
        "network:   " + (on.net ? "its own eth0, own IP, own ports" : "the host's real interfaces and ports") + "\n" +
        "files:     " + (on.mnt ? "its own root filesystem from the image" : "the host's entire / filesystem");
      view.style.whiteSpace = "pre-wrap";
      if (on.pid && on.net && on.mnt) {
        cap.textContent = "Three walls up: the process believes it has a machine to itself. Namespaces = what you can SEE.";
        onDone();
      }
    }
    container.appendChild(cap);
    container.appendChild(view);
    [["pid", "PID namespace"], ["net", "network namespace"], ["mnt", "mount namespace"]].forEach(function (nspair) {
      var b = E("button", "btn", "Raise " + nspair[1]);
      b.onclick = function () { on[nspair[0]] = true; b.disabled = true; render(); };
      container.appendChild(b);
    });
    render();
  };

  // Module 4: edit different Dockerfile lines, see which layers rebuild.
  registry["layer-cache"] = function (container, onDone) {
    var lines = [
      "FROM node:20-alpine",
      "COPY package.json .",
      "RUN npm install",
      "COPY . .",
      'CMD ["node", "app.js"]',
    ];
    var didApp = false, didDeps = false;
    var cap = E("p", null, "Docker caches each layer. A change rebuilds that layer AND every layer after it. Try both edits.");
    var list = E("div", "panel");
    list.style.whiteSpace = "pre-wrap";
    function render(dirtyFrom) {
      list.textContent = lines.map(function (l, i) {
        var mark = dirtyFrom === undefined ? "  " : (i >= dirtyFrom ? "✗ " : "✓ ");
        var note = dirtyFrom === undefined ? "" : (i >= dirtyFrom ? "  REBUILD" : "  cached");
        return mark + l + note;
      }).join("\n");
      if (didApp && didDeps) {
        cap.textContent = "That's why COPY package.json + install comes BEFORE COPY . . — code edits stay cheap.";
        onDone();
      }
    }
    var editApp = E("button", "btn", "Edit app code, rebuild");
    editApp.onclick = function () { didApp = true; render(3); };
    var editDeps = E("button", "btn", "Edit package.json, rebuild");
    editDeps.onclick = function () { didDeps = true; render(1); };
    container.appendChild(cap);
    container.appendChild(list);
    container.appendChild(editApp);
    container.appendChild(editDeps);
    render();
  };

  var API = {
    mount: function (id, container, onDone) {
      if (!registry[id]) throw new Error("unknown widget: " + id);
      var fired = false;
      registry[id](container, function () { if (!fired) { fired = true; onDone(); } });
    },
  };
  var WIDGET_IDS = Object.keys(registry);
  if (typeof window !== "undefined") {
    window.Widgets = API;
    window.WIDGET_IDS = WIDGET_IDS;
  }
  if (typeof module !== "undefined") module.exports = { WIDGET_IDS: WIDGET_IDS };
})();
