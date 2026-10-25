# Person 1 → Daniela service integration

Verified against the latest published Learning branch found after fetching:
`origin/feat/learning-policy-freeze`, commit
`43062843460aefb3d10646f007f96607fa544e8c`.

## Run from the repository root

```sh
git fetch origin
node backend/modules/curriculum/scripts/test-daniela-integration.mjs
```

Use Node 22 with pnpm 9 available. To reproduce this exact revision, append the
full commit SHA above to the command. The runner resolves the ref once, prints
its SHA, builds current Person 1 dependencies, extracts Daniela's Shared and
Learning sources into a temporary directory, compiles them, and runs the tests.
It uses installed dependencies without installing tools or switching branches.
The temporary checkout is removed on success or failure. No environment files,
Supabase credentials, network model calls, commits, or remote database writes are
needed. A fetch is read-only and is performed separately by the user.

The normal `tests/*.test.ts` suite remains usable without this temporary checkout.
The service tests live in `tests/daniela-service.integration.mjs` and require the
runner's environment. They invoke actual LearningService methods, not a copied
service or schema-only consumer.

## Verified behavior: six passing tests

- Lessons for rectangle area, triangle base/height, and triangle area use the
  agreed IDs and Daniela's existing Mathematics UUID aliases.
- Returned chunk text and citations validate against Person 1's source dataset.
  Learning forwards that exact evidence to its tutor and exposes source IDs.
- Actual assessment question IDs for all three concepts produce supported hints
  through Learning's `Hint for question <id>` query. The deterministic tutor
  returns cited hints without the tested numeric answers. Lessons and hints do
  not grant mastery.
- Follow-up messages retain the concept and return grounded citations.
- Unknown concepts, unavailable English Geometry content, unmatched queries,
  version mismatches, and unready materials yield unsupported responses without
  calling the tutor. Person 1 access denial remains an error.
- Learning rejects mismatched question/concept hint requests before retrieval,
  and rejects tutor citations with chunk IDs outside retrieved evidence.

## Limits and Learning-side observations

This exercises real Learning orchestration with its in-memory repositories,
assessment bank, and deterministic MockTutorProvider. It does not test HTTP route
wiring, Supabase, live Gemini output, persistence, or the browser. No Learning,
World, Platform, or shared production files are changed by the test.

Geometry source lessons currently exist in Spanish, so explicit English requests
correctly return `no_approved_content` rather than an invented translation.

Daniela's `sendSessionMessage` and `requestHint` do not forward a locale. Person 1
therefore uses its source locale default for those requests; the test does not
claim a language preference persists between turns.

The deterministic mock hint uses the same triangle/rectangle sentence for every
concept. Retrieval is concept-correct, but concept-specific hint pedagogy and
live-model answer leakage need Learning-owner validation. `revealsAnswer: false`
is not a general proof that every possible generated hint is answer-safe.

The citation-rejection test checks invented chunk IDs. It is not a comprehensive
security audit of every citation field or Learning session boundary.

## Message for Daniela

Your published LearningService works with our Geometry adapter for all three
concepts, including real question-ID hint requests. Lesson text and citations
reach your tutor unchanged. Unsupported content stays unsupported, and reading
lessons/hints does not grant mastery. Six service integration tests pass. We used
your deterministic tutor, so live model behavior and production wiring remain
separate checks. Follow-up/hint locale persistence and the generic mock hint
wording remain on the Learning side. No changes were made to your files.
