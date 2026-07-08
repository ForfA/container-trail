// module3.js — Docker Flats: Docker CLI basics.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[2] = {
  id: 3,
  town: "Docker Flats",
  mentor: { name: "Ranger Tess", spriteId: "mentor3", intro: "Herds the containers. Keeps count. Ropes the stragglers." },
  arrival: [
    { type: "vignette", id: "town-flats", caption: "Docker Flats. Corrals of crates, dust, and a herd that needs minding." },
    { type: "vignette", id: "crate", caption: "Every crate here is a container, waiting on somebody to run it." },
    { type: "dialogue", speaker: "mentor", text: "Name's Tess. Nils showed you what a container is. I'll show you how to work one without getting kicked." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "You can run 'em, watch 'em, talk to 'em, and clean up after 'em now. That's the herd handled." },
    { type: "dialogue", speaker: "mentor", text: "Only thing left is where the herd comes from. Ride on to Buildtown, Carl — they'll show you where images get built." },
  ],
  levels: [
    {
      title: "Meet the Herd",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Nils showed me what a container's made of. How do I actually start one?" },
        { type: "dialogue", speaker: "mentor", text: "One command. `docker run IMAGE` creates a container from that image AND starts it. One move, not two." },
        { type: "dialogue", speaker: "mentor", text: "Image's not on this machine yet? Docker pulls it down from a registry first, then runs it. Every time, automatic." },
        { type: "dialogue", speaker: "mentor", text: "Add `-d` and it runs detached — background, hands your prompt right back. Add `--name` and you've got a handle for it, 'stead of some long ID. Bring up nginx. Detached. Call it web. Type it." },
        { type: "terminal", playerTypes: true, lines: [
            { cmd: "docker run -d --name web nginx", output: "Unable to find image 'nginx:latest' locally\nlatest: Pulling from library/nginx\nbcb2a686d1fc: Pull complete\n2e629e3a5e09: Pull complete\n8c2e081ebc86: Pull complete\nDigest: sha256:3417b2dba0d9f1cb9dda3241d28a5d7d5a81580758a3ecd38661258f35648ef4\nStatus: Downloaded newer image for nginx:latest\n178c172ce181223fb4ef9999859454cefc12a7dc54a3584b8c6da288479c9de4" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Pulled it, then ran it. Didn't have to ask twice." },
      ],
      questions: [
        { type: "cmd", prompt: "Type the command to create and start a container from the nginx image.", accept: ["docker run nginx"], explain: "docker run IMAGE does both jobs at once: it creates a new container from the image and starts it running, no separate create step needed." },
        { type: "mc", prompt: "If the image named in `docker run` isn't on your machine yet, Docker...", options: [
            "pulls it from a registry first, then runs it",
            "fails immediately with an error",
            "builds it from source automatically",
            "waits for you to download it manually first",
          ], answer: 0, explain: "docker run checks locally first. If the image is missing, it fetches it from a registry (Docker Hub by default) before starting the container — all in one command." },
        { type: "mc", prompt: "The `-d` flag on `docker run` means...", options: [
            "run detached, in the background",
            "delete the container when it stops",
            "download the image only, don't run it",
            "run in debug mode",
          ], answer: 0, explain: "-d (detached) starts the container in the background and immediately gives you your terminal prompt back, instead of attaching your terminal to the container's output." },
        { type: "mc", prompt: "The `--name` flag on `docker run` is for...", options: [
            "giving the container a name you can use in later commands instead of its ID",
            "naming the image being pulled",
            "renaming the host machine",
            "setting the container's hostname on the internet",
          ], answer: 0, explain: "Without --name, Docker assigns a random name and you'd need the container ID for later commands. --name gives you a memorable handle to use instead." },
        { type: "tf", prompt: "`docker run` only starts an existing container — it never creates a new one.", answer: false, explain: "The opposite is true: docker run creates a brand-new container from the image and starts it. Starting only an existing container is what docker start does." },
      ],
    },
    {
      title: "Counting Cattle",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "How do I know what's actually running out there?" },
        { type: "dialogue", speaker: "mentor", text: "Count the herd. `docker ps` — running containers only." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker ps", output: "CONTAINER ID   IMAGE     COMMAND                  CREATED         STATUS         PORTS     NAMES\n178c172ce181   nginx     \"/docker-entrypoint.…\"   6 minutes ago   Up 6 minutes             web" },
            { cmd: "docker ps -a", output: "CONTAINER ID   IMAGE      COMMAND                  CREATED         STATUS                      PORTS     NAMES\n178c172ce181   nginx      \"/docker-entrypoint.…\"   6 minutes ago   Up 6 minutes                          web\n39595c4a96e6   postgres   \"docker-entrypoint.s…\"   2 hours ago     Exited (0) 90 minutes ago             db" },
            { cmd: "docker logs web", output: "/docker-entrypoint.sh: Configuration complete; ready for start up\n2026/07/07 09:14:02 [notice] 1#1: nginx/1.27.0\n2026/07/07 09:14:02 [notice] 1#1: start worker processes\n172.17.0.1 - - [07/Jul/2026:09:15:03 +0000] \"GET / HTTP/1.1\" 200 615 \"-\" \"curl/8.4.0\"" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "See db there in the second list? Ran once, finished clean, exit code 0. Add `-a` and stopped ones show up too, not just running." },
        { type: "dialogue", speaker: "carl", text: "So a container's always either running or stopped, that's it?" },
        { type: "dialogue", speaker: "mentor", text: "Three states you'll see most: created, running, exited. `docker ps` alone shows you running. Add `-a` for all three. Want to know what one's been saying? `docker logs NAME`. Every line it's printed." },
      ],
      questions: [
        { type: "cmd", prompt: "Type the command to list only the containers currently running.", accept: ["docker ps", "docker container ls"], explain: "docker ps with no flags lists running containers only. docker container ls is the newer, equivalent form of the same command." },
        { type: "cmd", prompt: "Type the command to list ALL containers, including stopped ones.", accept: ["docker ps -a"], explain: "The -a (all) flag tells docker ps to include stopped and exited containers too, not just the running ones." },
        { type: "cmd", prompt: "Type the command to see the output a container named web has printed.", accept: ["docker logs web"], explain: "docker logs NAME (or ID) shows everything that container has written to its stdout and stderr since it started." },
        { type: "mc", prompt: "The states a container moves through include...", options: [
            "created, running, and exited",
            "installed, compiled, and linked",
            "queued, building, and pushed",
            "pending, scheduled, and evicted",
          ], answer: 0, explain: "A container is created (built but not started), running (actively executing), or exited (finished or stopped). docker ps -a shows containers in any of these states." },
        { type: "tf", prompt: "`docker ps` on its own shows stopped containers as well as running ones.", answer: false, explain: "Plain docker ps only lists running containers. You need the -a flag to also see stopped and exited ones." },
      ],
    },
    {
      title: "Ropin' and Brandin'",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "Can I get inside a running container? Poke around?" },
        { type: "dialogue", speaker: "mentor", text: "`docker exec` runs a command inside a container that's already running. Add `-it` and you get an interactive session — a real shell, hooked up to your terminal." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker exec -it web sh", output: "#" },
            { cmd: "ls", output: "bin  docker-entrypoint.d  docker-entrypoint.sh  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var" },
            { cmd: "exit", output: "$" },
            { cmd: "docker stop web", output: "web" },
            { cmd: "docker start web", output: "web" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "`docker stop` doesn't just shoot it. Sends SIGTERM first — polite ask to shut down clean. Waits ten seconds by default. Still up? Then SIGKILL." },
        { type: "dialogue", speaker: "carl", text: "And once it's stopped, is it just... gone?" },
        { type: "dialogue", speaker: "mentor", text: "Still there. Stopped containers stick around — their state, their writable layer, all of it — until you `docker rm` them." },
        { type: "dialogue", speaker: "mentor", text: "One thing you can't do to a stopped one: exec into it. No process running inside, nothing to attach to. Start it first." },
      ],
      questions: [
        { type: "mc", prompt: "`docker exec` is used to...", options: [
            "run a command inside a container that's already running",
            "create a brand-new container from an image",
            "build an image from a Dockerfile",
            "stop a running container",
          ], answer: 0, explain: "docker exec launches a new process inside an existing, running container — it doesn't create a container or start a stopped one." },
        { type: "mc", prompt: "The `-it` flags on `docker exec` are for...", options: [
            "making the session interactive, with a terminal attached",
            "installing extra tools inside the container",
            "increasing the container's resource limits",
            "targeting a specific image tag",
          ], answer: 0, explain: "-i keeps stdin open and -t attaches a pseudo-terminal, together giving you an interactive shell session you can type into, like being logged in directly." },
        { type: "mc", prompt: "When you run `docker stop` on a container, Docker...", options: [
            "sends SIGTERM, waits a grace period (10 seconds by default), then sends SIGKILL if it's still running",
            "sends SIGKILL immediately, no warning",
            "pauses the container without stopping it",
            "removes the container entirely",
          ], answer: 0, explain: "docker stop gives the process a chance to shut down cleanly with SIGTERM first. Only after the grace period (10 seconds unless you change it) does it force the issue with SIGKILL." },
        { type: "tf", prompt: "A stopped container still exists — its filesystem and metadata stick around — until you run `docker rm` on it.", answer: true, explain: "Stopping a container doesn't delete it. It sits there in the 'exited' state, still holding its writable layer and configuration, until you explicitly remove it." },
        { type: "tf", prompt: "You can `docker exec` into a container that's currently stopped.", answer: false, explain: "exec needs a running process inside the container's namespaces to attach to. A stopped container has none — start it first, then exec in." },
      ],
    },
    {
      title: "Cleanup at the Corral",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "I've got images piling up. How do I see what's actually on this machine?" },
        { type: "dialogue", speaker: "mentor", text: "`docker images`. Lists everything sitting local, no network trip needed." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker images", output: "REPOSITORY   TAG       IMAGE ID       CREATED         SIZE\nnginx        latest    3f04ebdcd9bf   2 weeks ago     187MB" },
            { cmd: "docker pull alpine", output: "Using default tag: latest\nlatest: Pulling from library/alpine\n539c75b1d82c: Pull complete\nDigest: sha256:8e0cda888f8a4a366044aa1a87ccddb4ce5e8dcda953d3bed8adb013bed8d558\nStatus: Downloaded newer image for alpine:latest\ndocker.io/library/alpine:latest" },
            { cmd: "docker rmi alpine", output: "Untagged: alpine:latest\nUntagged: alpine@sha256:8e0cda888f8a4a366044aa1a87ccddb4ce5e8dcda953d3bed8adb013bed8d558\nDeleted: sha256:58f19005b848bc0779cebf6f3a4bebe36866ebee3c05939b4df9f602c9c5fa03" },
            { cmd: "docker rmi nginx", output: "Error response from daemon: conflict: unable to remove repository reference \"nginx:latest\" (must force) - container 178c172ce181 is using its referenced image 3f04ebdcd9bf" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Pull just fetches. Doesn't run a thing. `rmi` removed alpine clean — nothing was using it." },
        { type: "dialogue", speaker: "carl", text: "But nginx wouldn't go?" },
        { type: "dialogue", speaker: "mentor", text: "Web's still running off it. Docker won't let an image go while any container, running or stopped, still points to it. Remove the container first." },
        { type: "dialogue", speaker: "mentor", text: "Images and containers are two separate piles. Clean up both, or the corral fills up fast." },
      ],
      questions: [
        { type: "cmd", prompt: "Type the command to list the images stored locally on this machine.", accept: ["docker images", "docker image ls"], explain: "docker images (or the newer docker image ls) lists every image sitting on your local machine, without contacting a registry." },
        { type: "cmd", prompt: "Type the command to fetch the alpine image without running a container from it.", accept: ["docker pull alpine"], explain: "docker pull only downloads the image and stores it locally — it doesn't create or start a container, unlike docker run." },
        { type: "mc", prompt: "`docker rmi` on an image that a container still uses will...", options: [
            "be refused — you have to remove the container (or force it) first",
            "succeed, and the container keeps running as if nothing happened",
            "delete the image and automatically stop the container",
            "only work if the container is currently running, not if it's stopped",
          ], answer: 0, explain: "Docker refuses to delete an image while any container — running OR stopped — still references it. You have to remove the container(s) first, or pass -f to force it." },
        { type: "mc", prompt: "Compared to `docker run`, `docker pull` on its own...", options: [
            "only downloads the image — it never creates or starts a container",
            "downloads the image and also starts a container from it",
            "requires a container to already exist",
            "is just a shorter alias for docker run",
          ], answer: 0, explain: "docker pull's whole job is fetching the image layers into local storage. Creating and starting a container is a separate step, which is what docker run adds." },
        { type: "tf", prompt: "Removing a container also removes the image it was created from.", answer: false, explain: "Images and containers are separate things you clean up separately. Removing a container only deletes that container's writable layer — the underlying image stays until you docker rmi it." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[2];
