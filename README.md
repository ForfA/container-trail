# The Container Trail

A black-and-white pixel game that teaches containers, Docker, and Kubernetes.
Follow Carl the cowboy from Monolith Gulch along the Orchestration Trail.

## Run it (recommended)

    cd container-trail
    python3 -m http.server 8123

Open http://localhost:8123 — progress saves reliably in every browser.

## Run it (quick)

Double-click `index.html`. Works in Chrome/Firefox; some browsers (Safari)
block saving on file:// — the game still runs, with an in-session save only.

## Development

    node tools/validate.js   # schema-check all module content
    node --test tests/*.test.js   # unit tests (Node >= 18)

No dependencies, no build step.
