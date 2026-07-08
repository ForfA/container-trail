// module8.js — Production Ridge: liveness/readiness/startup probes, resource requests & limits, container security basics.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[7] = {
  id: 8,
  town: "Production Ridge",
  mentor: { name: "Watchman Ada", spriteId: "mentor8", intro: "Kind, paranoid, checklist for everything — night-watch veteran of the ridge." },
  arrival: [
    { type: "vignette", id: "town-ridge", caption: "Production Ridge. Watch-fires strung along the high line, embers holdin' back a black sky." },
    { type: "dialogue", speaker: "mentor", text: "Name's Ada. Night-watch, this ridge, longer than I care to count. Kind's easy. Careful's what keeps a town standin'." },
    { type: "dialogue", speaker: "carl", text: "Last stop, they tell me. What's left to learn, up here in the dark?" },
    { type: "dialogue", speaker: "mentor", text: "Keepin' it alive, once it's runnin'. Checklist for everything, Carl — that's the whole job. Let's walk it." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "Every gate locked, every fire watched. That's the whole job — not stoppin' trouble, just seein' it before it lands." },
    { type: "dialogue", speaker: "mentor", text: "You came up the trail a ranch hand. You're going down it a container wrangler. Go save your town." },
  ],
  levels: [
    {
      title: "Pulse Checks",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Pulse checks? Sounds like doctorin', not herdin'." },
        { type: "dialogue", speaker: "mentor", text: "Close enough. Kubernetes checks a pod's pulse two different ways, and mixin' 'em up is how you get a bad night." },
        { type: "dialogue", speaker: "mentor", text: "Liveness probe fails, the kubelet reckons the container's locked up — kills it, restarts it. Simple as that." },
        { type: "dialogue", speaker: "mentor", text: "Readiness probe fails, nothin' gets killed. Pod just gets pulled off the Service's list — no traffic sent till it's ready again." },
        { type: "widget", id: "probe-flip" },
        { type: "dialogue", speaker: "mentor", text: "See it now? Restart me is liveness. Don't send me traffic is readiness. Same pod, two different orders." },
        { type: "dialogue", speaker: "carl", text: "What about an app that's just slow wakin' up? Liveness would shoot it before it's had a chance." },
        { type: "dialogue", speaker: "mentor", text: "That's what a startup probe's for — holds liveness off till the app's had time to come up proper." },
        { type: "dialogue", speaker: "mentor", text: "Skip that, and a slow starter gets killed and restarted, over and over, never gettin' the chance to finish wakin' up." },
      ],
      questions: [
        { type: "mc", prompt: "When a pod's liveness probe fails repeatedly, what does Kubernetes do?", options: [
            "The kubelet kills the container and restarts it",
            "The pod is removed from the Service's endpoints, but nothing is restarted",
            "The whole node is rebooted",
            "Nothing — liveness probes are purely informational",
          ], answer: 0, explain: "Liveness answers one question: is this container still alive and functioning? Fail it, and the kubelet's response is to kill and restart the container." },
        { type: "mc", prompt: "When a pod's readiness probe fails, what happens?", options: [
            "The pod is pulled out of the Service's endpoint list — no traffic sent — but the container is not restarted",
            "The kubelet kills and restarts the container",
            "The pod is deleted entirely",
            "The Service starts sending it double the traffic to test recovery",
          ], answer: 0, explain: "Readiness answers a different question: is this container ready to take traffic right now? Fail it, and the pod is just removed from the Service's endpoints — it keeps running, only off the routing list until it passes again." },
        { type: "mc", prompt: "What's the core contrast between a liveness probe and a readiness probe?", options: [
            "Liveness failing gets the container restarted; readiness failing just pulls it off the Service's traffic list",
            "They do the exact same thing, just with different names",
            "Liveness is for Deployments only; readiness is for Services only",
            "Readiness failing restarts the container; liveness failing removes it from traffic",
          ], answer: 0, explain: "Restart me vs. don't send me traffic — that's the whole contrast. Liveness controls whether the kubelet restarts the container; readiness controls whether the Service routes traffic to it." },
        { type: "mc", prompt: "What does a startup probe do?", options: [
            "Gives a slow-starting app time to come up before liveness checks begin",
            "Replaces liveness and readiness probes entirely",
            "Measures how many replicas a Deployment needs",
            "Runs only after the container has already been marked ready",
          ], answer: 0, explain: "A startup probe holds liveness off until it succeeds once — buying a slow-starting app the runway it needs, instead of getting killed by liveness before it's even up." },
        { type: "tf", prompt: "Configuring the wrong probe — like a liveness probe too aggressive for a slow-starting app — can cause the container to enter a restart loop.", answer: true, explain: "If liveness fires before a slow app finishes starting, the kubelet kills and restarts it, the app starts slow again, liveness fires again — it never gets the chance to stabilize." },
      ],
    },
    {
      title: "Rationing at Scale",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Rationing? Same fences Nils taught me, back in the canyon?" },
        { type: "dialogue", speaker: "mentor", text: "Same fences, ridge-sized. Cgroups are still doin' the work under the hood — we just call the numbers somethin' else up here." },
        { type: "dialogue", speaker: "mentor", text: "Requests is what you ask the scheduler to set aside before the pod ever lands — enough memory, enough CPU, guaranteed room on some node." },
        { type: "dialogue", speaker: "mentor", text: "Limits is the hard cap. Go over that once you're runnin', and there's a reckonin'." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "cat pod.yaml", output: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\nspec:\n  containers:\n  - name: web\n    image: web:1.4\n    resources:\n      requests:\n        memory: \"128Mi\"\n        cpu: \"250m\"\n      limits:\n        memory: \"256Mi\"\n        cpu: \"500m\"" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Watch what happens when a pod eats past its memory limit." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl describe pod web", output: "Name:         web\nNamespace:    default\nStatus:       Running\nContainers:\n  web:\n    Image:          web:1.4\n    State:          Running\n    Last State:     Terminated\n      Reason:       OOMKilled\n      Exit Code:    137\n    Ready:          True\n    Restart Count:  1" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "137 again. Same number Nils showed you back in the canyon — 128 plus SIGKILL. Memory's still a hard wall, cluster-sized or not." },
        { type: "dialogue", speaker: "carl", text: "And if it's CPU that runs over, 'stead of memory?" },
        { type: "dialogue", speaker: "mentor", text: "Different punishment, same as always. CPU don't kill you — it throttles you. Slows the pod down, keeps it breathin'." },
      ],
      questions: [
        { type: "mc", prompt: "What does a pod's resource request represent?", options: [
            "What the scheduler reserves for the pod when deciding which node to place it on",
            "The hard cap enforced once the pod is already running",
            "The total memory available on the node",
            "A suggestion the kubelet is free to ignore",
          ], answer: 0, explain: "Requests are what the scheduler uses to find room: it won't place a pod on a node that can't cover the requested CPU and memory. It's a placement guarantee, not a runtime cap." },
        { type: "mc", prompt: "What does a pod's resource limit represent?", options: [
            "The hard cap enforced at runtime — the most the container is allowed to use",
            "The minimum the scheduler reserves before placement",
            "The number of replicas a Deployment can run",
            "A limit only enforced during image build, never at runtime",
          ], answer: 0, explain: "Limits are enforced while the container runs, not at placement time — go over it and the runtime steps in, differently for memory than for CPU." },
        { type: "mc", prompt: "A container blows past its memory limit. What happens?", options: [
            "It's OOMKilled — the container is terminated",
            "It's throttled, slowed but left running",
            "The limit is automatically raised",
            "Nothing — memory limits are advisory only",
          ], answer: 0, explain: "Memory is a hard wall, same as back in Kernel Canyon: go over the limit, and the container is OOMKilled — cgroups enforcing it whether it's one process or a whole pod." },
        { type: "tf", prompt: "A container that exceeds its CPU limit gets OOMKilled, the same as one that exceeds its memory limit.", answer: false, explain: "CPU and memory are punished differently: a CPU overage gets throttled — slowed down, not killed. Only a memory overage triggers an OOM kill." },
        { type: "tf", prompt: "Kubernetes requests and limits are ultimately enforced using the same cgroups mechanism that restricted a single container back in Kernel Canyon.", answer: true, explain: "Nothing new under the hood — the kubelet configures cgroups for the pod's containers to enforce whatever requests and limits you declared. Same fences, just set from a pod spec instead of a docker run flag." },
      ],
    },
    {
      title: "Locking the Gates",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Last gate. What's left to lock up?" },
        { type: "dialogue", speaker: "mentor", text: "Five things. Checklist for everything, remember? First — never run a container as root." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "cat Dockerfile", output: "FROM node:20-alpine\nRUN adduser -D app\nWORKDIR /app\nCOPY . .\nRUN npm ci --omit=dev\nUSER app\nCMD [\"node\", \"server.js\"]" },
            { cmd: "cat pod.yaml", output: "apiVersion: v1\nkind: Pod\nmetadata:\n  name: web\nspec:\n  securityContext:\n    runAsNonRoot: true\n  containers:\n  - name: web\n    image: web:1.4" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "USER app in the image, runAsNonRoot in the pod spec — same order, two places. Root inside a container's still root against the kernel underneath." },
        { type: "dialogue", speaker: "mentor", text: "Second — Silas taught you slim, back in Buildtown. Fewer packages installed, fewer doors for a stranger to pry open." },
        { type: "dialogue", speaker: "mentor", text: "Third — never bake a secret into the image. Bake a password into a layer and it's sittin' there forever, in every copy, even after a later layer papers over it." },
        { type: "dialogue", speaker: "mentor", text: "Kip's Secrets exist for exactly that — supply the sensitive stuff at runtime, never bury it in a layer." },
        { type: "dialogue", speaker: "mentor", text: "Fourth — keep the image current. Old software's got old holes. Scan it, patch it, don't let it rot on the shelf." },
        { type: "dialogue", speaker: "carl", text: "And all that fencin' Nils showed me — namespaces, cgroups — that ain't enough on its own?" },
        { type: "dialogue", speaker: "mentor", text: "Not near enough. Every container on this ridge shares the same kernel underneath. That's a thinner wall than most figure." },
        { type: "dialogue", speaker: "mentor", text: "Good habits are what actually holds the gate, Carl. The fence alone never does." },
        { type: "dialogue", speaker: "mentor", text: "Reckon that's everything. Watch craft's just discipline, dressed up fancy." },
      ],
      questions: [
        { type: "mc", prompt: "Why shouldn't a container run as root?", options: [
            "Because it shares the host's kernel — root inside the container still carries real privilege against that shared kernel",
            "Because root processes use more memory than other users",
            "Because Kubernetes refuses to schedule any pod running as root",
            "Because Docker images can't include a USER instruction",
          ], answer: 0, explain: "A container isn't a VM with its own kernel — it shares the host's. Running as root inside it is closer to real root than people expect, so a non-root USER in the image and runAsNonRoot in the pod spec both cut that risk down." },
        { type: "mc", prompt: "What's the security benefit of a minimal base image, like alpine instead of a full OS image?", options: [
            "Fewer installed packages means a smaller attack surface — less software that could carry a vulnerability",
            "It automatically encrypts all traffic to and from the container",
            "It makes the container immune to being run as root",
            "It removes the need for resource requests and limits",
          ], answer: 0, explain: "Every installed package is one more thing that could carry a known vulnerability. A slim base image isn't just faster to pull — less installed means less for an attacker to find." },
        { type: "mc", prompt: "Why should secrets never be baked into a container image?", options: [
            "They persist in the image's layers permanently — even a later layer that 'removes' them doesn't erase the earlier one",
            "Docker images have no way to store text data at all",
            "It would make the image too large to pull",
            "Secrets baked into an image get automatically encrypted, which breaks the app",
          ], answer: 0, explain: "An image is a stack of read-only layers. Delete a secret in a later layer and it's still sitting in the earlier one, inside every copy of that image. Supply it at runtime instead, the way a Secret does." },
        { type: "mc", prompt: "What's the recommended practice for keeping a running image secure over time?", options: [
            "Keep it updated and scanned for known vulnerabilities rather than letting it sit unpatched",
            "Build it once and never touch it again, since containers are inherently secure",
            "Add more packages over time so it has more built-in tools",
            "Switch to running everything as root so nothing gets blocked",
          ], answer: 0, explain: "Software ages — new vulnerabilities get discovered in packages that were fine yesterday. Rebuilding on a current, scanned base image is how you keep known holes out of what you're running." },
        { type: "tf", prompt: "Since containers are isolated by namespaces and cgroups, running one as root carries no real security risk.", answer: false, explain: "Isolation is real but it's not a substitute for good practice — every container on the same host still shares that host's kernel. Namespaces and cgroups narrow the view and ration resources; they don't erase what root privilege means underneath." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[7];
