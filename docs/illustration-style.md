# Illustration style (evidence images)

One consistent look for every drawn evidence image, so cases feel like one place: Darwin and the
Top End in the dry season. Images are hand-written SVG, small enough for school Wi-Fi, and free
of real people, brands and licence questions.

## Look

- **Flat shapes with one shade.** Each object is a flat colour plus one darker (or lighter) tone
  of the same hue for its shadow or lit side. No outlines, except thin detail lines (railings,
  window frames, wave crests).
- **Soft gradients only for sky and water.** Everything else is flat.
- **Light tells the time.** Afternoon light is warm and comes from the west (left in most
  scenes), with long soft shadows. Night scenes are deep blue with a few warm lights. Trail
  cameras and CCTV are greyscale or green-grey, with a time overlay and a little noise.
- **People are friendly and simple:** round heads, dot eyes, a small smile or neutral mouth, no
  noses or detailed faces, varied skin tones and hair. Never a real person. Clothing in the
  palette's muted colours. Recurring props keep their colour (Jamie's green backpack, Kai's grey
  hoodie).
- **Local character:** Carpentaria palms, frangipani, red earth, pandanus, mangroves, the low
  Waterfront skyline, tropical dry-season haze, possums, wallabies, frogs. Fictional businesses
  only; a sign has text only when the story needs it (e.g. "Cullen Bay Marina").

## Palette

| Use              | Colours                                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------- |
| Sky (day)        | `#8ec5e6` top → `#f6d9ab` haze near the horizon                                                                 |
| Sun, warm light  | `#ffe2a0`, `#f7b267`                                                                                            |
| Harbour, sea     | `#3d8fb3`, shade `#2f7395`                                                                                      |
| Pool, lagoon     | `#4fc0cf`, shade `#2f9db0`, foam `#e9f8f7`                                                                      |
| Paving, concrete | `#eadfcd`, shade `#d2c4ad`                                                                                      |
| Sand             | `#edd5a5`                                                                                                       |
| Red earth        | `#b5562f`, shade `#8f4325`                                                                                      |
| Palms, trees     | fronds `#2f7a4f` / `#245f3d`, trunks `#8a6a4a`                                                                  |
| Buildings        | walls `#f3efe7` / `#dcd5c8`, glass `#a8cbdc`                                                                    |
| Clothing         | navy `#2d3e66`, coral `#e27a5f`, mustard `#e0b24a`, off-white `#f6f4ef`, Jamie's backpack `#3f8f4f` / `#2e6d3b` |
| Skin tones       | `#8d5a3b`, `#b97d55`, `#e8bf98`, `#f3d4b5`                                                                      |
| Night            | sky `#1d2747` → `#33406b`, warm light `#ffd58a`                                                                 |

## Technical rules

- `viewBox` 800 × 600 for photos (4:3), 800 × 500 for CCTV and trail cameras. Cropped versions
  of a photo reuse the original file with a different `viewBox`.
- `role="img"` and an `aria-label` on the `<svg>`; the case's `alt` text describes what the
  image shows, including anything the story relies on.
- No external references (fonts, images, links). Text uses `font-family="sans-serif"`.
- **Size budget: 24 KB per file** (most are 8 to 16 KB, about a third of that gzipped).
  `src/assets.test.ts` enforces it.
- Simple, hand-editable markup: named groups (`<g id="palm-left">`), round coordinates.
