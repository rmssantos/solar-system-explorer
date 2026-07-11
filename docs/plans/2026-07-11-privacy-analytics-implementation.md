# Privacy-first Analytics and Media Viewer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add consent-gated Azure Application Insights analytics, correct NASA source links, and accessible in-page image enlargement across the paper experience.

**Architecture:** A pure consent store and strict event allowlist sit in front of a lazy browser telemetry adapter. One shared bootstrap renders privacy controls on all four routes. The NASA service exposes asset detail pages, and one reusable dialog powers image enlargement in the game and Library.

**Tech Stack:** Vite, vanilla JavaScript, Vitest, Microsoft Application Insights Web SDK, native HTML dialog, Azure Static Web Apps, KQL.

## Global Constraints

- No telemetry before explicit opt-in.
- No free text, pointer coordinates, precise ship coordinates, names, email, quiz answer text, session replay or persistent cross-device identifiers.
- Keep Application Insights IP masking enabled and cookies disabled.
- PT and EN must have equivalent controls and explanations.
- Every behavior change follows red-green TDD and browser verification.

---

### Task 1: Consent and bounded event contracts

**Files:**
- Create: `paper-preview/src/analytics/consent.js`
- Create: `paper-preview/src/analytics/eventCatalog.js`
- Test: `tests/paperAnalyticsConsent.test.js`

**Interfaces:**
- Produces: `readAnalyticsConsent(storage)`, `writeAnalyticsConsent(storage, choice, now)`, `clearAnalyticsConsent(storage)`, `sanitizeAnalyticsEvent(name, properties)`.

- [ ] Write tests proving unknown/expired consent returns `pending`, choices persist with policy version, and event values are allowlisted/bounded.
- [ ] Run `npm test -- tests/paperAnalyticsConsent.test.js` and verify failures are caused by missing modules.
- [ ] Implement the smallest pure modules that satisfy those tests.
- [ ] Re-run the focused tests and commit the green slice.

### Task 2: Consent-gated Application Insights adapter

**Files:**
- Create: `paper-preview/src/analytics/applicationInsights.js`
- Create: `paper-preview/src/analytics/siteAnalytics.js`
- Test: `tests/paperApplicationInsights.test.js`

**Interfaces:**
- Consumes: Task 1 consent and sanitizer functions.
- Produces: singleton `siteAnalytics` with `start()`, `grant()`, `deny()`, `revoke()`, `track(name, properties)` and `trackPageView(route)`.

- [ ] Write tests proving the SDK loader is never called before consent, is configured without cookies/automatic collection, and receives only sanitized events.
- [ ] Run the focused test and observe the expected red failures.
- [ ] Add `@microsoft/applicationinsights-web`, implement lazy initialization and the shared paper consent component.
- [ ] Re-run focused tests and commit the green slice.

### Task 3: Shared privacy UI and policy route

**Files:**
- Create: `paper-preview/privacidade/index.html`
- Create: `paper-preview/privacy.css`
- Modify: `paper-preview/index.html`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/biblioteca/index.html`
- Modify: `paper-preview/src/i18n/paperI18n.js`
- Modify: `paper-preview/src/landing.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/library.js`
- Modify: `paper-preview/vite.config.js`
- Test: `tests/paperPrivacyUi.test.js`

**Interfaces:**
- Consumes: `siteAnalytics` from Task 2.
- Produces: four instrumented clean routes with a shared `[data-privacy-settings]` control.

- [ ] Write structural tests for bilingual consent controls, policy route, clean navigation and four Vite inputs.
- [ ] Verify the tests fail for the absent route/controls.
- [ ] Implement policy copy and the paper-card UI; bootstrap analytics on each route.
- [ ] Re-run tests and commit the green slice.

### Task 4: Semantic product events

**Files:**
- Modify: `paper-preview/src/landing.js`
- Modify: `paper-preview/src/library.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Test: `tests/paperAnalyticsIntegration.test.js`

**Interfaces:**
- Consumes: `siteAnalytics.track()`.
- Produces: bounded events for navigation, filters/search result buckets, object/image/source opens, quiz outcomes, missions, autopilot, language and safe client errors.

- [ ] Write tests that inspect integration points and assert no search value or flight coordinate is passed.
- [ ] Observe red failures.
- [ ] Add semantic calls at state transitions, debouncing search-derived result-count events.
- [ ] Re-run focused tests and commit the green slice.

### Task 5: Human NASA sources and accessible media viewer

**Files:**
- Create: `paper-preview/src/ui/mediaViewer.js`
- Modify: `paper-preview/src/data/spaceDataService.js`
- Modify: `paper-preview/src/main.js`
- Modify: `paper-preview/src/ui.js`
- Modify: `paper-preview/src/library.js`
- Modify: `paper-preview/jogo/index.html`
- Modify: `paper-preview/biblioteca/index.html`
- Modify: `paper-preview/styles.css`
- Modify: `paper-preview/library.css`
- Test: `tests/paperSpaceData.test.js`
- Test: `tests/paperMediaViewer.test.js`

**Interfaces:**
- Produces: NASA envelopes whose `source.url` is a details page and `createMediaViewer(dialog)` with `open({src, alt, caption, source})` / `close()`.

- [ ] Write a NASA service test expecting `/details/<nasaId>` and viewer tests for open, Escape, backdrop close and focus return.
- [ ] Observe both fail for the intended missing behavior.
- [ ] Make the parser-derived source override and reusable dialog; instrument image/source opens.
- [ ] Re-run focused tests and commit the green slice.

### Task 6: Azure operations and end-to-end verification

**Files:**
- Create: `docs/analytics/application-insights-setup.md`
- Create: `docs/analytics/product-queries.kql`
- Create: `paper-preview/public/staticwebapp.config.json`
- Modify: `.github/workflows/azure-static-web-apps-green-smoke-09dea4a03.yml`
- Modify: `SELF-IMPROVEMENT.md`
- Modify: `progress.md`

**Interfaces:**
- Produces: deploy-time connection-string wiring, CSP allowlist for regional Azure ingestion, a 30-day retention/RBAC checklist and KQL dashboard queries.

- [ ] Add tests/inspection for configuration and run the entire Vitest suite.
- [ ] Run lint, typecheck and `npm run build:paper`.
- [ ] Serve the production build and verify first visit, decline, accept, revoke, PT/EN, Library image viewer and game image viewer with Playwright on desktop and mobile.
- [ ] Inspect screenshots and console/network logs, append evidence to `progress.md`, then commit the verified iteration.

