# Architectural Decisions

This is a lightweight decision log. Record choices that affect multiple components, future data, public interfaces, or repository structure. Do not use it for routine implementation notes.

## How to add a decision

Copy this template to the top of the decision list:

```markdown
### ADR-XXX — Short decision title

- Date: YYYY-MM-DD
- Status: Proposed | Accepted | Superseded

Context:
What problem or constraint required a decision?

Decision:
What did we choose?

Consequences:
What becomes easier, harder, or constrained?

Alternatives considered:
- Alternative and why it was not chosen.
```

## Decisions

### ADR-006 — Generate committed static country entry pages

- Date: 2026-09-05
- Status: Accepted

Context:
The landing page establishes `/countries/<slug>.html` as the public URL shape,
while a plain static server cannot rewrite many paths to one HTML document. The
country page must remain reusable and the repository should not require a
runtime server or frontend build framework.

Decision:
Keep `src/pages/country.html` as the single authored template. Generate and
commit one `src/countries/<slug>.html` entry for each country whose
`country.json` has `status: published`. Each entry declares its generated slug;
the controller validates that slug against its country document before
assigning component data sources.

Consequences:
Public URLs work on a basic static server and contain useful fallback HTML and
SEO metadata. Contributors must rerun the standard-library Python generator
when published country metadata or the shared template changes. Generated
files must not be edited directly.

Alternatives considered:
- Query-string URLs such as `/pages/country.html?country=mexico`: rejected
  because they would replace the public URL pattern already used by the site.
- Host-specific rewrite rules: rejected because there is no production host
  configuration and local behavior should match deployed static behavior.
- Handwritten country pages: rejected because duplicated markup would drift.

### ADR-001 — Use a reusable, data-driven country page

- Date: 2026-08-21
- Status: Accepted

Context:
Pareto Travel contains repeated country sections such as budgets, itineraries, annual dials, navigation, cuisine, and maps. Duplicating a complete HTML page per country would make fixes and design changes expensive and inconsistent.

Decision:
Use one reusable country-page template and supply country-specific content through JSON. Keep reusable section behavior in components.

Consequences:
Component and data contracts must remain stable. Country content can be added without copying page markup. The site must be served over HTTP for JSON fetches.

Alternatives considered:
- One handwritten HTML page per country: rejected because shared changes would require repeated edits.
- A frontend framework: deferred because vanilla HTML, CSS, and JavaScript currently meet the project’s needs and support the learning goal.

### ADR-002 — Keep component content separate from presentation

- Date: 2026-08-21
- Status: Accepted

Context:
Components need to support multiple countries and variants without copying code.

Decision:
Store editorial content and constrained component configuration in JSON. Keep markup generation and behavior in HTML/JavaScript, and visual rules in CSS.

Consequences:
Data shapes become public contracts. CSS should not contain content, and JSON should not contain arbitrary HTML or CSS declarations.

Alternatives considered:
- Hard-code content into component JavaScript: rejected because it prevents reuse.
- Store HTML fragments in JSON: rejected because it mixes concerns and increases security and editing risks.

### ADR-003 — Use external assets for detailed SVG artwork

- Date: 2026-08-21
- Status: Accepted

Context:
Country maps and dot artwork can produce thousands of SVG lines when embedded directly in HTML.

Decision:
Export approved vectors as standalone SVG files and reference them from HTML or JSON.

Consequences:
HTML remains readable and cacheable assets can be reused. Styling internal SVG elements from page CSS is limited unless the asset deliberately exposes that capability.

Alternatives considered:
- Inline every SVG: rejected for detailed artwork because it overwhelms page markup.

### ADR-004 — Avoid a frontend framework by default

- Date: 2026-08-21
- Status: Accepted

Context:
The project should remain easy to learn and its present component needs can be met with web standards.

Decision:
Use semantic HTML, CSS, vanilla JavaScript, and JSON. Require an explicit decision before adding a framework, bundler, or dependency.

Consequences:
Component contracts and lifecycle behavior must be implemented deliberately. The repository stays lightweight and transparent.

Alternatives considered:
- Astro, React, Vue, or another framework: not ruled out permanently, but not justified by the current scope.

### ADR-005 — Treat accessibility as part of fidelity

- Date: 2026-08-21
- Status: Accepted

Context:
Purely visual translation can lose keyboard behavior, semantics, focus states, and reduced-motion support.

Decision:
Implement accessible semantics and interaction as part of matching the intended design, including visible focus, keyboard operation, alternative text, and reduced-motion handling.

Consequences:
A component is not complete when it only resembles the static frame.
