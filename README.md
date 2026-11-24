# Mohit Bhagwani — Beyond the Backend

An interactive transaction atlas and conventional portfolio. The 3D atlas lets visitors follow a payment across a physical model of an orchestration platform. Built with React, TypeScript, Vite, React Three Fiber, and Drei. It runs on static hosting without a backend or paid services.

## Start locally

Docker and Docker Compose are the only development prerequisites. On Apple Silicon, use the existing Colima ARM64 runtime. No host Node/npm installation is needed.

```sh
docker compose up --build
```

Open http://localhost:5173. Hot reload uses polling for macOS/Colima bind mounts. Dependencies live in named Docker volumes, never the host checkout. The first startup downloads dependencies; subsequent `npm ci` runs use the same reproducible lockfile. If a package changes, restart the service to synchronize the volume.

```sh
docker compose down
```

## Fly over Jaipur

Choose **Launch kite**, steer with the left and right arrows or **A/D**, and change height with the up and down arrows or **W/S**. Tap **Space** for a short gust. Fly through colored wind rings to discover rooftops. On mobile, enable 3D for touch controls. Visitors can jump straight to the portfolio at any point.

## Use the atlas

Choose **Enter the 3D journey** to open the full-screen scene. Click **Launch packet** beside the ingress gate to start. The camera follows each stage. Switch to **Free camera** to orbit the scene, or press Escape to return to the portfolio.

- Choose **Approved**, **Provider failure**, **Duplicate request**, or **Refund** and run the trace. Use the step button to advance one event at a time.
- In 3D, drag the board to rotate it, pinch or scroll to zoom, and select a module to see its job in the system.
- The system inspector links each stage to related engineering work. All case studies, experience, and contact details are available from the portfolio below.
- The 2D mode uses selectable stage cards and the same trace controls. It defaults on small screens and when reduced motion is preferred. It also serves browsers without working WebGL.

## Explore the 3D skills workshop

Open **Skills** to orbit the workshop and select a modeled tool. Choose **Walk the workshop** for an eye-level tour. Use WASD or arrows to move and turn, **E** to inspect a nearby exhibit, or the touch controls on mobile. The same exhibits and complete technology list work in 2D mode.

## Run checks in Docker

With `web` running:

```sh
docker compose exec web npm run lint
docker compose exec web npm run typecheck
docker compose exec web npm test
docker compose exec web npm run build
docker compose exec web npm run format:check
docker compose --profile test run --rm e2e
```

Formatting:

```sh
docker compose exec web npm run format
```

Playwright runs in its official, version-matched Linux browser image, with a separate dependency volume. Chromium uses software WebGL in the container. Both desktop and mobile layouts are exercised. Reports/screenshots go to ignored `playwright-report/` and `test-results/` directories. Unit tests verify payment idempotency and terminal states, no overselling, expiry, queue retries/rebalancing, cache TTL, KYC transition boundaries, and decimal transformations.

Production preview (container-local port):

```sh
docker compose exec -d web npm run preview -- --port 4173
docker compose --profile test run --rm -e BASE_URL=http://web:4173 e2e
```

## Content and review

Edit `src/content/portfolio.ts` for professional content, case studies, skills, district metadata, and verified contact links. Add an approved résumé under `public/`, then set `profile.resume` to its root-relative path. Empty email, LinkedIn, and résumé settings intentionally display clear configuration notices; no details were guessed. Certification validity is not claimed. Provider names are intentionally omitted pending disclosure review.

All simulations use fictional data and simplified educational models. Nothing connects to payment processors, banks, identity providers, or production systems. Case-study diagrams are public conceptual abstractions. KYC is explicitly labeled as architecture/design work.

## Architecture

```text
src/
  world/          Procedural board, 3D modules, links, packet and camera
  components/     Modal accessibility, conventional content, case studies
  content/        Structured professional data and configuration
  simulations/    Pure state models and lazy-loaded interactive demonstrations
  App.tsx         Composition, hash navigation, WebGL capability and user preferences
  styles.css      Responsive visual system and reduced-motion styles
tests/            Model unit tests and desktop/mobile browser tests
.github/workflows/deploy.yml
```

No 3D asset downloads or remote fonts are required. The procedural scene is lazy loaded and renders on demand, and the portfolio and trace controls load independently. The deeper engineering simulations are separate lazy imports. See `docs/ARCHITECTURE.md` for design trade-offs.

## GitHub Pages

The deployment workflow triggers on pushes to `main` and manual runs. It runs Docker-based lint, TypeScript, unit tests, production browser tests, builds `dist/`, uploads the Pages artifact, and deploys using only `pages: write` and `id-token: write` in the deployment job. Repository contents remain read-only in CI.

Vite uses `/` as its base for `https://mohitbhagwani.github.io/`. All content navigation uses native anchors or hash overlays; refreshing a case-study URL requests the root document and works on GitHub Pages without rewrite rules. Keep Pages configured for **GitHub Actions**.

**Publication is intentionally pending owner review.** After approving the initial local portfolio and employer-related copy, push the reviewed commit to `main`, monitor the Actions run, and verify the production URL. A local build is not evidence of a successful deployment.

## Design reference

The original brief cited Bruno Simon’s [portfolio](https://bruno-simon.com/) and [2019 case study](https://medium.com/@bruno_simon/bruno-simon-portfolio-case-study-960402cc259b). After reviewing a driving prototype, Mohit asked for a distinct premise. The current atlas uses the flow of a transaction as its organizing interaction. All scene models and UI are original.
