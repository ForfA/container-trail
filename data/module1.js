// module1.js — Monolith Gulch: why containers exist at all.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[0] = {
  id: 1,
  town: "Monolith Gulch",
  mentor: { name: "Old Deb", spriteId: "mentor1", intro: "Been tendin' the Monolith forty years." },
  arrival: [
    { type: "vignette", id: "monolith", caption: "The Monolith belches smoke again." },
    { type: "dialogue", speaker: "mentor", text: "Well. Another stranger followin' the smoke. Name's Deb — I've kept this old machine breathin' longer than I care to admit." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "Kernel Canyon folk can show you what a container's actually made of — the guts of the thing, not just the shape of it." },
    { type: "dialogue", speaker: "mentor", text: "Go on, now. Ride west for Kernel Canyon, Carl." },
  ],
  levels: [
    {
      title: "One Machine Town",
      scenes: [
        { type: "dialogue", speaker: "mentor", text: "Forty years I kept the Monolith fed. Mill software, bank ledger, telegraph relay — all of it on one machine, all of it tangled together." },
        { type: "dialogue", speaker: "carl", text: "And when one part chokes..." },
        { type: "dialogue", speaker: "mentor", text: "The whole town goes quiet. One crash, one bad update, one full disk — everything falls together. We treated that machine like a pet: named it, nursed it, prayed over it." },
        { type: "widget", id: "monolith-split" },
        { type: "dialogue", speaker: "mentor", text: "Out west they treat workloads like cattle. Many small ones, each replaceable. One falls sick, you don't sit up all night — you replace it and the herd moves on." },
        { type: "dialogue", speaker: "mentor", text: "A container is how you cut one job loose: the app and everything it needs, packed together, running on its own patch. Isolated. If the bank ledger crashes, the telegraph never hears about it." },
      ],
      questions: [
        { type: "mc", prompt: "Monolith Gulch's core problem is that...", options: [
            "the Monolith's hardware is too slow",
            "every service shares one machine and one fate — a single failure takes them all down",
            "the town has too many services",
            "the Monolith isn't backed up",
          ], answer: 1, explain: "Speed and backups are real concerns, but the design flaw is coupling: everything shares one machine, so any failure is everyone's failure. Isolation is what containers bring." },
        { type: "mc", prompt: "In the 'pets vs cattle' way of speaking, workloads treated as CATTLE are...", options: [
            "lovingly maintained by hand and irreplaceable",
            "always run on dedicated hardware",
            "numerous, uniform, and replaceable — if one fails you replace it",
            "less important workloads",
          ], answer: 2, explain: "Cattle means uniform and replaceable: you don't nurse a sick one back by hand, you replace it. Pets are the hand-fed, irreplaceable servers — like the Monolith." },
        { type: "tf", prompt: "If one container crashes, other containers on the same machine keep running.", answer: true, explain: "That's isolation — each container is its own bounded process environment. A crash inside one doesn't reach into the others. (They do still share the machine's kernel and total resources.)" },
        { type: "mc", prompt: "A container packs together...", options: [
            "an app plus everything it needs to run",
            "a full copy of the operating system and hardware drivers",
            "only the app's source code",
            "the physical server itself",
          ], answer: 0, explain: "A container bundles the app with its dependencies — libraries, runtime, filesystem — so it runs the same anywhere. It does NOT carry its own OS kernel or hardware; that's a virtual machine's territory." },
      ],
    },
    {
      title: "Machines Inside Machines",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Traveler told me virtual machines solve this too — why containers?" },
        { type: "dialogue", speaker: "mentor", text: "Different tool, different fence. Let me show you both barns, built floor by floor." },
        { type: "diagram", id: "vm-vs-container", steps: [
            { caption: "Start at the bottom: physical hardware. Every workload, VM or container, ends up running on real machines somewhere." },
            { caption: "Above that, the host operating system — the one layer both approaches sit on top of." },
            { caption: "Now the fork: a hypervisor carves up hardware for VMs to share, while a container runtime just manages containers directly — no hardware to divide up." },
            { caption: "The payoff: each VM boots a full guest operating system before its app even starts. Each container skips that — it's just the app, sharing the host's kernel." },
          ] },
        { type: "dialogue", speaker: "mentor", text: "A VM hauls a whole guest OS onto the wagon — gigabytes, minutes to boot. A container shares the host's kernel instead: megabytes, running in a second or less." },
        { type: "dialogue", speaker: "mentor", text: "Mind you, a hypervisor's fence is hardware-thick — about as strong as isolation gets. A container's fence is thinner, kernel-level. You trade some of that wall for speed and a bigger herd per range." },
      ],
      questions: [
        { type: "mc", prompt: "A virtual machine achieves isolation by...", options: [
            "virtualizing hardware and running a full guest operating system per VM on a hypervisor",
            "sharing the host's kernel with every other VM",
            "compressing the app's source code",
            "running as a single lightweight process",
          ], answer: 0, explain: "A hypervisor carves up physical hardware into virtual hardware, and each VM boots its own complete guest OS on top of that — a much heavier, hardware-level boundary than a container's." },
        { type: "tf", prompt: "Like a VM, a container includes its own full guest operating system.", answer: false, explain: "A container has no guest OS. It shares the host machine's kernel directly and isolates at the process level — that's what makes it so much lighter than a VM." },
        { type: "mc", prompt: "Compared to VMs, containers are typically...", options: [
            "far lighter — megabytes instead of gigabytes, starting in seconds or less instead of minutes",
            "the same size, just packaged differently",
            "heavier, since they need a container runtime installed",
            "identical in boot time, since both use a hypervisor",
          ], answer: 0, explain: "Skipping the guest OS is the whole savings: containers are typically megabytes and start in a second or less, versus a VM's gigabytes and minutes-long boot." },
        { type: "tf", prompt: "Both VMs and containers provide isolation, but a VM's boundary is stronger (hardware-level) while a container trades some of that strength for density and speed.", answer: true, explain: "A hypervisor's hardware-level wall is harder to breach than a container's kernel-level, process-based wall. Containers accept a thinner fence in exchange for being lighter and faster to run." },
        { type: "mc", prompt: "The layer that lets one physical machine run several VMs, each with its own guest OS, is the...", options: [
            "hypervisor",
            "container runtime",
            "filesystem layer",
            "load balancer",
          ], answer: 0, explain: "The hypervisor is what divides physical hardware into virtual hardware for each VM. A container runtime does a related job for containers, but without virtualizing hardware." },
      ],
    },
    {
      title: "The Shape of a Shipment",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "So what exactly IS an image? Sounds like the container's blueprint." },
        { type: "dialogue", speaker: "mentor", text: "An image's a shipping crate, packed and sealed — the app, its dependencies, the filesystem it expects. Nothing running yet, just sitting on the shelf." },
        { type: "dialogue", speaker: "carl", text: "And when it runs?" },
        { type: "dialogue", speaker: "mentor", text: "Then you've got a container: that same crate, opened and put to work. Watch how the crate gets built." },
        { type: "diagram", id: "image-layers", steps: [
            { caption: "Every image starts from a base — here, a slim Alpine Linux. Read-only, frozen in place." },
            { caption: "Add a layer: install dependencies. Still read-only — this layer never changes once it's built." },
            { caption: "Add another layer: copy in the app itself. The image is now a stack of read-only layers — the template." },
            { caption: "Run it, and you get a container: that same stack, plus one new writable layer on top just for this running instance." },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Build that crate once, and any runtime that speaks the format can run it — this machine, that machine, don't matter. Built once, runs anywhere the runtime's installed." },
        { type: "dialogue", speaker: "carl", text: "So the image never changes, no matter how many containers you spin up off it?" },
        { type: "dialogue", speaker: "mentor", text: "Never. The image stays sealed, read-only. Open ten crates off the same shelf if you like — one image, as many containers as you need, all running at once." },
      ],
      questions: [
        { type: "mc", prompt: "An image is best described as...", options: [
            "a read-only template containing an app, its dependencies, and the filesystem it needs",
            "a running process on the host machine",
            "a snapshot of a virtual machine",
            "a network configuration file",
          ], answer: 0, explain: "An image is the packed, read-only template — app, dependencies, filesystem — used to create containers. It isn't running anything by itself." },
        { type: "mc", prompt: "A container is...", options: [
            "a running instance created from an image",
            "a saved copy of the image file on disk",
            "a type of virtual machine",
            "the same thing as an image, just renamed",
          ], answer: 0, explain: "A container is what you get when you run an image: a live, working instance of that read-only template." },
        { type: "tf", prompt: "A single image can only ever run as one container at a time.", answer: false, explain: "One image can be the source for many containers running at once — each gets its own container instance, but they can all start from the same image." },
        { type: "mc", prompt: "Because images are built once in a standard format, they...", options: [
            "can run anywhere a compatible container runtime is installed",
            "only run on the machine that built them",
            "require a hypervisor to run",
            "must be rebuilt separately for every container",
          ], answer: 0, explain: "That's the portability payoff: build the image once, and it runs the same way on any machine with a compatible container runtime installed." },
        { type: "tf", prompt: "An image is read-only, so running it as a container doesn't change the original image.", answer: true, explain: "The image stays frozen and read-only. Any changes a running container makes happen in that container's own layer, not the shared image underneath." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[0];
