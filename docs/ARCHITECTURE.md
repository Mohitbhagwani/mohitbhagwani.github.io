# Architecture decisions

## Static delivery

Case studies use hashes on the root document so direct links survive a refresh on GitHub Pages. Employer content and trace definitions live in structured data files. The site bundles fonts locally and uses no backend or third-party runtime APIs.

## Transaction atlas

Visitors trace a fictional payment through six modules. The success path includes a provider callback and reconciliation. A provider rejection follows a distinct branch into the transaction record. A duplicate short-circuits at the idempotency boundary. Manual advancement and automatic playback share the same ordered steps.

React Three Fiber renders the circuit board, low-poly module models, and visual packet. The trace controller owns the semantic state so the console and 2D fallback remain functional independently of WebGL. The scene loads separately, renders on demand, and requests frames when a packet travels or the camera changes. The 2D cards and world labels both select the same inspector state. The 2D portfolio defaults on small screens and with reduced motion.

The atlas followed a rejected driving prototype. The action is now tracing and inspecting system behavior. The terrain, rover, and physics engine from that prototype were removed.

## Educational simulations

The deeper demonstrations use deterministic state models. Payments show idempotency, pending states, rejection, and webhook handling. Queue partition ownership changes during simulated failure, and retries preserve offset behavior. Inventory serializes an atomic reservation boundary. Cache and inventory clocks advance explicitly. KYC is a validated proposed workflow. JSON transformations use an allowlist, with half-up decimal rounding implemented via integer digits.

## Content and scope

Employer experience is limited to the supplied responsibilities. KYC is explicitly marked as design work. Diagrams and demos are conceptual. Unverified contact details, résumé file, provider disclosures, and certification validity are withheld or clearly marked.
