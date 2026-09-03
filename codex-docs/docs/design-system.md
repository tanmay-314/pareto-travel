# Design System

## Source of truth

The Pareto Travel Figma file is the visual source of truth. Use the exact task-specific node when translating a design. Existing CSS tokens and component implementations are the code source of truth unless a task explicitly updates them from Figma.

Figma file ID: `IBbYsd9B2ZHOq7NXfEUhtL`

## Visual character

Pareto Travel uses an editorial travel aesthetic with:

- warm cream surfaces;
- plum as a primary accent;
- soft plum for supporting treatments;
- teal as a complementary accent;
- grid- and dot-based maps, artwork, and icons;
- intentionally composed, occasionally rotated physical-object metaphors such as receipts, polaroids, and passport stamps.

Preserve this language. Do not replace it with generic cards, shadows, gradients, or rounded SaaS-style UI unless Figma explicitly shows them.

## Color tokens

Known primitives:

| Role | Value |
| --- | --- |
| Cream | `#FEFCF3` |
| Plum | `#85586F` |
| Soft plum | `#F0DBDB` |
| Teal | `#588584` |

Use the actual names already defined in `styles/tokens.css`. The table documents values, not permission to rename existing variables.

Prefer a two-level system:

```css
:root {
  /* Primitive */
  --color-cream: #fefcf3;
  --color-plum: #85586f;

  /* Semantic */
  --color-background-page: var(--color-cream);
  --color-text-accent: var(--color-plum);
}
```

Components should usually consume semantic tokens such as background, text, border, icon, accent, map, or artwork roles.

## Typography

Known type families:

| Usage | Family |
| --- | --- |
| Display and established headings | Bitcount Grid Single |
| Body and interface text | Instrument Sans |

Use `typography.css` for font loading, global type tokens, and reusable type classes. Match Figma casing, tracking, font weight, line height, and text decoration.

Do not emulate a missing font by changing letter spacing until font loading has been verified.

## Spacing and sizing

- Reuse existing spacing and sizing tokens where they exist.
- Match Figma measurements for component geometry.
- Prefer fluid outer page gutters with deliberate component dimensions.
- Do not round arbitrary measurements merely to make CSS look cleaner.
- Use `clamp()` only when it preserves the intended interpolation between verified states.

## Dot-art system

- Preserve the established grid and ellipse logic of supplied artwork.
- Country dot maps may use 6 × 6 px ellipses filling 6 × 6 px cells when that is the established asset style.
- Color dot artwork should preserve the source palette through the project’s approved quantization workflow.
- Use external SVG assets for production rather than embedding thousands of ellipse elements into HTML.
- Do not resample or regenerate approved artwork unless requested.

## Icons and hierarchy

Communicate meaning through more than color alone. Size, weight, labeling, position, or shape may supplement color where the Figma system establishes it. Maintain a legible hierarchy without allowing icon-scale differences to distort nearby layout.

## Interaction states

Every interactive component should define:

- default;
- hover, when a pointing device is available;
- keyboard focus;
- active/pressed where relevant;
- current/selected where relevant;
- disabled only when a disabled state is genuinely needed.

Focus must remain visible. Hover must not be the only indication of interactivity.

## Motion

- Motion should reinforce the artifact metaphor rather than distract from reading.
- The annual dial ring may rotate continuously while labels remain upright.
- Avoid animation that changes document flow.
- Provide a `prefers-reduced-motion: reduce` alternative.
- Do not add motion not present in the design or explicitly requested.

## Responsive interpretation

Responsive work should preserve composition, hierarchy, and readability—not merely shrink desktop geometry.

- Keep square artwork square.
- Allow editorial compositions to reflow intentionally.
- Check long place names, currency values, and multi-line labels.
- Avoid clipping rotated elements at narrow widths.
- Confirm that interactive targets remain comfortably operable.

## Accessibility review

- Check contrast for cream, soft plum, plum, and teal combinations.
- Use semantic controls and landmarks.
- Provide informative alternative text for meaningful travel imagery.
- Keep decorative dot art silent to assistive technology when it adds no content.
- Never turn editorial copy into an image merely to match Figma.

## Adding a token

1. Confirm the value is not already represented.
2. Decide whether it is primitive, semantic, or both.
3. Add it to `tokens.css` using the existing naming system.
4. Replace relevant repeated literals only within the requested scope.
5. Check every changed component visually.
6. Update this document if the token expands the design language.
