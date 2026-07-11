# Paper Solar Explorer — Heliocentric Self-Improvement Design

## Product thesis

Paper Solar Explorer is a calm, exploratory science game for children, families, and classrooms. It should feel like opening a hand-built astronomical atlas and then flying inside it. The player is not asked to master a simulator; they are invited to notice scale, movement, and relationships, collect knowledge, and build a personal expedition record.

The main product surface is split in two:

- `/` is an editorial homepage. Its single job is to explain what the experience is, who it is for, what can be discovered, and then start the game.
- `/jogo.html` is the focused WebGL game. It loads Three.js and the scientific data services only after the player chooses to enter.

This separation keeps the homepage fast and legible, gives parents and educators trustworthy context, and prevents landing-page content from fighting the flight HUD.

## Chosen orbital model

The current diagonal chain of static anchors and stitched line is removed entirely. Every primary body is positioned from a heliocentric orbital definition:

- semi-major axis in astronomical units;
- orbital period in Earth days;
- eccentricity;
- inclination;
- longitude/phase at a fixed epoch.

The visual radius uses a logarithmic compression of semi-major axis. This preserves the ordering and the dramatic gap between the inner and outer planets without making the game unplayably empty. Planet sizes remain intentionally enlarged and are explicitly described as such in the UI.

The initial orbital phase is deterministic and based on a date. When JPL Horizons vectors are available, they can update the phase/direction and scientific notebook data. The shipped orbital elements remain the authoritative offline fallback. The game clock advances slowly enough to show that the system is alive, but not so fast that targets run away from the player.

Orbit paths are independent, very subtle ellipses centered on the Sun. They can be hidden by the player. There is never a polyline connecting one planet to another.

Natural satellites orbit the current dynamic position of their parent. Human objects and small bodies either follow propagated data, a parent-relative orbit, or a stable heliocentric definition. Collision and interaction volumes consume the same current-position snapshot used by rendering; no system may continue using stale static anchors.

## Navigation and scale communication

The existing mission beacon remains, but its data source changes to the dynamic object registry. It provides:

- a 360-degree arrow derived from the rendered camera basis;
- the target name;
- current distance in compressed diorama units;
- the target’s average solar distance in UA or million kilometres;
- an “at target” state when interaction is possible.

The arrow is mission-specific. Free exploration does not fill the screen with labels. A compact orbit toggle and a small atlas/map action are available, but the playfield stays dominant.

## Homepage direction

The homepage resembles an expedition folder laid on deep-blue paper, not a generic SaaS landing page.

Palette:

- Midnight ink `#0b132b`
- Observatory blue `#16264a`
- Manila paper `#f0dfac`
- Solar gold `#f4bd4f`
- Signal coral `#e7634f`
- Patina teal `#72aaa2`

Typography reuses the game’s rounded display voice for titles, a calm humanist sans for reading, and a compact mono/data face for measurements. The signature element is a wide original illustration of the paper courier crossing a true heliocentric orrery, partially breaking out of a torn-paper viewport.

Structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ wordmark       Para famílias · Para escolas       Entrar   │
├─────────────────────────────────────────────────────────────┤
│ headline + promise       torn-paper heliocentric hero       │
│ age/audience strip       courier + guide + orbiting worlds  │
├─────────────────────────────────────────────────────────────┤
│ what you do: fly / discover / learn / collect              │
├─────────────────────────────────────────────────────────────┤
│ real science provenance + included/offline behavior         │
├─────────────────────────────────────────────────────────────┤
│ expedition rewards + family/classroom invitation            │
└─────────────────────────────────────────────────────────────┘
```

One orchestrated page-load motion assembles paper layers; remaining motion is restrained and honors `prefers-reduced-motion`.

## Guide, surprises, and content

An original guide character, **Lumi**, is a small paper observatory robot with a brass telescope eye and folded star-map ears. Lumi appears on the homepage and in short in-game transmissions. Lumi never blocks flight and never talks continuously.

Surprises are contextual discoveries rather than arbitrary popups:

- a comet crosses the field and leaves a collectible observation;
- a historic radio signal unlocks a short story;
- a probe postcard appears near its mission destination;
- a meteor shower creates a timed visual event;
- a data capsule asks a one-question micro challenge;
- a rare golden paper star awards an expedition seal.

The director enforces a long cooldown, does not trigger during notebooks/dialogs, and avoids repeating a completed surprise until the cycle is exhausted. Every surprise has a deterministic fallback so tests and classrooms can reproduce it.

## Gamification

The reward system measures meaningful learning actions:

- discovery: 20 XP;
- correct quiz: 35 XP;
- surprise observation: 15 XP;
- mission completion: 100 XP;
- complete planetary family: bonus seal.

Rewards are not purchasable and do not use streak pressure. Progress unlocks:

- paper passport stamps for worlds;
- medals for themed sets;
- trophies for major campaigns;
- guide postcards and ship color accents.

The mission log becomes an **Expedition Passport** with Missions, Collection, and Awards sections. Progress is versioned and migrated from the current discovered/quiz storage. Duplicate events never grant XP twice.

## Art pipeline

Two original raster assets are generated and committed:

1. wide homepage hero: courier, Lumi, and heliocentric paper orrery with negative space for copy;
2. Lumi character portrait/cutout for transmissions and guide cards.

Medals, stamps, orbit icons, and compact HUD symbols are code-native SVG/CSS so they stay sharp and can reflect live state. Real educational photography remains sourced from NASA/ESA/SpaceX with provenance.

## Error handling and accessibility

- Homepage works without WebGL and clearly links to the game.
- Scientific APIs retain cache and offline fallback behavior.
- Dynamic positions fall back to local elements on parse/network failure.
- All dialogs are keyboard accessible; focus is returned to the triggering action.
- Surprise motion and homepage assembly reduce or stop under reduced motion.
- Reward colors are not the only completion signal; text and symbols remain present.

## Verification strategy

- Pure tests cover logarithmic scale, orbital positions, parent-relative motion, dynamic collision registries, waypoint data, surprise cooldowns, reward idempotency, and storage migration.
- Browser playtests cover homepage → game, orbit toggle, camera-relative flight, moving target navigation, discovery → XP → award, surprise completion, persistence, and offline fallback.
- Visual evidence is captured at desktop and 390×844 mobile widths.
- Final audit includes full tests, lint, production build, console, responsive overflow, performance sample, and a requirement-by-requirement check against this document.
