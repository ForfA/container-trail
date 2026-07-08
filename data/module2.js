// module2.js — Kernel Canyon: namespaces, cgroups, union filesystems.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[1] = {
  id: 2,
  town: "Kernel Canyon",
  mentor: { name: "Hermit Nils", spriteId: "mentor2", intro: "Moved into this canyon to be closer to the kernel." },
  arrival: [
    { type: "vignette", id: "town-canyon", caption: "Kernel Canyon. Steep rock on both sides, dwellers keeping to narrow paths." },
    { type: "dialogue", speaker: "mentor", text: "Name's Nils. Moved into this canyon to be closer to the kernel." },
    { type: "dialogue", speaker: "mentor", text: "These walls don't move anything. They just decide what each dweller can see." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "Now you know a container is no magic box." },
    { type: "dialogue", speaker: "mentor", text: "Ride to Docker Flats, Carl. Tess will teach you to herd them without carving namespaces by hand." },
  ],
  levels: [
    {
      title: "Walls You Can't See",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Everyone here keeps to their own patch. How's a container know where its patch ends?" },
        { type: "dialogue", speaker: "mentor", text: "Namespaces. Six kinds. Each one hides part of the machine from a process. Namespaces decide what a process can SEE. Raise the walls yourself. Watch the view shrink." },
        { type: "widget", id: "namespace-walls" },
        { type: "dialogue", speaker: "mentor", text: "Three more you didn't touch. UTS hides the hostname. IPC hides shared memory and message queues. USER hides user and group IDs." },
        { type: "dialogue", speaker: "carl", text: "So a fresh container starts with all six walls already up?" },
        { type: "dialogue", speaker: "mentor", text: "Every time. New PID tree, new network stack, new mounts. Nothing borrowed from the last one." },
      ],
      questions: [
        { type: "mc", prompt: "Namespaces on Linux control...", options: [
            "what a process can SEE — its own process list, network, filesystem view, and more",
            "how much CPU and memory a process can use",
            "how fast a process's code executes",
            "which disk a process's files are stored on",
          ], answer: 0, explain: "Namespaces are about visibility: each type hides part of the host from a process so it only sees its own slice — its own processes, network, mounts, and so on." },
        { type: "mc", prompt: "The PID namespace gives a process...", options: [
            "its own process list, where it sees itself as PID 1",
            "its own CPU core, reserved for it alone",
            "its own copy of the Linux kernel",
            "faster process scheduling than the host",
          ], answer: 0, explain: "Inside its own PID namespace, a process can't see the host's other processes at all — and the first process it starts gets numbered PID 1, same as a machine's very first process." },
        { type: "mc", prompt: "The NET namespace gives a process...", options: [
            "its own network interfaces, IP addresses, and ports",
            "a guaranteed amount of network bandwidth",
            "a faster route to the internet",
            "its own DNS server software",
          ], answer: 0, explain: "NET namespace isolation means the process gets its own eth0, its own IP, its own port range — separate from whatever the host or other containers are using." },
        { type: "tf", prompt: "A new container is given a fresh set of namespaces when it starts — it doesn't inherit the previous container's view.", answer: true, explain: "Every container starts with brand-new namespaces: a new PID tree, new network stack, new mounts. None of that carries over from anything that ran before it." },
        { type: "mc", prompt: "Besides PID, NET, and MNT, which other three namespace types exist on Linux?", options: [
            "UTS (hostname), IPC (interprocess communication), and USER (user/group IDs)",
            "CPU, MEMORY, and DISK",
            "SWAP, CACHE, and BUFFER",
            "ROOT, ADMIN, and GUEST",
          ], answer: 0, explain: "The full set of six is PID, NET, MNT, UTS, IPC, and USER. UTS hides the hostname, IPC hides shared memory/message queues, and USER remaps user and group IDs." },
      ],
    },
    {
      title: "Rations and Fences",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Namespaces hide things from a process. What stops it from eating the whole machine?" },
        { type: "dialogue", speaker: "mentor", text: "Different fence. Namespaces decide what you SEE. Cgroups decide what you USE — CPU, memory, disk I/O. Control groups. Cgroups for short. Watch what happens when one goes over its ration." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker run -d --memory 256m --cpus 1 --name hog memhog", output: "f138fb9081fdfdbf9ae98cb2f5e4aa0daa15c701b991cba1a0dfcf72fde4ae4e" },
            { cmd: "docker ps", output: "CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS     NAMES\nf138fb9081fd   memhog    \"memhog\"                 2 seconds ago   Up 2 seconds             hog" },
            { cmd: "docker ps -a", output: "CONTAINER ID   IMAGE     COMMAND                  CREATED          STATUS                      PORTS     NAMES\nf138fb9081fd   memhog    \"memhog\"                 38 seconds ago   Exited (137) 2 seconds ago             hog" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Fed it a memory hog on purpose. 256 megabytes, and it went over. 137. That's 128 plus signal 9 — SIGKILL. The kernel's OOM killer shot it down." },
        { type: "dialogue", speaker: "carl", text: "And if it'd gone over on CPU instead of memory?" },
        { type: "dialogue", speaker: "mentor", text: "Different punishment. Memory's a hard wall — go over, you're dead. CPU just throttles you. Slows you down. Doesn't kill you for being greedy with CPU." },
      ],
      questions: [
        { type: "mc", prompt: "Cgroups limit and account for...", options: [
            "how much CPU, memory, and disk I/O a process can use",
            "what files and processes a process can see",
            "which network a process belongs to",
            "how many namespaces a process is given",
          ], answer: 0, explain: "Cgroups (control groups) are the kernel's usage meter and fence: they cap and track how much CPU, memory, and I/O a process or group of processes can consume." },
        { type: "mc", prompt: "The key contrast between namespaces and cgroups is that...", options: [
            "namespaces control what a process can SEE, cgroups control how much it can USE",
            "namespaces are for networking only, cgroups are for storage only",
            "namespaces are a Docker feature, cgroups are a Kubernetes feature",
            "they do the same job, just with different names",
          ], answer: 0, explain: "See vs. use is the whole split: namespaces wall off a process's view of the system, while cgroups cap the resources — CPU, memory, I/O — it's allowed to consume." },
        { type: "mc", prompt: "When a container exceeds its memory cgroup limit, the kernel...", options: [
            "kills the process (OOM kill)",
            "slows the process down but lets it keep running",
            "pauses the process until memory frees up",
            "silently raises the memory limit",
          ], answer: 0, explain: "Memory is a hard limit. Go over it and the kernel's out-of-memory killer ends the process — there's no gradual throttling for memory the way there is for CPU." },
        { type: "tf", prompt: "Exceeding a CPU cgroup limit gets a process killed, the same way exceeding a memory limit does.", answer: false, explain: "CPU works differently from memory: going over a CPU limit just throttles the process — it's scheduled less — rather than killing it." },
        { type: "mc", prompt: "Exit code 137 on a killed container means...", options: [
            "128 + 9 — the process was killed by SIGKILL, as happens with an OOM kill",
            "the container ran for 137 seconds before finishing",
            "137 megabytes of memory were used",
            "the image failed to build",
          ], answer: 0, explain: "Linux exit codes for a killed process are 128 plus the signal number. Signal 9 is SIGKILL, so 128 + 9 = 137 — exactly what the OOM killer sends." },
      ],
    },
    {
      title: "Stacked Canyon Floors",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "So how's an image actually built? It's not just one big file, is it?" },
        { type: "dialogue", speaker: "mentor", text: "Floors, stacked. A union filesystem merges them into one view. Watch it go up." },
        { type: "diagram", id: "image-layers", steps: [
            { caption: "Bottom floor: the base image. Read-only. Everything else stacks on top of it without ever touching it directly." },
            { caption: "Next floor: dependencies. Also read-only, frozen the moment it's built. The union filesystem merges every floor into one seamless view." },
            { caption: "Top floor of the image: the app itself. Still read-only — that's the whole image now, stacked and merged, none of it ever changing." },
            { caption: "Run it, and the container gets one more floor: a thin writable layer, all its own. Every write lands here. The read-only floors never feel it." },
          ] },
        { type: "dialogue", speaker: "carl", text: "What if the app tries to change a file that's down in one of the read-only floors?" },
        { type: "dialogue", speaker: "mentor", text: "Can't touch it there. The filesystem copies that file up into the writable layer first. Then the edit lands. Copy-on-write." },
        { type: "dialogue", speaker: "mentor", text: "Two images sharing the same base don't store that base twice. One copy on disk, shared by both. That's why stacking layers is worth it." },
        { type: "dialogue", speaker: "mentor", text: "And that writable layer — it's the container's, not the image's. Kill the container, that layer's gone. The image never even noticed." },
      ],
      questions: [
        { type: "mc", prompt: "The layers that make up an image are...", options: [
            "read-only, stacked by a union filesystem into one merged view",
            "writable, and change every time the container runs",
            "stored as one single unsplit file",
            "rebuilt from scratch every time a container starts",
          ], answer: 0, explain: "An image is a stack of read-only layers, and a union (overlay) filesystem merges them into what looks like a single, seamless filesystem to the running container." },
        { type: "mc", prompt: "When you run an image as a container, what gets added?", options: [
            "one thin writable layer on top of the image's read-only layers",
            "a whole new copy of every image layer",
            "nothing — the image itself becomes writable",
            "a second container runtime",
          ], answer: 0, explain: "Running an image adds exactly one new layer on top: a thin, writable layer just for that container instance. The image's own layers stay untouched underneath." },
        { type: "mc", prompt: "If a running container writes to a file that lives in a lower, read-only layer, what happens?", options: [
            "the file is copied up into the writable layer first, then the write lands there — copy-on-write",
            "the write fails and the process crashes",
            "the read-only layer is silently modified",
            "the whole image is rebuilt",
          ], answer: 0, explain: "That's copy-on-write: the union filesystem can't modify a read-only layer, so it copies the file up into the container's writable layer first, and the edit happens there." },
        { type: "mc", prompt: "If two different images are built on the same base layer, that base layer is...", options: [
            "stored once on disk and shared by both images",
            "duplicated, one full copy per image",
            "merged into a single combined image",
            "deleted after the second image is built",
          ], answer: 0, explain: "Layers are content-addressed and shared: any image that includes an identical layer reuses the one copy already on disk instead of storing it again." },
        { type: "tf", prompt: "A container's writable layer sticks around on disk even after the container that made it is removed.", answer: false, explain: "The writable layer belongs to the container, not the image. Remove the container and that layer is gone with it — the read-only image underneath is unaffected either way." },
      ],
    },
    {
      title: "It Was Processes All Along",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "You've shown me walls, fences, and floors. What's actually underneath all three?" },
        { type: "dialogue", speaker: "mentor", text: "A process. Just a process. Web's back up — alpine build this time, so we've got tools to look inside." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "ps aux | grep nginx", output: "root      4821  0.0  0.2  11024  5632 ?        Ss   09:14   0:00 nginx: master process nginx -g daemon off;\nnginx     4883  0.0  0.1  11384  3244 ?        S    09:14   0:00 nginx: worker process\ncarl      5299  0.0  0.0   9032   736 pts/0    S+   09:15   0:00 grep --color=auto nginx" },
            { cmd: "docker exec web ps aux", output: "PID   USER     TIME  COMMAND\n    1 root      0:00 nginx: master process nginx -g daemon off;\n    8 nginx     0:00 nginx: worker process\n    9 root      0:00 ps aux" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Host sees it as an ordinary process, PID 4821, same as anything else running on this machine. Because it is one. No hypervisor. No guest OS anywhere in this picture." },
        { type: "dialogue", speaker: "mentor", text: "Inside its own PID namespace, that same process believes it's PID 1. Two views, one process. The host can see in. The container can't see out." },
        { type: "dialogue", speaker: "carl", text: "That's why they start so fast, isn't it? Nothing to boot." },
        { type: "dialogue", speaker: "mentor", text: "Nothing to boot. No guest OS to load. Just a process starting up, quick as any other on this machine." },
      ],
      questions: [
        { type: "mc", prompt: "Underneath everything you've learned, a container really is...", options: [
            "a normal Linux process, wrapped in namespaces, cgroups, and an overlay filesystem",
            "a lightweight virtual machine with its own kernel",
            "a special kind of file stored on disk",
            "a script the host runs on a schedule",
          ], answer: 0, explain: "Strip away the vocabulary and a container is an ordinary process: the namespaces control what it sees, the cgroups control what it can use, and the overlay filesystem gives it a filesystem view. No new kind of thing." },
        { type: "mc", prompt: "Running a container requires...", options: [
            "no hypervisor and no guest operating system",
            "a hypervisor, same as a virtual machine",
            "a dedicated guest OS installed just for that container",
            "a second physical machine",
          ], answer: 0, explain: "That's the whole point of the process-not-VM design: no hypervisor carving up hardware, no guest OS booting up. The container shares the host's kernel directly." },
        { type: "mc", prompt: "From the host's point of view, a containerized process is...", options: [
            "visible as an ordinary process, while the container itself can't see the host's other processes",
            "completely invisible until the container is stopped",
            "visible only through the Docker daemon's logs",
            "running on a separate kernel from the host",
          ], answer: 0, explain: "Visibility only runs one direction: the host sees every containerized process as a normal entry in its own process list, but the PID namespace keeps the container from seeing the host's processes." },
        { type: "tf", prompt: "Because there's no guest OS to boot, a container typically starts about as fast as any other process on the host.", answer: true, explain: "Starting a container means starting a process with some namespaces and cgroup limits attached — no boot sequence, no guest kernel loading. That's why it takes about as long as launching any other process." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[1];
