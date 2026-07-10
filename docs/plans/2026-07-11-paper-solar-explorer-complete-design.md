# Paper Solar Explorer — Complete Vertical Slice Design

## Product thesis

Paper Solar Explorer is a calm third-person 360-degree space journey for children and families. The playable universe is a polished low-poly paper diorama; scientific learning uses real photography, sourced facts and current orbital data. These two layers must reinforce each other without pretending that the compact game world is physically to scale.

The experience has one clear loop: **spot → approach → explore → learn → answer → continue**. Flying remains uninterrupted and low-chrome. Rich content appears only when the player chooses to open the field notebook near a body or spacecraft.

## World scope

The complete slice contains the Sun, eight planets, the Moon, ISS, Hubble and one deep-space probe marker. Planet positions can be refreshed from JPL Horizons and normalized into a legible playable layout. Natural scale, diameters and distances are always shown numerically in the notebook; visual sizes and travel distances are explicitly labeled “escala de jogo”.

Each body uses the approved closed low-poly paper language. Distinct silhouette and palette matter more than surface detail. Space uses quiet regions, clustered stars, subtle nebula cards, sparse asteroids, one comet and a few authored objects of discovery.

## Learning notebook

The notebook opens with four compact sections:

1. **Descobrir** — name, type, one strong fact and a real local NASA/ESA photograph.
2. **Medir** — radius, day, year, temperature, moon count and real average distance.
3. **Hoje** — refreshed data, source, timestamp and whether the value is live, cached or fallback.
4. **Desafio** — one reused quiz question with immediate explanation, retry and persistent completion.

Local photographs and facts from the original project are the guaranteed baseline. NASA Images can enrich the selected object with current imagery and metadata, but never replaces content with an empty/loading-only state. Every remote image retains title, date, NASA ID/center when present and a clickable source.

## Dynamic-data architecture

`spaceDataService` is an adapter with dependency-injected `fetch`, clock and storage. Every provider returns a normalized envelope:

```js
{
  status: 'live' | 'cached' | 'fallback',
  source: { name, url },
  updatedAt,
  data
}
```

- **NASA Images** — real imagery and metadata; client-side CORS is officially supported.
- **NASA APOD** — optional daily discovery card using `DEMO_KEY` by default and a configurable key for production.
- **JPL Horizons** — daily heliocentric vectors for the Sun/planets; normalized for the game scene.
- **CelesTrak GP/OMM** — ISS and Hubble orbital elements, cached for at least two hours in accordance with provider guidance.

Requests have timeouts, schema validation and stale-while-revalidate behavior. The core game never depends on network success. No API response is inserted as HTML.

## Satellite truth and game representation

ISS and Hubble use current OMM elements propagated with SGP4. The notebook shows the epoch and calculated altitude/position timestamp. Their low-poly in-game markers are placed relative to Earth at an exaggerated visible distance. The UI says “posição orbital calculada” and “distância visual ampliada”; it never claims the rendered separation is real scale.

JPL positions receive the same treatment: the direction and date can be real, while orbital spacing is normalized. A provenance chip distinguishes `AO VIVO`, `CACHE` and `DADOS INCLUÍDOS`.

## State and progression

Pure state owns discovered objects, notebook section, quiz answers, mission progress and data freshness. Three.js owns only presentation. DOM owns notebook and controls. Discovery progress persists locally under preview-specific keys and does not overwrite the original game's save.

The initial mission is a guided three-stop journey: Earth → ISS/Hubble → Saturn. Completing it unlocks free exploration and the complete field guide. There is no punishment, timer or combat. Wrong quiz answers explain and invite another attempt.

## Accessibility and performance

- Keyboard, pointer and touch parity.
- Visible focus, semantic dialog/tabs, 44px mobile targets.
- Reduced-motion disables ambient drift and transitions, not essential state changes.
- Local images define dimensions to avoid layout shift.
- Remote images lazy-load and fail back to local assets.
- No mandatory bloom; lighting and color do the work.
- Remote calls are bounded and cached; CelesTrak is never polled continuously.

## Success criteria

- All nine major bodies have recognizable low-poly silhouettes and complete learning records.
- Sun, Earth, Saturn, ISS and Hubble can be explored end-to-end in desktop and mobile playtests.
- A player can view a real photo, read sourced current data and complete a quiz without leaving the notebook.
- Network failure produces a complete offline experience with an honest status label.
- Camera-relative movement remains authoritative and regression-tested.
- Full tests, lint, typecheck and both builds pass with no new browser errors.

## Primary sources

- NASA Open APIs: https://api.nasa.gov/
- NASA Images API: https://images.nasa.gov/docs/images.nasa.gov_api_docs.pdf
- JPL Horizons API: https://ssd-api.jpl.nasa.gov/doc/horizons.html
- CelesTrak GP data: https://celestrak.org/NORAD/documentation/gp-data-formats.php

