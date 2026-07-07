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

  // Module 5: publish a host port to reach a container port.
  registry["port-bridge"] = function (container, onDone) {
    var mapped = false;
    var cap = E("p", null, "The web app listens on port 80 INSIDE the container. The town (host) can't reach it yet.");
    var log = E("div", "term", "");
    var req = E("button", "btn", "curl localhost:8080");
    req.onclick = function () {
      if (!mapped) {
        log.textContent += "$ curl localhost:8080\ncurl: (7) connection refused\n";
      } else {
        log.textContent += "$ curl localhost:8080\n<h1>Howdy from the container</h1>\n";
        cap.textContent = "-p 8080:80 = host port 8080 bridged to container port 80. That's publishing.";
        onDone();
      }
    };
    var map = E("button", "btn", "docker run -p 8080:80 web");
    map.onclick = function () {
      mapped = true;
      map.disabled = true;
      log.textContent += "$ docker run -d -p 8080:80 web\n(container started, 8080 -> 80 bridged)\n";
    };
    container.appendChild(cap); container.appendChild(log);
    container.appendChild(req); container.appendChild(map);
  };

  // Module 7: declare desired replicas; the controller reconciles.
  registry["replica-slider"] = function (container, onDone) {
    var desired = 1, actual = 1;
    var cap = E("p", null, "You declare DESIRED state. The Deployment's controller makes ACTUAL match. Set 3+, then shoot one.");
    var row = E("div", "panel");
    var status = E("p", null, "");
    function render() {
      row.innerHTML = "";
      for (var i = 0; i < actual; i++) row.appendChild(window.Sprites.el("pod", 3));
      status.textContent = "desired: " + desired + "  actual: " + actual;
    }
    var slider = document.createElement("input");
    slider.type = "range"; slider.min = "1"; slider.max = "5"; slider.value = "1";
    slider.oninput = function () {
      desired = Number(slider.value);
      actual = desired;
      render();
    };
    var shoot = E("button", "btn", "Shoot a pod");
    shoot.onclick = function () {
      if (actual === 0) return;
      var shotDesired = desired;
      actual--; render();
      status.textContent += "   (controller: actual < desired, starting a new pod...)";
      setTimeout(function () {
        actual = desired; render();
        if (shotDesired >= 3 && actual === desired) {
          cap.textContent = "You killed a pod — the controller saw actual < desired and replaced it. Nobody asked it to; that's reconciliation.";
          onDone();
        }
      }, 900);
    };
    container.appendChild(cap); container.appendChild(row);
    container.appendChild(status); container.appendChild(slider); container.appendChild(shoot);
    render();
  };

  // Module 8: fail liveness vs readiness, see the different consequences.
  registry["probe-flip"] = function (container, onDone) {
    var restarts = 0, didLive = false, didReady = false;
    var cap = E("p", null, "Two probes, two meanings. Fail each one and watch what Kubernetes does.");
    var status = E("div", "term", "");
    function show(lines) { status.textContent = lines.join("\n"); }
    function base(state, ready) {
      return ["pod: web-6f7d   status: " + state,
              "ready: " + ready + "   restarts: " + restarts,
              "service endpoints: " + (ready === "true" ? "web-6f7d" : "(none — no traffic sent)")];
    }
    show(base("Running", "true"));
    var live = E("button", "btn", "Fail the LIVENESS probe");
    live.onclick = function () {
      restarts++;
      didLive = true;
      show(base("Running (container restarted)", "true").concat(["liveness failed -> kubelet killed and restarted the container"]));
      check();
    };
    var ready = E("button", "btn", "Fail the READINESS probe");
    ready.onclick = function () {
      didReady = true;
      show(base("Running", "false").concat(["readiness failed -> pod stays alive but is removed from the Service"]));
      check();
    };
    function check() {
      if (didLive && didReady) {
        cap.textContent = "Liveness = restart me. Readiness = don't send me traffic. Mixing them up causes restart storms.";
        onDone();
      }
    }
    container.appendChild(cap); container.appendChild(status);
    container.appendChild(live); container.appendChild(ready);
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
