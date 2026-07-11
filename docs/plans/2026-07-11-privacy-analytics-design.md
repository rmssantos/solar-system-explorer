# Privacy-first product analytics and scientific media design

## Outcome

The public Azure Static Web App gains useful product analytics without tracking children by default. Telemetry starts only after an explicit PT/EN choice, can be revoked at any time, and never includes names, free-text search terms, pointer coordinates, exact flight coordinates, quiz answers, persistent user identifiers, or session replay.

## Architecture

`src/analytics/consent.js` owns a versioned local consent preference. `src/analytics/eventCatalog.js` is the only route into analytics and allowlists event names/properties. `src/analytics/applicationInsights.js` lazy-loads the official browser SDK only after consent and only when a Vite connection string exists. `src/analytics/siteAnalytics.js` renders the shared paper-style consent UI, provides privacy controls, records safe page views and delegates semantic events from each surface.

The production connection string is injected at build time as `VITE_APPLICATIONINSIGHTS_CONNECTION_STRING`. It is an ingestion routing identifier, not an application secret, but remains absent in local/test builds unless deliberately configured. Application Insights cookies, automatic route tracking, fetch/AJAX correlation, automatic exceptions and offline browser buffering are disabled. Only manually declared events are sent. The Azure resource must retain default IP masking; raw IP storage must never be enabled.

## Event vocabulary

- `page_view`: sanitized route (`home`, `game`, `library`, `privacy`) and language.
- `navigation_click`: destination and surface.
- `library_filter`: category, discovery state and result count.
- `library_search`: result-count bucket only; never the query.
- `object_open`: stable object key, category and surface.
- `image_open`: stable object key and surface.
- `source_open`: provider family and surface.
- `quiz_result`: stable quiz id, correct boolean and attempt bucket.
- `mission_event`: stable mission id and state.
- `autopilot_event`: stable target key and state.
- `language_change`, `privacy_choice`, `error_event`: small bounded enums only.

## Consent and transparency

On first visit a compact paper card explains that optional anonymous usage metrics help improve the expedition. “Decline” and “Allow metrics” have equal visual weight. A link opens a dedicated bilingual privacy page. A persistent “Privacy” control in each footer reopens settings. Declining stores only the choice itself. Revoking unloads future telemetry and clears SDK cookies if any exist.

Because the product targets children, wording is short and direct and the policy advises a parent/guardian to make the choice. This implementation reduces data collection but is not a substitute for the operator's legal assessment, records of processing, DPA review and verified contact details.

## Scientific media

NASA search responses already contain `nasa_id`. The service will convert it to the human-readable `https://images.nasa.gov/details/<id>` page and store that URL with cached data. Existing verified local catalog sources remain unchanged. The API JSON URL remains an internal request detail and is never presented as the public source.

Clicking the real photograph in either the Library detail or in-game notebook opens an accessible same-page lightbox. It traps neither the user nor the game permanently: close button, Escape and backdrop click all close it, and focus returns to the triggering image. The image is a button with an explicit localized label.

## Measurement and retention

Recommended production retention is 30 days for raw logs, with monthly aggregate exports if longer trends are necessary. Separate production from preview/staging resources. Review the event dictionary quarterly, delete unused fields, restrict Azure RBAC, and never enable raw IP persistence. A KQL query pack will answer visits, routes, object interest, funnel progression, filters, image/source engagement, missions, autopilot usage and client errors.

