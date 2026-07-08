// module7.js — Deployment Pass: Deployments, Services, ConfigMaps/Secrets, namespaces & rollouts.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[6] = {
  id: 7,
  town: "Deployment Pass",
  mentor: { name: "Drover Kip", spriteId: "mentor7", intro: "Moves a thousand head with standing orders, not shouting." },
  arrival: [
    { type: "vignette", id: "town-pass", caption: "Deployment Pass. Switchbacks climb thin air — pod after pod grazing the high ledges, herd after matched herd." },
    { type: "dialogue", speaker: "mentor", text: "Kip. I move a thousand head up this pass without raisin' my voice once. Standin' orders do the work." },
    { type: "dialogue", speaker: "carl", text: "Standing orders? Not out there shoutin' at every pod yourself?" },
    { type: "dialogue", speaker: "mentor", text: "Never. Write the order once — how many head, what breed — and the herd holds itself to it. That's what I'm here to teach you." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "Orders keep the herd movin' — desired state, Services findin' the right pods no matter how they shuffle." },
    { type: "dialogue", speaker: "mentor", text: "Orders keep it movin'. Production Ridge teaches you to keep it alive. Last climb, Carl." },
  ],
  levels: [
    {
      title: "Standing Orders",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Back in Helmsburg I made one pod by hand. That can't be how a whole fleet gets run." },
        { type: "dialogue", speaker: "mentor", text: "It ain't. Write a Deployment instead — one image, one replica count, and it holds that many identical pods runnin', always." },
        { type: "dialogue", speaker: "mentor", text: "Under the hood a Deployment don't touch pods direct — it manages a ReplicaSet, and the ReplicaSet keeps the headcount right. You rarely make a bare pod again." },
        { type: "widget", id: "replica-slider" },
        { type: "dialogue", speaker: "mentor", text: "Watched that? You set desired, the controller made actual match, and when you shot one down it just... came back. That's reconciliation — same job, every second, forever." },
        { type: "dialogue", speaker: "carl", text: "What if I want more head runnin' later, not right now?" },
        { type: "dialogue", speaker: "mentor", text: "kubectl scale deployment web --replicas 3 — changes the desired count on the fly. Controller sees the new order and gets to work closin' the gap." },
      ],
      questions: [
        { type: "mc", prompt: "What does a Deployment declare?", options: [
            "The desired state for a set of identical pods — which image to run and how many replicas",
            "A one-time list of commands to run in order",
            "A single pod's exact IP address",
            "The physical machine a pod must run on",
          ], answer: 0, explain: "A Deployment is a declaration: this image, this many replicas, kept running. It doesn't script out steps — it states the outcome you want." },
        { type: "mc", prompt: "What does a Deployment's controller do continuously?", options: [
            "Reconciles — compares actual state to desired state and acts to close any gap",
            "Deletes pods at random to test resilience",
            "Runs only once, at creation time, then stops watching",
            "Waits for a human to manually fix any problems",
          ], answer: 0, explain: "Reconciliation never stops: the controller keeps comparing what's actually running against what was declared, and acts — creating or removing pods — whenever they drift apart." },
        { type: "tf", prompt: "If you delete a pod that's managed by a Deployment, it just gets replaced.", answer: true, explain: "The Deployment's ReplicaSet notices the headcount dropped below desired and creates a fresh pod to bring it back — deleting a managed pod doesn't shrink the herd." },
        { type: "mc", prompt: "Under a Deployment, what actually keeps the pod headcount at the right number?", options: [
            "A ReplicaSet that the Deployment manages",
            "You, manually creating a new pod each time one dies",
            "The API server directly, with no other component involved",
            "Nothing — pod count is fixed forever once set",
          ], answer: 0, explain: "A Deployment doesn't manage pods directly — it manages a ReplicaSet, and the ReplicaSet is the piece actually keeping the pod count at the declared number." },
        { type: "tf", prompt: "For anything meant to keep running, you should usually create bare, unmanaged pods rather than a Deployment.", answer: false, explain: "A bare pod that dies just stays dead — nothing recreates it. A Deployment is what you want for anything that should keep running, which is why bare pods are rare." },
      ],
    },
    {
      title: "The Meeting Post",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Back at Helmsburg — pods get replaced, and the new one's got a different IP. So how's anything supposed to find it?" },
        { type: "dialogue", speaker: "mentor", text: "Meetin' post. A Service. Fixed name, fixed virtual IP, standin' in front of a herd that keeps shufflin' underneath it." },
        { type: "dialogue", speaker: "mentor", text: "It don't track pods by name or by ID. It matches by LABELS — any pod wearin' the right tag gets found, no matter how many times it's been replaced." },
        { type: "diagram", id: "service", steps: [
            { caption: "The Service: one stable name, one stable virtual IP. That address never changes, even as the pods behind it do." },
            { caption: "It finds its pods by matching LABELS — a tag on each pod, not a fixed list of names or IPs." },
            { caption: "Traffic hittin' the Service gets load-balanced across every matching pod — spread the work, not sent to just one." },
          ] },
        { type: "dialogue", speaker: "carl", text: "So how do I reach a Service — from inside the cluster, or from outside it?" },
        { type: "dialogue", speaker: "mentor", text: "Depends on the type. ClusterIP's the default — internal only. NodePort opens the same port on every node. LoadBalancer gets you a real external IP from the cloud." },
      ],
      questions: [
        { type: "mc", prompt: "What problem does a Service solve?", options: [
            "It gives a stable name and virtual IP in front of a set of pods whose own IPs keep changing",
            "It builds container images faster",
            "It replaces the need for a control plane",
            "It stores the cluster's persistent data",
          ], answer: 0, explain: "A Service is the fixed point pods themselves can't be — it holds a stable name and virtual IP steady in front of a changing set of pods underneath." },
        { type: "mc", prompt: "How does a Service decide which pods it routes traffic to?", options: [
            "By matching labels on pods, not by tracking fixed names or IPs",
            "By picking whichever pod was created first",
            "By the node the pod happens to be running on",
            "By a hardcoded list of pod IPs written into the Service",
          ], answer: 0, explain: "A Service uses a label selector: any pod carrying the matching labels is included, automatically, however many times it's been replaced." },
        { type: "tf", prompt: "The default Service type, ClusterIP, is reachable only from inside the cluster.", answer: true, explain: "ClusterIP is internal-only by design — it's the default because most services only need to be reached by other things inside the same cluster." },
        { type: "mc", prompt: "Which best matches these Service types: ClusterIP, NodePort, LoadBalancer?", options: [
            "ClusterIP = internal only; NodePort = opens the same port on every node; LoadBalancer = gets an external IP from the cloud provider",
            "ClusterIP = external only; NodePort = internal only; LoadBalancer = disables all access",
            "All three behave identically — the name is just cosmetic",
            "NodePort and LoadBalancer are both internal-only, and ClusterIP is the only external option",
          ], answer: 0, explain: "Each type widens access a step further: ClusterIP stays inside the cluster, NodePort opens a port on every node, and LoadBalancer provisions an external IP through the cloud provider." },
        { type: "tf", prompt: "A Service only ever sends traffic to one pod — the rest of the matching pods sit idle as backups.", answer: false, explain: "A Service load-balances across every pod matching its label selector — traffic is spread among them, not aimed at just one while the rest wait idle." },
      ],
    },
    {
      title: "Sealed Envelopes",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Same app, but it needs a different database address in test than out here in production. Rebuild the image each time?" },
        { type: "dialogue", speaker: "mentor", text: "Never rebuild for that. Config don't belong baked into the image — same image, every environment, config supplied separate, alongside it." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl create configmap web-config --from-literal=DB_HOST=ranch-db", output: "configmap/web-config created" },
            { cmd: "kubectl describe pod web", output: "Name:  web\nContainers:\n  web:\n    Environment:\n      DB_HOST:  <set to the key 'DB_HOST' of config map 'web-config'>" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "ConfigMap holds ordinary settings — hostnames, feature flags, nothin' sensitive. Pod reads it as an environment variable, right there at startup." },
        { type: "dialogue", speaker: "carl", text: "And passwords? Can't be settin' those the same open way." },
        { type: "dialogue", speaker: "mentor", text: "Different envelope for those. A Secret." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl get secrets", output: "NAME          TYPE     DATA   AGE\ndb-password   Opaque   1      2d" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Secrets carry the sensitive stuff — passwords, tokens. Same delivery, mind: env var or a mounted file, pod's choice." },
        { type: "dialogue", speaker: "mentor", text: "One warnin', and it's an important one: a Secret's just base64-ENCODED, not encrypted. Anybody who can read it decodes it in one line. Encodin' ain't encryption." },
      ],
      questions: [
        { type: "mc", prompt: "Why keep configuration like a database hostname outside the image instead of baking it in?", options: [
            "The same image can then run unchanged across environments — only the config supplied alongside it differs",
            "Because Kubernetes can't read environment variables baked into an image",
            "Because images aren't allowed to contain any text files",
            "It doesn't matter either way — baking config in is just as flexible",
          ], answer: 0, explain: "External config is what lets one built-once image run in test, staging, and production unchanged — only the ConfigMap or Secret handed to it differs per environment." },
        { type: "mc", prompt: "What belongs in a ConfigMap?", options: [
            "Non-sensitive configuration — hostnames, feature flags, and similar settings",
            "Passwords and API tokens",
            "The container image itself",
            "The cluster's entire state",
          ], answer: 0, explain: "ConfigMaps are for ordinary, non-sensitive settings. Anything sensitive — credentials, tokens — belongs in a Secret instead." },
        { type: "mc", prompt: "How can a pod consume a Secret's values?", options: [
            "As environment variables or as mounted files — the pod's choice",
            "Only by SSH-ing into the node directly",
            "Secrets can't be consumed by pods, only by kubectl",
            "Only as a mounted file, never as an environment variable",
          ], answer: 0, explain: "Secrets can be exposed to a pod either as environment variables or as files mounted into the container's filesystem, same as ConfigMaps." },
        { type: "tf", prompt: "A Kubernetes Secret's values are encrypted by default, so anyone reading them just sees gibberish.", answer: false, explain: "Secrets are base64-encoded by default, not encrypted — decoding one is a single trivial step. That's an encoding format, not a security boundary." },
        { type: "tf", prompt: "Both ConfigMaps and Secrets can be delivered to a pod as environment variables or as mounted files.", answer: true, explain: "The delivery mechanism is the same for both — the difference is only in what kind of data belongs in each, sensitive versus non-sensitive." },
      ],
    },
    {
      title: "Fenced Ranges",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Namespaces? Nils taught me namespaces back in Kernel Canyon. Same thing?" },
        { type: "dialogue", speaker: "mentor", text: "Same word. Different fence entirely. Linux namespaces hide part of a machine from one process. Kubernetes namespaces just divide up one cluster into separate ranges." },
        { type: "dialogue", speaker: "mentor", text: "Teams, environments, whatever you want fenced apart — that's what a Kubernetes namespace is for. No relation to Nils' walls at all, past sharin' a name." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl get pods -n ranch-dev", output: "NAME        READY   STATUS    RESTARTS   AGE\nweb-dev-1   1/1     Running   0          3h" },
            { cmd: "kubectl get pods", output: "NAME       READY   STATUS    RESTARTS   AGE\nweb-7f9d   1/1     Running   0          6d" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Different range, different pods — even a pod named web could exist in both, and Kubernetes wouldn't confuse 'em. The namespace is part of the name." },
        { type: "dialogue", speaker: "carl", text: "Now say I push a bad image out to everybody at once — sounds like a disaster waitin' to happen." },
        { type: "dialogue", speaker: "mentor", text: "Deployment don't do it at once. Rolls new pods up gradual, old ones down gradual, right alongside 'em — never the whole herd down together." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl rollout undo deployment web", output: "deployment.apps/web rolled back" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Rollout still goes bad sometimes anyway. kubectl rollout undo — one order, and it steps the herd right back to the last good state." },
      ],
      questions: [
        { type: "mc", prompt: "What do Kubernetes namespaces do?", options: [
            "Partition a single cluster into logical spaces — for different teams or environments",
            "Isolate a process's view of the host machine, same as Linux namespaces",
            "Give every pod its own separate cluster",
            "Encrypt traffic between pods",
          ], answer: 0, explain: "Kubernetes namespaces are an organizational fence within one cluster — a way to split resources into logical groups like teams or environments." },
        { type: "tf", prompt: "A pod named web can exist in the ranch-dev namespace and a different pod also named web can exist in the default namespace, without conflict.", answer: true, explain: "A resource's full identity includes its namespace, so the same name is free to be reused in a different namespace without colliding." },
        { type: "mc", prompt: "How do Kubernetes namespaces relate to the Linux namespaces from Kernel Canyon?", options: [
            "They're unrelated mechanisms that share a name — Linux namespaces isolate a process's view of the host; Kubernetes namespaces just partition a cluster into logical groups",
            "They're the exact same mechanism, just applied at a bigger scale",
            "Kubernetes namespaces are built directly on top of the Linux PID namespace",
            "Linux namespaces were named after Kubernetes namespaces",
          ], answer: 0, explain: "Same word, unrelated tools. Linux namespaces are a kernel isolation mechanism controlling what a process can see; Kubernetes namespaces are just an organizational grouping inside the cluster's API." },
        { type: "mc", prompt: "When a Deployment rolls out a new image version, what happens by default?", options: [
            "New pods come up gradually alongside the old ones, which are then gradually removed — not all at once",
            "Every old pod is deleted immediately, then new ones are created from scratch",
            "The cluster pauses all traffic until the rollout finishes",
            "Only one pod total exists during the entire process",
          ], answer: 0, explain: "A Deployment's default rolling update brings new pods up gradually while old ones step down gradually, so the workload as a whole stays available throughout." },
        { type: "tf", prompt: "kubectl rollout undo reverts a Deployment to its previous working version.", answer: true, explain: "rollout undo steps a Deployment back to the last rollout revision before the one that's causing trouble now." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[6];
