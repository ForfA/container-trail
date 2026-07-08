// module4.js — Buildtown: Dockerfiles, layer caching, tags/registries, lean images.
if (typeof window === "undefined") { global.window = global.window || { GameData: { modules: [] } }; }
window.GameData = window.GameData || { modules: [] };
window.GameData.modules[3] = {
  id: 4,
  town: "Buildtown",
  mentor: { name: "Merchant Silas", spriteId: "mentor4", intro: "Images, fresh-built, best cache in the territory." },
  arrival: [
    { type: "vignette", id: "town-build", caption: "Buildtown. Kilns and forges smoke where images get made, not just moved." },
    { type: "dialogue", speaker: "mentor", text: "Silas Crate, at your service! Images, fresh-built, best cache in the territory — step right up, stranger." },
    { type: "dialogue", speaker: "mentor", text: "Every crate on my shelf started as a recipe. Let me show you how it's baked." },
  ],
  departure: [
    { type: "dialogue", speaker: "mentor", text: "You can build 'em, brand 'em, ship 'em lean now. Fine stock, if I do say so myself." },
    { type: "dialogue", speaker: "mentor", text: "But an image nobody can reach is inventory, not business. Find Bridgekeeper Mo at Bridge Crossing, Carl — she'll show you how to open the gate." },
  ],
  levels: [
    {
      title: "Blueprints",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "So how do you actually BUILD one of these images, Silas?" },
        { type: "dialogue", speaker: "mentor", text: "Recipe, plain and simple! Write down the steps, hand it to Docker, out comes a crate. We call that recipe a Dockerfile." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "cat Dockerfile", output: "FROM node:20-alpine\nCOPY package.json .\nRUN npm install\nCOPY . .\nCMD [\"node\", \"app.js\"]" },
            { cmd: "docker build -t web .", output: "Sending build context to Docker daemon  4.096kB\nStep 1/5 : FROM node:20-alpine\n ---> 3ae5e6249562\nStep 2/5 : COPY package.json .\n ---> 8f68a1b2c3d4\nStep 3/5 : RUN npm install\n ---> Running in a1b2c3d4e5f6\n ---> 9e8d7c6b5a4f\nStep 4/5 : COPY . .\n ---> 2b3c4d5e6f7a\nStep 5/5 : CMD [\"node\", \"app.js\"]\n ---> Running in b1c2d3e4f5a6\n ---> 7a6b5c4d3e2f\nSuccessfully built 7a6b5c4d3e2f\nSuccessfully tagged web:latest" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "See that first line? FROM node:20-alpine. Sets your base — everything else in the recipe builds on top of it. A Dockerfile starts from a base image with FROM." },
        { type: "dialogue", speaker: "carl", text: "And RUN versus CMD — what's the difference? Sound the same to me." },
        { type: "dialogue", speaker: "mentor", text: "RUN executes right there while I'm building the crate — bakes npm install straight into a layer." },
        { type: "dialogue", speaker: "mentor", text: "CMD just writes down what runs when somebody opens the crate later, at container START. One happens now, one happens later." },
        { type: "dialogue", speaker: "mentor", text: "COPY hauls files from wherever I ran that build command — the build context — into the image. Miss a file in your context, it never makes it in." },
        { type: "dialogue", speaker: "mentor", text: "That command up top, docker build -t web . — the dot means 'build context is right here, this directory.' The -t tags the result web, so you can find it again." },
      ],
      questions: [
        { type: "mc", prompt: "In Buildtown, what is a Dockerfile?", options: [
            "A set of instructions Docker reads to build an image, step by step",
            "A compressed copy of a running container",
            "A configuration file for the Docker daemon's network settings",
            "A log of every container that has ever run on this machine",
          ], answer: 0, explain: "A Dockerfile is the recipe: instructions, read top to bottom, that Docker executes to build an image layer by layer. It doesn't run anything by itself — it just describes the build." },
        { type: "mc", prompt: "Which instruction sets a Dockerfile's base image, and comes before instructions like RUN, COPY, or CMD that build on it?", options: [
            "FROM",
            "RUN",
            "BASE",
            "START",
          ], answer: 0, explain: "A Dockerfile starts from a base image with FROM; everything else builds on top of that base, so FROM leads the recipe." },
        { type: "mc", prompt: "What's the real difference between RUN and CMD in a Dockerfile?", options: [
            "RUN executes a command at build time and bakes the result into a layer; CMD sets the default command a container runs when it STARTS",
            "RUN and CMD do exactly the same thing, just different keywords",
            "CMD runs at build time; RUN sets the container's start command",
            "RUN only works with shell scripts; CMD only works with binaries",
          ], answer: 0, explain: "RUN happens once, during the build — its result becomes a layer. CMD doesn't execute anything during the build; it just records what command starts up when a container is later launched from the image." },
        { type: "mc", prompt: "The COPY instruction...", options: [
            "brings files from the build context into the image being built",
            "copies files between two already-running containers",
            "downloads a file from the internet into the image",
            "duplicates the entire base image",
          ], answer: 0, explain: "COPY reads from the build context — the directory (and its contents) you point docker build at — and places those files inside the image. It has nothing to do with running containers or the internet." },
        { type: "tf", prompt: "docker build -t web . builds an image using the Dockerfile in the current directory and tags the result web.", answer: true, explain: "The trailing . sets the build context to the current directory (where Docker looks for the Dockerfile by default), and -t web assigns the tag web to the resulting image." },
        { type: "cmd", prompt: "Type the command to build the current directory into an image tagged web.", accept: ["docker build -t web ."], explain: "docker build -t NAME . reads the Dockerfile in the current directory (the build context) and tags the resulting image NAME." },
      ],
    },
    {
      title: "The Cache Rush",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "That build took a few seconds. Does it always take that long?" },
        { type: "dialogue", speaker: "mentor", text: "Only the first time, stranger! After that, Docker remembers what it already built — reuses it instead of doing the work twice. That's the cache, and mine's the best in the territory." },
        { type: "widget", id: "layer-cache" },
        { type: "dialogue", speaker: "mentor", text: "Every line in that Dockerfile bakes its own layer. Change nothing, that layer gets reused straight off the shelf. Change one line, that layer AND everything stacked after it has to rebuild." },
        { type: "dialogue", speaker: "carl", text: "So why copy package.json and install before the rest of the code?" },
        { type: "dialogue", speaker: "mentor", text: "Because your dependencies change a lot less often than your code does. Put the slow step — npm install — where it stays cached most of the time. Edit app.js all day, that install layer never rebuilds." },
      ],
      questions: [
        { type: "mc", prompt: "In Docker's build cache, what does each instruction in a Dockerfile produce?", options: [
            "its own layer, which can be reused on later builds if nothing about it changed",
            "a brand-new image every time",
            "a temporary file deleted after the build finishes",
            "nothing — only the final instruction produces a layer",
          ], answer: 0, explain: "Every instruction in a Dockerfile — FROM, COPY, RUN, and so on — produces its own layer. Docker can reuse that layer on a later build if the instruction and its inputs haven't changed." },
        { type: "mc", prompt: "If you change a line partway down a Dockerfile and rebuild, what happens to the layers?", options: [
            "That layer and every layer after it rebuild; layers before it stay cached",
            "Only that one exact layer rebuilds; everything else, before and after, stays cached",
            "The whole image rebuilds from FROM onward, no matter where the change is",
            "Nothing rebuilds — Docker always reuses the last successful build",
          ], answer: 0, explain: "Cache invalidation cascades downward: once one instruction's inputs change, Docker can no longer trust the cache for it OR anything stacked on top of it, so that layer and everything after it rebuild." },
        { type: "mc", prompt: "Why copy package.json and run npm install BEFORE copying the rest of the application code?", options: [
            "Dependencies change far less often than app code, so that expensive install stays cached on most rebuilds",
            "Docker requires dependency files to be copied first or the build fails",
            "It makes the final image smaller",
            "npm install only works if it runs before any other COPY instruction",
          ], answer: 0, explain: "Ordering is a caching decision, not a hard requirement. Since dependency manifests change rarely, copying them (and installing) before the app code means routine code edits don't force a slow reinstall every time." },
        { type: "tf", prompt: "Because rebuilds reuse cached layers, the order you write Dockerfile instructions in is purely cosmetic — it doesn't affect build performance.", answer: false, explain: "Order matters a great deal for cache performance: instructions that change often should come late, and stable ones (like dependency installs) should come early, so routine changes invalidate as few layers as possible." },
        { type: "tf", prompt: "Docker's build cache can make a rebuild much faster than the original build, since unchanged layers are reused instead of redone.", answer: true, explain: "That's the whole payoff of layer caching — if nothing an instruction depends on has changed, Docker skips redoing the work and reuses the layer already sitting on disk." },
      ],
    },
    {
      title: "Brands and Registries",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "What's all that on the label — silas/web:1.0? Looks like more name than a crate needs." },
        { type: "dialogue", speaker: "mentor", text: "Every crate needs a brand, stranger! registry slash repository colon tag — that's the full name. Leave off the registry and Docker figures Docker Hub, the biggest stall in the territory." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker tag web silas/web:1.0", output: "$" },
            { cmd: "docker push silas/web:1.0", output: "The push refers to repository [docker.io/silas/web]\na1b2c3d4e5f6: Pushed\nb2c3d4e5f6a7: Pushed\nc3d4e5f6a7b8: Pushed\nd4e5f6a7b8c9: Layer already exists\n1.0: digest: sha256:6f2f9c4d1a3b8e7c5d6a9b0f1e2d3c4b5a69788695041322110fedcba0987654 size: 1369" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Crate's on the registry shelf now. Watch some other rancher's machine, clear across the territory, fetch it down." },
        { type: "terminal", playerTypes: false, lines: [
            { cmd: "docker pull silas/web:1.0", output: "1.0: Pulling from silas/web\na1b2c3d4e5f6: Pull complete\nb2c3d4e5f6a7: Pull complete\nc3d4e5f6a7b8: Pull complete\nd4e5f6a7b8c9: Pull complete\nDigest: sha256:6f2f9c4d1a3b8e7c5d6a9b0f1e2d3c4b5a69788695041322110fedcba0987654\nStatus: Downloaded newer image for silas/web:1.0\ndocker.io/silas/web:1.0" },
          ] },
        { type: "dialogue", speaker: "mentor", text: "Notice I tagged it 1.0, not latest. latest's just a name, same as any other tag — Docker doesn't check dates. Leave the tag off entirely, and you default to latest, but that doesn't mean newest." },
        { type: "dialogue", speaker: "mentor", text: "Push sends a crate up to the registry's shelf. Pull brings one down. Simple as that, stranger." },
      ],
      questions: [
        { type: "mc", prompt: "An image's full name breaks down as...", options: [
            "registry/repository:tag — where the registry can be left off and defaults to Docker Hub",
            "repository/registry:tag, always required in full",
            "tag/repository:registry, in that fixed order",
            "just a single arbitrary string with no real structure",
          ], answer: 0, explain: "The full form is registry/repository:tag. If you omit the registry, Docker assumes Docker Hub (docker.io) — that's why silas/web:1.0 still works without spelling out the registry." },
        { type: "tf", prompt: "Because latest is Docker's default tag when none is specified, it's guaranteed to be the most recently built version of an image.", answer: false, explain: "latest is just a tag name like any other — whoever pushes an image can attach it to any build, old or new. It's the default tag Docker assumes, not a guarantee of recency." },
        { type: "mc", prompt: "What is a registry?", options: [
            "A service that stores and serves images — Docker Hub is the default one Docker uses",
            "A local folder on your machine where Dockerfiles live",
            "The process inside a container that runs the app",
            "A tool for limiting a container's CPU and memory",
          ], answer: 0, explain: "A registry stores images and serves them over the network. Docker Hub is the registry Docker talks to by default, though private and self-hosted registries exist too." },
        { type: "mc", prompt: "docker push and docker pull...", options: [
            "upload an image to a registry and download one from a registry, respectively",
            "both only work on images already running as containers",
            "pull uploads, push downloads",
            "are two names for the exact same operation",
          ], answer: 0, explain: "push sends a local image up to a registry; pull fetches an image down from a registry to your local machine. They're opposite directions of the same trip." },
        { type: "cmd", prompt: "Type the command to push the image silas/web:1.0 to its registry.", accept: ["docker push silas/web:1.0"], explain: "docker push NAME:TAG uploads that tagged image to whichever registry its name points at — silas/web:1.0 goes wherever silas/web is hosted, Docker Hub by default." },
      ],
    },
    {
      title: "Lean Provisions",
      scenes: [
        { type: "dialogue", speaker: "carl", text: "All your crates this small on purpose?" },
        { type: "dialogue", speaker: "mentor", text: "Every ounce of fat I trim ships faster and hides less trouble, stranger! Slim base image, alpine instead of the full spread — cuts size right down." },
        { type: "diagram", id: "multi-stage", steps: [
            { caption: "Stage one starts FROM a full build image — compilers, dev tools, the works. Stage two starts FROM a slim runtime base, completely separate." },
            { caption: "Stage one compiles the app, pulling in every dependency it needs to build. Stage two hasn't been touched yet — still just the bare runtime." },
            { caption: "The final COPY --from=build pulls over only the compiled output. Every compiler and dev dependency from stage one stays behind — never shipped." },
          ] },
        { type: "dialogue", speaker: "carl", text: "What keeps my node_modules and .git folder out of the build in the first place?" },
        { type: "dialogue", speaker: "mentor", text: ".dockerignore, same idea as .gitignore. List what the build context should skip — keeps junk, and secrets, out of the image entirely." },
        { type: "dialogue", speaker: "mentor", text: "CMD sets a default start command, easy to override — run the container with a different command on the end, that wins." },
        { type: "dialogue", speaker: "mentor", text: "ENTRYPOINT's less easily brushed aside; the two often work together to shape how a container starts." },
      ],
      questions: [
        { type: "mc", prompt: "Why does a smaller image size matter?", options: [
            "It pulls faster and has less software installed that could carry a vulnerability",
            "It makes the container use less CPU while running",
            "It's required — Docker refuses images over a certain size",
            "It has no practical benefit, just tidiness",
          ], answer: 0, explain: "Smaller images transfer over the network faster (faster pulls, faster deploys) and simply contain less software — fewer packages means a smaller attack surface for vulnerabilities to hide in." },
        { type: "mc", prompt: "What does a multi-stage build do?", options: [
            "Compiles or builds the app in one stage, then copies only the finished artifact into a small final stage",
            "Runs the same Dockerfile twice for redundancy",
            "Builds two completely separate, unrelated images at once",
            "Splits one image across two different registries",
          ], answer: 0, explain: "A multi-stage build lets you use a full, heavyweight image (compilers, build tools) for one stage, then COPY --from that stage into a slim final stage — so the compilers and dev dependencies never ship." },
        { type: "mc", prompt: "What does a .dockerignore file do?", options: [
            "Lists files and directories to exclude from the build context, keeping them out of the image",
            "Tells Docker which images to ignore when running docker pull",
            "Prevents a container from starting if it lists certain processes",
            "Marks which layers should never be cached",
          ], answer: 0, explain: ".dockerignore works like .gitignore: it lists paths — node_modules, .git, secrets — that shouldn't be sent into the build context at all, keeping the image (and the build) lean." },
        { type: "tf", prompt: "CMD in a Dockerfile sets a default command that's easy to override — running the container with a different command on the command line replaces it.", answer: true, explain: "CMD is just the default. Appending a different command when you run the container overrides whatever CMD specified, which is exactly what makes it a default rather than a fixed instruction." },
        { type: "tf", prompt: "Multi-stage builds ship the compilers and dev dependencies used in the build stage into the final image, alongside the compiled artifact.", answer: false, explain: "The whole point of a multi-stage build is the opposite: only the files you explicitly COPY --from the build stage make it into the final image. Compilers and dev-only dependencies stay behind in the discarded build stage." },
      ],
    },
  ],
};
if (typeof module !== "undefined") module.exports = window.GameData.modules[3];
