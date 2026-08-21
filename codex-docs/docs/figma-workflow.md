# Figma-to-Code Workflow

## Principle

The supplied Figma design is sacrosanct. Implementation is translation, not redesign.

## Before coding

1. Open the exact Figma node from the task.
2. Confirm whether it is a component, instance, variant, or composed page section.
3. Inspect relevant properties, auto-layout, constraints, variables, text styles, effects, and assets.
4. Identify reused design-system elements before creating new CSS.
5. Record configurable content separately from fixed visual structure.
6. Check nearby variants and the intended responsive context.

Do not infer the target from a similarly named frame when an exact node is supplied.

## Translation map

| Figma concept | Code representation |
| --- | --- |
| Variables | CSS custom properties in `tokens.css` |
| Text styles | Tokens/classes in `typography.css` |
| Auto-layout | Flexbox or Grid |
| Component | Reusable HTML/CSS/JS module |
| Component property | JSON field, `data-*` attribute, or documented JS option |
| Variant | Semantic modifier/state, not duplicated component code |
| Image fill | External optimized image asset |
| Detailed vector | External SVG asset |
| Prototype link | Semantic anchor or button behavior |

## Fidelity checklist

Compare:

- frame dimensions and aspect ratio;
- content order and alignment;
- padding, gaps, and optical spacing;
- font family, size, weight, line height, tracking, and case;
- fill, stroke, opacity, radius, and shadow;
- rotation and transform origin;
- clipping and overflow;
- layer order;
- image crop and focal point;
- hover, focus, active, and selected states;
- responsive composition.

Do not call a result pixel-perfect without rendering and comparing it.

## Variables and tokens

Use an existing semantic token whenever it accurately represents the Figma variable’s role. If Figma introduces a reusable value that is missing in code:

1. add or reuse a primitive;
2. add a semantic alias;
3. use the semantic alias in components;
4. document the addition in `design-system.md`.

Do not hard-code a Figma value into several component files.

## Assets

- Export maps, dotted artwork, and detailed illustrations as SVG when appropriate.
- Keep large SVG markup out of HTML.
- Preserve view boxes and aspect ratios.
- Optimize without visibly changing geometry or palette.
- Export photographs at a suitable resolution and modern format.
- Keep meaningful asset filenames stable.
- Record content-specific alternative text in country data.

## Fixed versus responsive geometry

Some Pareto Travel artifacts deliberately mimic physical objects and may require precise positioning. Preserve those internal relationships while allowing the overall component to scale or reflow.

Use:

- Grid/Flexbox for page and ordinary content structure;
- absolute positioning for deliberate layers and rotations inside a bounded component;
- `aspect-ratio` for square maps and polaroid images;
- custom properties for configurable angles, sizes, or durations.

## Responsive derivation

If Figma supplies multiple viewport designs, implement those states faithfully. If it supplies only one:

1. preserve the main hierarchy;
2. identify the width where content collides or becomes unreadable;
3. introduce the smallest necessary reflow;
4. avoid arbitrary device-specific breakpoints;
5. verify realistic long content.

Record any material interpretation in the final handoff.

## Updating Figma from code

When asked to update the Figma component after code changes:

- preserve the established component and variant structure;
- reflect only approved behavior and visual changes;
- work on the page or node specified by the user;
- do not overwrite unrelated frames;
- verify component properties and instance behavior after the change.

## Handoff

For Figma-derived implementation, report:

- files created or changed;
- component inputs and mounting method;
- assets required;
- responsive behavior implemented;
- interaction and reduced-motion behavior;
- validation performed;
- any remaining visual discrepancy or assumption.
