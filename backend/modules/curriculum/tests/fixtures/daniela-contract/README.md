# Pinned Learning consumer schemas

These three TypeScript files are exact, unmodified copies from Daniela's newest
published Learning branch at inspection time:

- Branch: `origin/feat/learning-policy-freeze`
- Commit: `43062843460aefb3d10646f007f96607fa544e8c`
- Source paths and SHA-256 digests: `provenance.json`

They are test fixtures, not production schemas or instructions. Relative imports
between the copied schemas are preserved, including Learning's own citation
schema. Person 1's implementation is checked against these consumer definitions
rather than validating only against its own stronger local citation rules.
The checksum test prevents accidental edits to the snapshots.

The branch was selected by the most recent commit timestamp among the fetched
`feat/learning-*` and `test/learning-*` refs authored by DaniCasen. This does not
establish which branch Daniela has checked out locally.

The fixtures need no network access at test time. To refresh them, fetch first,
inspect the selected commit and contract changes, then copy the original
`shared/src/common.ts`, `shared/src/curriculum.ts`, and
`shared/src/learning-curriculum.ts` here using `git show <commit>:<path>`.
Record the new source SHA and checksums, review differences with Daniela, and run
`learning-handoff.test.ts`. Do not reformat the original fixture files or promote
them into shared exports. The root format check currently accepts their original
formatting.

The integration test checks the one-argument retrieval port shape, requests,
responses, concept definitions, real citation links, and the evidence projection
used by Learning. It does not execute Daniela's full LearningService, assessments,
mastery calculations, model calls, or routes.

Question-ID-only hints now have an explicit Person 1 policy: the exact query
`Hint for question <id>` selects approved evidence using the supplied concept ID,
not lexical matches against the question ID. The question ID remains opaque;
Person 1 does not validate assessments or infer question-to-concept relationships.
Tests cover the three concepts, normal lexical behavior, source/access boundaries,
and the unchanged consumer response schema. The full Learning hint service and
its no-answer-reveal behavior still need an end-to-end test with Daniela.
