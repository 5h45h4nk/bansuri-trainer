# GenUI Concierge

Small prototype for an adaptive interface that asks what the user wants to do and generates a purpose-built UI on the fly.

## Run

Open [`index.html`](/Users/shashanksrinivas/Documents/Codex/genui/index.html) in a browser.

## What it does

- Takes a natural-language task prompt.
- Classifies the prompt into a workspace type like travel planning, project tracking, comparison, study planning, or meeting prep.
- Renders a fresh interface with forms, timelines, checklists, summaries, and quick metrics.
- Falls back to a generic adaptive workspace when the request does not match a preset intent.

## Next step if you want real AI generation

Replace the local `intentLibrary` logic in [`app.js`](/Users/shashanksrinivas/Documents/Codex/genui/app.js) with a model call that returns a UI schema, then render that schema through the existing `renderGeneratedWorkspace()` flow.
