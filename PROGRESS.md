# Beyond the Backend — implementation progress

## Current direction

The first driving prototype was rejected. The current implementation is a transaction atlas, with 3D modules for request ingress, idempotency, orchestration, providers, callbacks, and reconciliation. Playback and manual stepping show success, rejection, and duplicate-request behavior. The 2D fallback uses the same controls and inspector.

## Implemented

- Docker Compose with Colima ARM64 support, polling hot reload, separate dependency volumes, and reproducible installs.
- Procedural Three.js scene, interactive orbit and zoom, selectable modules, and an animated transaction packet.
- Eight case studies, career history, skills, awards, education, and certification gallery.
- Browser demos for payment orchestration, Kafka-style queues, caching, reservations, KYC, JSON transformation, and regional payment methods.
- Hash-based navigation, modal keyboard support, responsive layouts, and 2D fallback.
- Static build and Docker-based GitHub Pages workflow.

## Review and release

The site remains local for owner review. Publication still requires Mohit’s approval. An approved résumé and verified email/LinkedIn URL are unsupplied. Certification validity has not been verified and active status is not claimed. Provider names are withheld pending permission to disclose them. No private employer implementation details or fabricated impact metrics are included.

## Local verification

- Production build, TypeScript, ESLint, and 10 unit tests passed in Docker.
- 14 Playwright tests passed against the production build across desktop and mobile Chromium. Coverage includes 3D module selection, automatic and manual trace paths, the engineering demos, modal keyboard focus, reduced motion, and WebGL fallback.
- The root document, favicon, social share PNG, sitemap, and robots file returned HTTP 200 from the production preview. The 3D scene is a separate lazy chunk of approximately 249 kB compressed.
- GitHub Pages deployment is configured and remains pending review. No remote Actions run has been verified.
