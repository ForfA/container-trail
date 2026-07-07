// module5.js — Bridge Crossing: port publishing, container networking/DNS, volumes, Compose.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[4] = {
  id: 5,
  town: "Bridge Crossing",
  mentor: { name: "Bridgekeeper Mo", spriteId: "mentor5", intro: "Charges one honest question, same toll every crossing." },
  arrival: [
    { type: "vignette", id: "town", caption: "Bridge Crossing. A toll bridge arcs out over the ravine, the far bank lost in haze." },
    { type: "dialogue", speaker: "mentor", text: "Mo. I keep this bridge. Toll's one honest question — ask it, and I'll ask you one back before you cross." },
    { type: "dialogue", speaker: "carl", text: "Fair enough. Here's mine: why's a bridge even needed? Silas already built the crate." },
    { type: "dialogue", speaker: "mentor", text: "Built ain't reachable. That's my question back to you — what good's a crate nobody outside can get to?" },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "You can open a gate, name a neighbor, keep what matters, and raise a whole camp at once now." },
    { type: "dialogue", speaker: "mentor", text: "Wagons that carry everything themselves don't scale. Helmsburg's fleet-mistress steers hundreds. Cross on." },
  ],
  levels: [
    {
      title: "The Toll Bridge",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "So a container's just... sealed off? Can't reach it at all?" },
        { type: "dialogue", speaker: "mentor", text: "By default, no. Recall Kernel Canyon — every container gets its own network namespace, its own patch the host can't just wander into. Ports stay closed to the outside 'til you say otherwise." },
        { type: "widget", id: "port-bridge" },
        { type: "dialogue", speaker: "mentor", text: "-p 8080:80 — host port on the left, container port on the right. They needn't match. Anything not published stays behind the gate." },
        { type: "dialogue", speaker: "carl", text: "So the bridge is the -p flag." },
        { type: "dialogue", speaker: "mentor", text: "Bridge is the right word for it. Only what's published is reachable from outside this camp." },
      ],
      questions: [
        { type: "mc", prompt: "By default, why can't the host reach a port a container's app is listening on?", options: [
            "The container has its own network namespace — its ports aren't exposed to the host unless published",
            "Containers don't have network access at all unless configured",
            "The container's firewall blocks all traffic automatically",
            "Docker disables networking until docker start is run a second time",
          ], answer: 0, explain: "That's the network namespace at work — same idea from Kernel Canyon. A container gets its own network stack, invisible to the host, until you explicitly publish a port to bridge the two." },
        { type: "mc", prompt: "What does -p 8080:80 do when starting a container?", options: [
            "Publishes host port 8080, forwarding it to port 80 inside the container",
            "Publishes container port 8080, forwarding it to host port 80",
            "Limits the container to using only ports 80 and 8080",
            "Renames the container's internal port to 8080",
          ], answer: 0, explain: "-p HOST:CONTAINER always reads left-to-right: the host port comes first. -p 8080:80 means traffic hitting the host on 8080 gets forwarded to port 80 inside the container." },
        { type: "tf", prompt: "The host port and the container port in a -p mapping always have to be the same number.", answer: false, explain: "They can differ freely — -p 8080:80 maps host port 8080 to container port 80. The only requirement is that the host port you pick isn't already in use." },
        { type: "tf", prompt: "Only ports you've explicitly published are reachable from outside the container.", answer: true, explain: "Publishing is what opens the gate. Any port the app listens on inside the container that you haven't published with -p stays unreachable from the host or the outside network." },
        { type: "mc", prompt: "In -p HOST:CONTAINER, which side is the port a person outside the container actually connects to?", options: [
            "HOST — that's the port opened up for the outside world",
            "CONTAINER — outsiders connect directly to the container's internal port",
            "Both sides are opened identically to the outside",
            "Neither — external users need a separate flag entirely",
          ], answer: 0, explain: "The HOST side is what's exposed on the machine running Docker. Outside traffic connects to HOST, and Docker forwards it in to CONTAINER — the container's own internal port never gets exposed directly." },
      ],
    },
    {
      title: "Wagon Trains Talk",
      scenes: [
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker network create trail", output: "b4b7c1e8a2f93d5e6c0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2" },
            { cmd: "docker run -d --network trail --name db postgres", output: "d3e9f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0" },
            { cmd: "docker run -d --network trail --name app myapp", output: "f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2" },
            { cmd: "docker exec app ping db", output: "PING db (172.18.0.2): 56 data bytes\n64 bytes from 172.18.0.2: seq=0 ttl=64 time=0.089 ms\n64 bytes from 172.18.0.2: seq=1 ttl=64 time=0.061 ms\n64 bytes from 172.18.0.2: seq=2 ttl=64 time=0.058 ms" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Named the network trail, gave both wagons a seat on it. Watch — app asked for db by NAME and the bridge found it. That's Docker's built-in DNS, but only on a network you named yourself." },
        { type: "dialogue", speaker: "carl", text: "Only a named one? What about a network I didn't create?" },
        { type: "dialogue", speaker: "mentor", text: "The default bridge — the one you land on if you don't say otherwise — doesn't hand out names like that. Containers there find each other by IP only. Make your own network, and naming comes free." },
        { type: "dialogue", speaker: "mentor", text: "And notice — I never published a single port to get that ping through. Same-network traffic don't need a gate, only traffic crossing OUT to the host or beyond does." },
      ],
      questions: [
        { type: "mc", prompt: "On a user-defined network like trail, how does one container reach another by name?", options: [
            "Docker's built-in DNS resolves container names to their IP addresses automatically",
            "You have to manually edit each container's /etc/hosts file",
            "Container names aren't resolvable — you must always use IP addresses",
            "A separate DNS server container must be started and configured by hand",
          ], answer: 0, explain: "User-defined networks come with built-in DNS: Docker resolves each container's name to its current IP automatically, no manual configuration needed." },
        { type: "tf", prompt: "The default bridge network gives containers the same automatic name-based DNS that a user-defined network does.", answer: false, explain: "That convenience is specific to user-defined networks. The default bridge network doesn't provide name-based DNS between containers — that's one of the main reasons to create your own network instead of relying on the default." },
        { type: "mc", prompt: "Two containers sharing a user-defined network want to talk to each other. Do they need published ports (-p) to do it?", options: [
            "No — published ports are only needed for traffic coming from outside the network; containers on the same network reach each other directly",
            "Yes — every container-to-container connection needs its own -p mapping",
            "Only the first container in the network needs a published port",
            "It depends on which base image each container uses",
          ], answer: 0, explain: "Publishing exists to let traffic in from outside the container's network. Containers already sharing a network can reach each other's ports directly, with no -p involved at all." },
        { type: "cmd", prompt: "Type the command to create a new Docker network named trail.", accept: ["docker network create trail"], explain: "docker network create NAME sets up a new user-defined network — attach containers to it with --network NAME to get built-in DNS between them." },
        { type: "tf", prompt: "In this demo, docker exec app ping db worked because Docker translated the name db into that container's current IP address on the trail network.", answer: true, explain: "That's exactly what the built-in DNS on a user-defined network does — it looked up db by name and resolved it to the right container's IP before the ping went out." },
      ],
    },
    {
      title: "The Storehouse",
      scenes: [
        { type: "dialogue", speaker: "mentor", text: "Recall Kernel Canyon — a container's writable layer, it dies right along with the container. Remove the container, that data's gone, full stop." },
        { type: "dialogue", speaker: "carl", text: "Then how's anybody supposed to keep a database running in one of these?" },
        { type: "dialogue", speaker: "mentor", text: "Storehouse outside the wagon. A volume." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker run -d --name db -v data:/var/lib/db postgres", output: "a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8" },
            { cmd: "docker exec db sh -c 'echo hello > /var/lib/db/note.txt; cat /var/lib/db/note.txt'", output: "hello" },
            { cmd: "docker rm -f db", output: "db" },
            { cmd: "docker run -d --name db -v data:/var/lib/db postgres", output: "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2" },
            { cmd: "docker exec db cat /var/lib/db/note.txt", output: "hello" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Gone, that wagon. Rebuilt it fresh off the same image — but the note's still there. Data lived in the volume, not the container, so removing the container never touched it." },
        { type: "dialogue", speaker: "mentor", text: "Volume's Docker's own storehouse — it manages where that data actually sits, you don't need to know or care." },
        { type: "dialogue", speaker: "mentor", text: "Bind mount's different: you point straight at a folder on the host machine. Good for watching source code change live while you work." },
        { type: "dialogue", speaker: "mentor", text: "-v data:/var/lib/db — storehouse name on the left, where it shows up inside the wagon on the right." },
        { type: "dialogue", speaker: "mentor", text: "Named volume for a database's real data. Bind mount when you want the host's own source folder along for the ride, mid-development." },
      ],
      questions: [
        { type: "mc", prompt: "What happens to data written into a container's writable layer once the container is removed?", options: [
            "It's lost — the writable layer belongs to that container and is deleted with it",
            "It's automatically copied back into the image",
            "It's kept in the image's read-only layers",
            "It moves to whatever container is created next",
          ], answer: 0, explain: "The writable layer is the container's own, on top of the image's read-only layers. Remove the container and that layer — and anything written only there — is gone." },
        { type: "mc", prompt: "What is a named volume?", options: [
            "Storage managed by Docker itself, which outlives any single container that uses it",
            "A folder inside the image's read-only layers",
            "A temporary cache that's cleared every time a container restarts",
            "A second container used only for backups",
          ], answer: 0, explain: "A named volume is Docker-managed storage, separate from any container's writable layer. Containers can be removed and recreated, but the volume — and the data inside it — stays put." },
        { type: "mc", prompt: "What is a bind mount?", options: [
            "A mapping of a specific directory on the HOST machine into the container — handy for live-editing source code during development",
            "A permanent copy of the container's filesystem saved to disk",
            "A way to connect two containers' networks together",
            "The default storage every container uses automatically",
          ], answer: 0, explain: "A bind mount points directly at a path on the host — edits on the host show up instantly inside the container, which is exactly why it's popular for local development with live source code." },
        { type: "mc", prompt: "For a database's real application data versus a developer's live source code during local development, which storage fits which?", options: [
            "Named volume for the database's data; bind mount for the live source code",
            "Bind mount for the database's data; named volume for the live source code",
            "Named volumes for both — bind mounts are obsolete",
            "Bind mounts for both — named volumes only work with databases",
          ], answer: 0, explain: "A named volume is the right fit for data that should persist and be managed by Docker, like a database's files. A bind mount is the right fit when you want host-side edits — like live source code — to reflect inside the container immediately." },
        { type: "tf", prompt: "In -v data:/var/lib/db, the part before the colon is the path inside the container.", answer: false, explain: "It's the reverse: before the colon is the volume name (or host path, for a bind mount), and after the colon is where it gets mounted inside the container." },
      ],
    },
    {
      title: "The Wagon Manifest",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Running each wagon by hand, one at a time — there's got to be a faster way for a whole camp." },
        { type: "dialogue", speaker: "mentor", text: "Manifest it. One file lists every wagon, how they connect, what they carry. Compose reads it, raises the whole camp at once." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "cat compose.yaml", output: "services:\n  web:\n    build: .\n    ports:\n      - \"8080:80\"\n    depends_on:\n      - db\n  db:\n    image: postgres:16\n    volumes:\n      - data:/var/lib/postgresql/data\nvolumes:\n  data:" },
            { cmd: "docker compose up", output: "[+] Running 3/3\n ✔ Network bridgecrossing_default   Created\n ✔ Container bridgecrossing-db-1    Created\n ✔ Container bridgecrossing-web-1   Created\nAttaching to db-1, web-1\ndb-1   | 2026-07-07 09:40:01 UTC [1] LOG:  database system is ready to accept connections\nweb-1  | Server listening on port 80" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "One manifest, one command. Every teammate who runs it gets the identical camp — same services, same network, same storehouse." },
        { type: "dialogue", speaker: "mentor", text: "And notice — web and db never got a -p between them, never needed a docker network create either." },
        { type: "dialogue", speaker: "mentor", text: "Compose hands every service its own seat on one shared network — they find each other by service name, same as my built-in bridge." },
      ],
      questions: [
        { type: "mc", prompt: "What does a Compose file (compose.yaml) do?", options: [
            "Declares a multi-container application — its services, networks, and volumes — in one YAML file",
            "Builds a single Dockerfile faster than docker build",
            "Replaces the need for images entirely",
            "Only works for exactly two containers at a time",
          ], answer: 0, explain: "Compose lets you describe a whole multi-container application declaratively: which services to run, how they're built, what they connect to, and what storage they use, all in one file." },
        { type: "cmd", prompt: "Type the command to start everything defined in a compose.yaml file.", accept: ["docker compose up"], explain: "docker compose up reads the compose file in the current directory and creates and starts every service, network, and volume it defines." },
        { type: "mc", prompt: "In a Compose file with services named web and db, how does web reach db?", options: [
            "By service name — Compose puts every service on a shared network with built-in DNS, same as a user-defined Docker network",
            "It can't — Compose services are isolated from each other by default",
            "Only through a manually published port",
            "By hardcoding db's IP address in web's configuration",
          ], answer: 0, explain: "Compose automatically creates a network for the app and attaches every service to it, so web can reach db simply by using db as a hostname — the same built-in DNS behavior as a user-defined Docker network." },
        { type: "tf", prompt: "Because it's defined in one file, a Compose-based app is easy for teammates to reproduce identically on their own machines.", answer: true, explain: "That's the core benefit of a declarative Compose file: check it into version control, and anyone runs docker compose up to get the same services, network, and volumes you defined — no manual setup to repeat by hand." },
        { type: "tf", prompt: "A published port in a Compose file (like \"8080:80\") is still needed for one Compose service to reach another Compose service on the same shared network.", answer: false, explain: "Publishing is only about letting traffic in from outside the Compose app. Services already on the shared network Compose creates reach each other directly through built-in DNS, with no published port required between them." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[4];
