# Low-Poly Paper Universe — Design

## Intent

The preview becomes a calm third-person space exploration diorama. It keeps fully free 360-degree flight, but replaces the current exposed crossed-paper slices with polished, closed low-poly volumes. The reference is the accessibility, silhouette discipline, controlled color and authored calm of *Messenger*—not its walking mechanic or its exact rendering style.

The experience must read immediately at a distance. Detail is earned through composition, lighting, motion and a few recognizable forms rather than texture density. Paper remains the material language: a subtle fiber, a narrow cardboard edge and a graphite-like silhouette. It must never make a planet look broken, hollow or noisy.

## Chosen direction

Three directions were considered:

1. Pure clean low-poly: strongest clarity, but loses the approved paper identity.
2. Literal layered cardboard: strongest craft signal, but repeats the visual fragmentation of the current prototype.
3. Low-poly paper hybrid: closed faceted forms, restrained paper surface and selective handmade seams.

Direction 3 is selected. It satisfies the user's explicit request for a polished modern low-poly world while keeping the cartoon-paper character.

## Visual system

### Palette

- Night ink — `#0b1021`: primary void and outline anchor.
- Deep orbit — `#182742`: soft nebula and shadow fill.
- Paper ivory — `#f2e7c9`: ship body, stars and UI paper.
- Solar ochre — `#e3a63b`: warm focal energy without neon saturation.
- Ocean slate — `#4f8298`: calm Earth water.
- Moss paper — `#6f9064`: Earth land and discovery accents.
- Saturn sand — `#caa36d`: quiet large-form warmth.
- Coral signal — `#cf6652`: sparse interaction and ship accent.

No object should use the whole palette. Each planet receives three to five colors, including its outline.

### Type and HUD

Fredoka remains the restrained display face because its rounded forms match the handcrafted universe. Nunito remains body and utility copy. The normal play state stays low-chrome: one objective chip, one contextual action and transient controls only. The HUD must never compete with the nearest planet.

### Signature

Every major object has an **artisan edge**: a thin dark silhouette plus a shallow warm paper rim. This is the memorable paper cue. Surface fiber is deliberately weak and should disappear before the silhouette does.

## Planet language

All planet bodies use closed icosahedral geometry with deliberate large facets, flat shading and soft light. Details sit above the base as simple secondary forms.

- **Sun:** ochre/gold faceted body, restrained emissive warmth and a sparse uneven corona. No photographic flares.
- **Earth:** slate-blue body, broad moss land plates, two or three ivory cloud ribbons and small pale polar caps. It must read as Earth at thumbnail size.
- **Saturn:** sand body with broad horizontal color bands and one minimal low-poly ring system. The ring silhouette is the primary identifier.

Future bodies follow the same rule: craters are shallow low-sided bowls, mountains are clustered cones, ice is a single contrasting cap, and clouds are separate simple volumes.

## Space and composition

Space is authored rather than filled uniformly. Star clusters, quiet gaps and two broad translucent nebula cards create rhythm. Small asteroid groups, one probe and an occasional comet provide discovery, but only one secondary point of interest should compete with a planet at a time.

The stitched rail is demoted from a navigation line to a subtle target constellation. Free flight must feel free; guidance should suggest, not fence the player in.

## Camera and flight

The camera is a true third-person chase camera. Mouse/touch changes ship yaw and pitch; roll remains fully available. The camera follows the ship quaternion with exponential smoothing and recenters behind it automatically. There is no locked world-up axis during flight.

Forward input is arcade-space steering: while the player holds `W`, accumulated velocity curves quickly toward the current camera/ship forward. When input is released, some drift remains. This produces responsiveness without removing the sensation of space.

Success criteria:

- A 90-degree camera turn while holding `W` aligns velocity with forward within 300 ms.
- Sun, Earth and Saturn remain recognizable in silhouette at desktop and mobile distances.
- No exposed internal slice dominates a planet view.
- HUD does not overlap flight controls at 390×844.
- The scene remains readable without bloom; any bloom added later must be optional and subtle.
- No new runtime errors, non-finite transforms or broken WebGL state.

## Source note

The *Messenger* creators describe the small-world layout, outlines, color commitment and automated camera centering as core accessibility decisions: https://www.commarts.com/webpicks/messenger

