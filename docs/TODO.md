# Modern Privacy Lab Roadmap

> Tracker for the "Clinical Precision" UI/UX rollout, data-plane upgrades, and the quality gates that keep the experience measurable.

## Delivery Stages & Decision Gates
| Stage | Target Window | Focus | Decision Gates |
|-------|---------------|-------|----------------|
| Stage 0 – Baseline Readiness | 2025-11-24 → 2025-12-05 | Harden design tokens, storybook primitives, and feature flags so downstream squads iterate safely. | `packages/ui` exports cover new palette + typography, Percy baseline recorded, `npm run lint && npm run test` green. |
| Stage 1 – Lab Chrome & Telemetry | 2025-12-08 → 2025-12-19 | LabShell/HUD chrome plus global telemetry bus landed in `apps/web` with mocked data. | Accessibility audit ≥ 95, `apps/web` perf budget met (<90 LCP in lab), Vitest + Playwright suites added for chrome. |
| Stage 2 – Module Delivery | 2026-01-06 → 2026-02-07 | Ship Identity, Network, Hardware, API labs behind feature flags with stub + prod data sources. | Each lab exposes typed stores/services, golden fixtures in `packages/types/tests`, smoke E2E across Chrome/Safari. |
| Stage 3 – Reporting & Commercialization | 2026-02-10 → 2026-03-07 | Differentiators, reporting, and documentation uplift for GA. | Export automation (JSON+CSV) validated, docs merged, adoption telemetry proves retention. |

## UI & Experience
- [ ] Replace all legacy pastel gradients with the Surgical Dark palette across core pages.
  - Implementation: Centralize tokens in `packages/ui/src/theme/clinical-dark.ts`, wire CSS variables through `apps/web/tailwind.config.ts`, and remove ad-hoc gradients from `apps/web/app/(labs)/**/*.tsx`.
  - Performance & Accessibility: Keep gradients GPU-friendly (linear, ≤2 color stops) and ensure 4.5:1 contrast; add `@media (prefers-reduced-motion)` fallbacks for glow utilities.
  - Validation: Update Percy stories for LabShell variants and assert via visual snapshots + `npm run lint`.
- [ ] Implement HUD chrome (Lab Dock + Status Bar) reflecting live telemetry.
  - Implementation: Build `LabShell` layout that mounts `LabDock`, `StatusBar`, and `LiveAuditLog` using shared Zustand stores under `apps/web/stores`.
  - Data Contracts: Define `LabTelemetry` type in `packages/types/src/labs.ts` and mock via MSW for Storybook + unit tests.
  - Testing: Create Playwright smoke spec `tests/hud.spec.ts` to assert dock resizing, status streaming, and keyboard shortcuts.
- [ ] Ship reusable visual primitives: Exposure Radar, Specimen Container, Bio-Rhythm oscilloscope, Attack Surface badges.
  - Implementation: Author primitives inside `packages/ui/src/labs/` with composable props, then register via `packages/ui/src/index.ts`.
  - Performance: Use `react-three-fiber` only for Identity/Hardware contexts, fallback to SVG for low-power devices via dynamic import guards.
  - Testing: Snapshot props through Vitest + @testing-library/react; add a11y smoke via Storybook `@storybook/testing-library`.
- [ ] Enforce new typography stack (Inter UI + JetBrains Mono) through Tailwind tokens.
  - Implementation: Co-locate font loading in `apps/web/app/fonts.ts`, register CSS variables in `globals.css`, and expose tokens via `tailwind.config.ts` plugin.
  - Maintainability: Provide `TypographyGuide.mdx` under `docs/components` to explain usage.
  - Testing: Add visual regression on headings/body, plus `npm run lint` to ensure no raw `font-family` overrides remain.

## Laboratory Modules
- [ ] Identity Lab: Canvas/WebGL loaders plus hash entropy overlays.
  - Implementation: Use `apps/web/app/(labs)/identity` route with Suspense-ready `SpecimenViewer` that consumes `useFingerprint` hook from `packages/core`.
  - Performance: Add worker offloading for entropy calculations; cap animation to 60fps with devicePixelRatio guard.
  - Testing: Vitest coverage for entropy math, WebGL mocked snapshots, and Playwright trace to verify slider controls.
- [ ] Network Lab: Traceroute map, JA3 capture, WebRTC leak playback.
  - Implementation: Bundle traceroute visualization with `deck.gl` inside `NetworkRoutes.tsx`, stream JA3 fingerprints from `apps/api/src/routes/fingerprint.ts` via SSE.
  - Observability: Emit `network.lab.event` logs to Cloudflare Radar + Loki for replay.
  - Testing: Contract tests for SSE payloads plus Cypress/Playwright flows across Chrome/Firefox.
- [ ] Hardware Lab: Motion Visualizer (react-three-fiber) synced with DeviceMotion; battery + GPU stress cards.
  - Implementation: Provide `useDeviceTelemetry` hook using browser sensor APIs with graceful degradation (PermissionStatus fallback), render 3D skeleton when sensors available.
  - Performance: Dynamically import heavy charts, throttle DeviceMotion listener to 30Hz, guard Safari restricted sensors.
  - Testing: Add mocked sensor values (JSDOM polyfill) and GPU stress unit tests verifying worker scheduling.
- [ ] Modern API Lab: Scanners for Bluetooth, USB, MIDI, Clipboard with simulator outputs.
  - Implementation: Provide feature-specific services under `apps/web/services/apis/*.ts` with capability detection and faux data when APIs unavailable.
  - Security: Request permissions lazily, surface warnings referencing MDN guidance, and log rejection reasons to telemetry bus.
  - Testing: Jest/Vitest unit tests for capability detection + manual QA matrix across Chromium/Safari/Firefox nightly.

## Cloudflare & Data Pipeline
- [ ] Workers for DNS beaconing (`uuid.dns.browserleaks.io`) and JA3 hashing.
  - Implementation: Author Workers in `cloudflare/workers/{dns,ja3}/src`, share `packages/types` for payloads, and publish via Wrangler pipelines.
  - Performance: Keep cold start <5ms by using module workers + KV caching; enforce 1 KB payload budgets.
  - Testing: Add Miniflare specs with recorded fixtures and integrate into `npm run test`.
- [ ] Stream scan events over SSE/WebSocket into the dashboard live log.
  - Implementation: Extend `apps/api/src/routes/events.ts` to multiplex SSE and WS, persist backlog in Redis/Cloudflare Queues for durability.
  - Maintainability: Document event schema in `docs/API.md` and add consumer examples for UI + CLI clients.
  - Testing: Contract tests verifying reconnect + last-event-id, plus load test using k6 in CI nightly.
- [ ] Persist leak results to D1 `leak_logs` table using the canonical JSON schema.
  - Implementation: Migrate schema via `cloudflare/migrations`, align with `packages/types/src/leaks.ts`, and add DAO wrappers in `apps/api/src/services/leakLogs.ts`.
  - Data Integrity: Mirror writes into `validated_ip_data` (see `/ip-data/task/requirement.md`) to reconcile conflicting geo/ASN sources before surfacing to UI exports.
  - Testing: Introduce property-based tests ensuring schema evolution is backwards compatible (Vitest + fast-check).
- [ ] Data validation plane for IP intelligence (mirrors /task requirement).
  - Implementation: Stand up `DataValidationService` worker invoking IPInfo + MaxMind, populate `validated_ip_data` table, and expose queue metrics.
  - Performance: Batch lookups (≤100 records) and cache results per ASN to conserve API quota (100K/month).
  - Testing & Monitoring: Daily cron test verifying queue drain + Grafana alert when conflict rate >5%.

## Differentiators & Reporting
- [ ] Local Network Scanner simulation explaining mDNS/WebRTC leaks.
  - Implementation: Use Service Worker-driven mock results + 3D overlay to highlight LAN targets; provide educational copy per device.
  - Privacy: Never emit raw LAN IPs to backend; store only hashed summary.
  - Testing: Integration spec ensures toggling simulation updates Attack Surface badges.
- [ ] Social Login Detector leveraging cache probing with privacy warnings.
  - Implementation: Build detection worker using `document.hasStorageAccess()` heuristics + list of IdP assets, show warnings in `apps/web/components/panels/SocialDetector.tsx`.
  - Security: Sandbox detection iframe and feature-flag via LaunchDarkly.
  - Testing: Add fixture-based tests ensuring heuristics stay under 100ms per check.
- [ ] API surface fuzzer listing non-standard globals per scan export (JSON + CSV).
  - Implementation: Use `packages/core/src/fuzzer` to diff `window` global snapshot vs baseline, pipe results to exports via `apps/api`.
  - Scalability: Chunk exports to 10K entries per file and stream to S3-compatible storage.
  - Testing: Golden fixtures + snapshot tests ensure deterministic outputs; add CLI regression harness.

## Documentation & Onboarding
- [ ] Update README, docs/ARCHITECTURE.md, and AGENTS.md with the Modern Privacy Penetration Lab narrative.
  - Action: Add sections for palette, telemetry pipeline, and validation services referencing `/ip-data/task/requirement.md`.
  - Review: Require design + eng sign-off before publishing.
- [ ] Add contributor onboarding checklist spotlighting design tokens, testing expectations, and lab coding standards.
  - Action: Create `docs/ONBOARDING.md` covering required commands (`npm run test`, `npm run lint`, `npm run format:check`), Storybook usage, and data safety rules.
  - Tracking: Gate merges on checklist completion in PR template.

## Quality, Testing & Automation
- [ ] Expand Vitest suites across `apps/{web,api}` with ≥85% statement coverage for new labs and services.
- [ ] Stand up automated visual regression via Playwright + Percy tied to LabShell stories.
- [ ] Add synthetic monitoring (Checkly) hitting `/tests/{ip,dns,webrtc}` hourly with SLA dashboards.
- [ ] Ensure CI runs `npm run lint`, `npm run type-check`, `npm run test`, and bundle analyzer for each stage.

## Performance, Telemetry & Observability
- [ ] Enforce performance budgets: LCP < 2s on desktop, < 3s on mobile; TBT < 150ms.
- [ ] Instrument OpenTelemetry traces from Cloudflare Workers → `apps/api` → `apps/web` via OTLP exporter and visualize in Grafana Tempo.
- [ ] Add structured logging (pino + Logfmt) with correlation IDs per scan.
- [ ] Provide feature-level dashboards (LabShell usage, leak submission volume, validation queue health) surfaced in Status Bar HUD.
