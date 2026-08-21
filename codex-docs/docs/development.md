# Development Workflow

## Setup

This project is intended to work as a straightforward static frontend unless the repository documents additional tooling.

1. Clone or open the repository in VS Code.
2. Open the repository root, not an individual subdirectory.
3. Read `AGENTS.md`, `PROJECT_STATUS.md`, and the relevant guide under `docs/`.
4. Start the repository’s documented local server.
5. Open the browser developer console before testing changes.

If there is no server command, use:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Working with Codex in VS Code

Give Codex the exact task and attach or reference:

- the relevant Figma node URL;
- the affected implementation files;
- the relevant country JSON;
- a screenshot when the mismatch is visual;
- acceptance criteria and anything that must not change.

Useful prompt structure:

```text
Goal:
Implement or fix …

Design source:
<exact Figma node URL>

Files/data involved:
<paths or country slug>

Constraints:
- Preserve …
- Do not change …

Done when:
- …
- …
```

Ask Codex to inspect before editing when the task spans unfamiliar files.

## Branch and change discipline

- Work on a focused branch when using Git.
- Check the working tree before editing.
- Preserve unrelated user changes.
- Keep commits focused on one coherent change.
- Review the final diff before committing.
- Do not include generated temporary files, local server output, or secrets.

## Implementing a component change

1. Locate the root markup, component CSS, component script, and data consumer.
2. Identify the component’s public contract.
3. Compare the current browser rendering with the exact Figma node.
4. Make the smallest coherent change.
5. Test more than one data configuration if the component is reusable.
6. Test keyboard, focus, responsive, and reduced-motion behavior.
7. Update the relevant documentation if the contract changed.

## Implementing a data change

1. Confirm which file owns the fact.
2. Preserve field names and value types.
3. Validate JSON syntax.
4. Test the consuming component.
5. Check optional and missing-value behavior.
6. Update `data-model.md` for any contract change.

## Debugging sequence

Use evidence in this order:

1. browser console errors;
2. failed network requests and incorrect paths;
3. invalid or unexpected JSON;
4. missing DOM mount points;
5. selector and specificity issues;
6. layout constraints and overflow;
7. animation and transform interactions.

Avoid rewriting a component before establishing the failure’s cause.

## Verification matrix

For visual components, check at least:

| Area | Checks |
| --- | --- |
| Content | realistic text, long labels, optional fields |
| Layout | narrow mobile, tablet, laptop, wide desktop |
| Interaction | pointer, keyboard, focus, current state |
| Motion | normal and reduced-motion preference |
| Data | success, missing optional data, malformed required data |
| Assets | path, crop, aspect ratio, alternative text |
| Browser | console and network panel free of new failures |

Use the project’s actual supported-browser list if one is later documented.

## Documentation rule

Documentation and code should change together when public behavior changes. Do not leave a future Codex session to infer a new architecture from implementation alone.

## Handoff format

A useful final handoff says:

- what changed;
- why the implementation fits the existing architecture;
- which files changed;
- how to run and verify it;
- what was actually tested;
- any remaining assumption or known limitation.
