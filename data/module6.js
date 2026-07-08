// module6.js — Helmsburg: orchestration, cluster architecture, pods & kubectl.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[5] = {
  id: 6,
  town: "Helmsburg",
  mentor: { name: "Helmswoman Vera", spriteId: "mentor6", intro: "Watches every hull in the fleet at once, calm as still water." },
  arrival: [
    { type: "vignette", id: "town", caption: "Helmsburg. A river port, wharves crowded with boats — more hulls than one pair of hands could ever tie off." },
    { type: "dialogue", speaker: "mentor", text: "Vera. Fleet-mistress here. I don't run one boat — I watch the whole fleet, all at once, and keep it steady." },
    { type: "dialogue", speaker: "carl", text: "All at once? Mo said you steer hundreds. One wagon at a time about wore me out already." },
    { type: "dialogue", speaker: "mentor", text: "One hand, one boat — that scales to maybe a dozen. Past that you need somethin' that steers the fleet itself. Climb aboard, I'll show you." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "You know the crew now — pods, what's in 'em, how to count 'em with kubectl. Every name learned." },
    { type: "dialogue", speaker: "mentor", text: "But knowin' the crew's names isn't the same as givin' orders. Climb Deployment Pass, Carl — Kip'll teach you that part." },
  ],
  levels: [
    {
      title: "Too Many Cattle for One Cowboy",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Fifty machines. Am I supposed to run docker run by hand on every last one of 'em?" },
        { type: "dialogue", speaker: "mentor", text: "By hand works for one. Past a handful you need somethin' that picks which machine runs what, notices a dead one, and fixes it — without you lifting a finger." },
        { type: "dialogue", speaker: "mentor", text: "Scale the herd up, roll a new version out without spookin' the whole fleet — that's orchestration. Kubernetes is the standard hand that does it, near everywhere you look." },
        { type: "diagram", id: "cluster", steps: [
            { caption: "One control plane watches over the whole cluster — the brain deciding where every pod runs." },
            { caption: "Below it, worker nodes — real machines, each ready to run its share of the workload." },
            { caption: "Pods land on those nodes. The control plane decides the placement; you never pick the machine yourself." },
          ] },
        { type: "dialogue", speaker: "carl", text: "So how do I tell it what to do?" },
        { type: "dialogue", speaker: "mentor", text: "You don't order it around step by step. You declare the state you want — three boats runnin' this cargo — and it works, on its own, to keep that true." },
        { type: "dialogue", speaker: "mentor", text: "Kubernetes — Greek for helmsman. Steersman. Fittin' name for somethin' that keeps a fleet on course without you touchin' the tiller." },
      ],
      questions: [
        { type: "mc", prompt: "At the scale of many machines, what does 'orchestration' mean?", options: [
            "Automatically deciding where workloads run, healing failures, scaling, and rolling out updates",
            "Running docker run manually on each machine, one after another",
            "Just keeping a written list of which machines exist",
            "Combining several Dockerfiles into one bigger Dockerfile",
          ], answer: 0, explain: "Orchestration is the whole bundle: scheduling work onto machines, noticing and replacing failures, scaling up or down, and rolling out updates — all handled automatically instead of by hand." },
        { type: "mc", prompt: "Which tool has become the standard for container orchestration?", options: [
            "Kubernetes",
            "Docker Compose",
            "A single Dockerfile",
            "docker ps",
          ], answer: 0, explain: "Kubernetes is the orchestrator nearly everyone has standardized on for running containers across many machines — Compose is built for a single host, not a fleet." },
        { type: "mc", prompt: "What's the core idea behind how you operate a Kubernetes cluster?", options: [
            "You declare the desired state — like 3 replicas of this image — and Kubernetes continuously works to make reality match it",
            "You SSH into each node and configure it by hand, one at a time",
            "You issue a strict sequence of imperative start/stop commands for every machine",
            "You write your own script that loops forever restarting containers",
          ], answer: 0, explain: "That's the declarative model at the heart of Kubernetes: you say what you want, not how to get there, and its controllers keep working toward that state on their own." },
        { type: "tf", prompt: "Manually running docker run on each machine by hand keeps working fine no matter how many machines you add.", answer: false, explain: "It breaks down past a handful of machines — nothing's watching for failures, nothing's balancing the load, and rolling out an update means touching every machine yourself." },
        { type: "tf", prompt: "Orchestration only covers starting containers — it has nothing to do with what happens when one crashes.", answer: false, explain: "Self-healing is part of orchestration too: scheduling, healing crashed workloads, scaling, and rolling updates are all pieces of the same job." },
      ],
    },
    {
      title: "The Ship's Crew",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Alright — control plane, worker nodes, pods. But what's actually running inside that control plane?" },
        { type: "dialogue", speaker: "mentor", text: "Everything you or the cluster itself wants done goes through one place first: the API server. Every request knocks on that door." },
        { type: "dialogue", speaker: "mentor", text: "Behind that door sits etcd — the cluster's memory. Desired state, current state, all of it lives there. Lose etcd, the cluster forgets itself." },
        { type: "dialogue", speaker: "mentor", text: "Scheduler picks which node a new pod lands on. Controller manager runs the reconciliation loops — always checkin' actual against desired, always closin' the gap." },
        { type: "diagram", id: "cluster", steps: [
            { caption: "Control plane: API server (the front door), etcd (the state store), scheduler, controller manager — all here, none of it on a worker node." },
            { caption: "Each worker node runs a kubelet — the agent takin' orders from the control plane and runnin' pods on that machine." },
            { caption: "Nodes also carry a container runtime, to actually run the containers, and kube-proxy, handlin' that node's networking rules." },
          ] },
        { type: "dialogue", speaker: "mentor", text: "kubectl — the tool in your own two hands — talks to one thing only: the API server. Never straight to a node, never straight to etcd." },
        { type: "dialogue", speaker: "carl", text: "So if I run kubectl get pods, that request goes to the API server first?" },
        { type: "dialogue", speaker: "mentor", text: "Every time. It asks etcd, hands you back the answer. You never touch a node direct — the control plane's the only door in." },
      ],
      questions: [
        { type: "mc", prompt: "What is the API server's role in a Kubernetes cluster?", options: [
            "The front door — every request, whether from kubectl or from the cluster's own components, goes through it",
            "It stores all the cluster's state permanently on disk",
            "It's the agent that runs on each node, starting containers",
            "It only handles authentication and nothing else",
          ], answer: 0, explain: "The API server is the single entry point for the whole cluster. kubectl, the scheduler, the controller manager — all of them talk to it, never to each other directly." },
        { type: "mc", prompt: "What does etcd do?", options: [
            "Stores the cluster's state — desired and current — that everything else reads from and writes to",
            "Runs the containers themselves",
            "Schedules pods onto nodes",
            "Is the command-line tool administrators run",
          ], answer: 0, explain: "etcd is the cluster's memory: a consistent store holding the desired and actual state of everything in the cluster. The other components read and write it through the API server." },
        { type: "mc", prompt: "Which of these runs on a worker node, not the control plane?", options: [
            "kubelet — the agent that runs pods on that node",
            "etcd — the cluster's state store",
            "the API server",
            "the scheduler",
          ], answer: 0, explain: "kubelet, the container runtime, and kube-proxy live on worker nodes. The API server, etcd, the scheduler, and the controller manager make up the control plane." },
        { type: "tf", prompt: "kubectl talks directly to etcd, bypassing the API server.", answer: false, explain: "kubectl always goes through the API server — the cluster's only front door. The API server is what talks to etcd, never kubectl itself." },
        { type: "tf", prompt: "The kubelet is the agent on each node that takes instructions from the control plane and makes sure the right pods are running there.", answer: true, explain: "That's exactly kubelet's job: it watches for pods assigned to its node and keeps them running, reporting status back up to the control plane." },
      ],
    },
    {
      title: "Two-by-Two",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Pod. Keep hearin' that word. That's just Kubernetes' fancy name for a container, right?" },
        { type: "dialogue", speaker: "mentor", text: "No — smaller step than that. A pod's the smallest thing Kubernetes ever deploys. Usually one container inside, sometimes a couple ridin' together." },
        { type: "dialogue", speaker: "mentor", text: "Containers sharin' a pod share one network — one IP address between 'em — and can share storage too. Tight as two hands rowin' the same oar." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "kubectl apply -f web.yaml", output: "pod/web created" },
            { cmd: "kubectl describe pod web", output: "Name:         web\nNamespace:    default\nStatus:       Running\nIP:           10.244.1.7\nContainers:\n  web:\n    Image:  myapp:1.0\n    State:  Running\n    Ready:  True" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "One manifest, kubectl apply, and the pod's up. describe shows you the whole story — where it landed, its own IP, what's runnin' inside." },
        { type: "dialogue", speaker: "carl", text: "And if that pod dies?" },
        { type: "dialogue", speaker: "mentor", text: "Not healed. Replaced. A fresh pod, a fresh IP — the old one's gone for good. That's why nothin' sensible points at a pod's IP direct. More on that up the Pass." },
        { type: "dialogue", speaker: "mentor", text: "Go on — count what's runnin'. Type it yourself this time." },
        { type: "terminal", playerTypes: true, lines: [
            { cmd: "kubectl get pods", output: "NAME   READY   STATUS    RESTARTS   AGE\nweb    1/1     Running   0          45s" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "kubectl get pods — that's your headcount, any time you want it." },
      ],
      questions: [
        { type: "mc", prompt: "What is a pod in Kubernetes?", options: [
            "The smallest deployable unit — not the container itself",
            "Another name for a container",
            "A single worker node",
            "A backup copy of a Deployment",
          ], answer: 0, explain: "Kubernetes never deploys a bare container on its own — it always deploys a pod, which wraps one or more containers as the smallest unit it schedules and manages." },
        { type: "mc", prompt: "Containers inside the same pod share...", options: [
            "one network — a single IP — and can share storage",
            "nothing at all — each gets its own IP and storage, same as separate pods",
            "only the same base image, and nothing else",
            "the same container ID",
          ], answer: 0, explain: "Pod-mates share a network namespace, so they see one IP address and can talk to each other over localhost, and they can share storage volumes defined on the pod." },
        { type: "tf", prompt: "When a pod dies, Kubernetes repairs that exact pod and gives it back its old IP address.", answer: false, explain: "A dead pod isn't healed in place — it's replaced by a brand-new pod with a brand-new IP. That's exactly why relying on a pod's IP directly is fragile." },
        { type: "cmd", prompt: "Type the command to list the pods currently running.", accept: ["kubectl get pods", "kubectl get pod"], explain: "kubectl get pods (kubectl accepts the singular pod too) lists the pods in the current namespace, along with their READY, STATUS, RESTARTS, and AGE." },
        { type: "cmd", prompt: "Type the command to apply the manifest in web.yaml.", accept: ["kubectl apply -f web.yaml"], explain: "kubectl apply -f FILE reads a manifest and creates or updates whatever resources it describes — the standard way to hand Kubernetes a declared desired state." },
        { type: "mc", prompt: "Why does it matter that a pod's IP changes every time it's replaced?", options: [
            "Anything that needs to reach the pod reliably can't just hardcode that IP — it needs a stable way to find it",
            "It doesn't actually matter, since pods never really get new IPs",
            "Because IPs are assigned to pods alphabetically",
            "Because only the very first pod created ever gets a real IP",
          ], answer: 0, explain: "A pod's IP is not something to depend on directly — it changes on every replacement. That instability is exactly the problem a Service is built to solve." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[5];
