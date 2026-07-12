# Azure Application Insights rollout

This runbook connects the production Paper Solar Explorer to privacy-first product metrics. The current Azure Static Web App is `solar-system-explorer`, in resource group `solarsystem`, region **West Europe**, subscription `Visual Studio Enterprise Subscription`.

## Data boundary

The browser SDK is optional and does not load before consent. Cookies, automatic fetch/AJAX collection, automatic exceptions, route tracking and browser session buffering are disabled. Custom events pass through a strict allowlist. Never add names, email addresses, search strings, quiz answer text, pointer coordinates, precise ship coordinates, URLs with personal values or session replay.

Keep Azure's default IP masking. Do **not** set `DisableIpMasking` to `true`. Azure temporarily sees the sender IP to receive the HTTPS request and derive broad location, then stores `0.0.0.0`; this still requires transparency and a lawful assessment. The public privacy notice intentionally describes this in plain language.

## Create the European resources

Run with the already selected Azure subscription:

```powershell
az monitor log-analytics workspace create `
  --resource-group solarsystem `
  --workspace-name solar-system-explorer-logs `
  --location westeurope `
  --retention-time 30

$workspaceId = az monitor log-analytics workspace show `
  --resource-group solarsystem `
  --workspace-name solar-system-explorer-logs `
  --query id -o tsv

az monitor app-insights component create `
  --app solar-system-explorer-insights `
  --location westeurope `
  --resource-group solarsystem `
  --workspace $workspaceId
```

In Azure Portal, set the Log Analytics workspace daily cap to a deliberately small value appropriate for expected traffic, configure a budget alert, keep retention at **30 days**, and give dashboard readers only `Monitoring Reader` / `Log Analytics Reader` access.

## Inject the frontend routing identifier

Application Insights connection strings are browser-visible routing identifiers, not passwords. Keeping it as a GitHub Actions secret prevents accidental reuse and keeps environment configuration out of source:

```powershell
$connectionString = az monitor app-insights component show `
  --app solar-system-explorer-insights `
  --resource-group solarsystem `
  --query connectionString -o tsv

$connectionString | gh secret set VITE_APPLICATIONINSIGHTS_CONNECTION_STRING `
  --repo rmssantos/solar-system-explorer
```

The production workflow exposes that value only to the release-tagged `npm run build:paper` deployment. Pull-request previews, forks and local builds remain telemetry-free no-ops even when a reviewer accepts the consent card.

## Consent QA before merge

1. Open a fresh private window and inspect Network. No request to an `applicationinsights.azure.com` or `visualstudio.com` host may occur before a choice.
2. Select **Decline**. Navigate through Home, Library and Game. No telemetry request may occur and the entire experience must remain available.
3. Reopen **Privacy settings**, select **Allow metrics**, and confirm one page view plus bounded custom events arrive.
4. Search the Library for a distinctive phrase. Confirm the event contains only a result-count bucket, never the phrase.
5. Turn metrics off. Confirm subsequent interactions generate no telemetry.
6. Confirm PT/EN copy and controls have equal behavior on desktop and mobile.

## Operational review

- Use `docs/analytics/product-queries.kql` for the initial workbook.
- Review event names/properties and RBAC quarterly.
- Keep production and PR/staging telemetry in separate resources if preview telemetry is later enabled.
- Purge data through the Log Analytics/Application Insights deletion workflow if legally required.
- Before commercial launch, replace the GitHub issue contact with the controller's verified privacy email and have the notice reviewed for the actual operator, audience and jurisdictions. This implementation is privacy engineering, not legal advice.
