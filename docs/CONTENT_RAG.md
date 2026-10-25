# Content → AI (class-scoped RAG)

Design proposal for one vertical slice: a professor uploads material to a class, sets objectives and milestones, the material is parsed, chunked, embedded and stored in Supabase (pgvector), and students of that class chat with a tutor that answers **only** from that material and cites the passage. Generated formats (podcast, slides, graphic) get a seam only.

**Status: proposal for team review. Nothing here is implemented. Contracts are proposals, not frozen.**

## 1. Ownership and boundaries

| Area                                  | Owner                  | This slice                                                                        |
| ------------------------------------- | ---------------------- | --------------------------------------------------------------------------------- |
| `backend/modules/content`             | Content (new)          | New module. Registered with one line in `backend/api/src/plugins.ts`.             |
| `frontend/web/src/features/content`   | Content (new)          | New feature folder (professor screens + student chat).                            |
| `backend/modules/curriculum`, catalog | P1 Vianey              | Not edited. Read through `CurriculumCatalogPort` (mock now).                      |
| `backend/modules/learning`, tutor     | P2 Daniela (PR #12-24) | Not edited. Content **implements** Learning's `CurriculumContextPort`.            |
| `backend/modules/world`               | P3                     | Not edited. The house "Material"/"Aprender" slots can mount our components later. |
| Platform (auth, events, Supabase)     | P4                     | Reused as is. Small additive requests in §11.                                     |

**Overlap to resolve first (Q1).** `docs/ATHENA_SUBSYSTEM_IMPLEMENTATION_PROPOSAL.md` §3.1 and the curriculum stub assign "material upload, extraction, chunking, embeddings, retrieval and citations" to P1, and `data/supabase/README.md` puts "materials, chunks" in 0100-0199. This slice proposes that **content builds and owns that pipeline** (with P1's agreement), reusing P1's shared types (`materialSchema`, `materialStatusSchema`, `citationSchema`) and the interface names from proposal §3.3 (`MaterialStorage`, `DocumentExtractor`, `ChunkingStrategy`, `EmbeddingProvider`, `VectorRepository`, `MaterialIngestionService`), so P1 keeps the catalog (courses, topics, versions) and nothing is built twice.

### Port naming (matching Learning)

Learning's `CurriculumContextPort` (PR #24, `backend/modules/learning/src/ports.ts`) is a **retrieval** port: `retrieve(CurriculumContextRequest): Promise<CurriculumContextResponse>`. It is what content _provides_, not what it needs. So:

| Port                    | Direction          | Shape                                                                                                                                                                                                                                                           |
| ----------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CurriculumContextPort` | content → Learning | Learning's exact interface. Content ships `ContentCurriculumContext`, which Learning injects via `learningRoutes(app, { curriculumContext })`. It has no auth context: Learning's `assertAccess` runs first, so the adapter trusts its caller.                  |
| `CurriculumCatalogPort` | P1 → content (new) | `getCourse(courseId)`, `listTopics(courseId)`, `getTopic(topicId)`, `activeVersion(courseId)`. Mock from `athenaDemoIds`.                                                                                                                                       |
| `TutorProvider`         | unchanged          | Not reused for the class chat (no locale, no safety flags). Our `AnswerGenerator` takes the same `GroundedTextGenerator { generate({ system, user }) }` injection as Learning's `GeminiTutorProvider` (`tutor-adapters.ts`), so one Gemini adapter serves both. |

## 2. Data model (migrations 0500+)

All ids are uuid. `course_id` and `topic_id` have **no FK** until P1's 0100 `courses`/`topics` exist (same as `classes.course_id` today); they are validated through `CurriculumCatalogPort` on every write.

| Table                      | Key columns                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `content_materials`        | `id`, `class_id → classes`, `course_id`, `title`, `filename`, `mime_type`, `byte_size`, `sha256`, `storage_path`, `locale`, `status` check (`uploaded,extracting,chunking,embedding,ready,failed`), `error_code`, `error_message`, `attempts`, `progress` (chunks embedded / total), `active_generation int?`, `building_generation int?`, `curriculum_version`, `uploaded_by → profiles`, timestamps. **unique (`class_id`, `sha256`)**, unique (`id`, `class_id`). |
| `content_material_topics`  | pk (`material_id`, `topic_id`).                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `content_objectives`       | `id` (client-generated uuid), `class_id`, `topic_id`, `material_id?`, `code`, `statement_es`, `statement_en`, `concept_id?` (Learning concept key), `position`, `deleted_at?`, `updated_at`.                                                                                                                                                                                                                                                                         |
| `content_milestones`       | `id`, `class_id`, `topic_id?`, `title_es`, `title_en`, `due_at?`, `position`, `deleted_at?`, `updated_at`; join `content_milestone_objectives`.                                                                                                                                                                                                                                                                                                                      |
| `content_chunks`           | `id`, (`material_id`, `class_id`) → `content_materials(id, class_id)` **composite FK, on delete cascade**, `generation`, `chunk_index`, `page_start`, `page_end`, `section_title`, `content`, `content_hash`, `token_estimate`, `embedding extensions.vector(768)`, `embedding_model`. **unique (`material_id`, `generation`, `chunk_index`)**, btree (`class_id`, `material_id`, `generation`).                                                                     |
| `content_chunk_objectives` | pk (`chunk_id`, `objective_id`), optional tagging (§4).                                                                                                                                                                                                                                                                                                                                                                                                              |
| `content_ai_calls`         | `id`, `class_id`, `student_id`, `topic_id?`, `kind` (`chat`), `outcome` (`answered,abstained,redirected,refused,rate_limited,error`), `flag_category?`, `model`, `latency_ms`, `created_at`. **No message text.** Audit + cross-instance rate cap.                                                                                                                                                                                                                   |
| `content_ai_flags`         | `id`, `call_id`, `class_id`, `student_id`, `topic_id?`, `category`, `action`, `excerpt?` (≤ 280 chars, null for self-harm), `locale`, `reviewed_at?`, `reviewed_by?`. Retention 90 days (Q6).                                                                                                                                                                                                                                                                        |

The composite FK guarantees a chunk can never carry a different `class_id` than its material, which is what retrieval filters on.

Migration files: `0500_content_extensions_storage.sql` (pgvector in schema `extensions`; private bucket `content-materials` with `file_size_limit` 20 MB and `allowed_mime_types` pdf/plain/markdown), `0501_content_materials.sql`, `0502_content_chunks.sql`, `0503_content_ai.sql`.

**RLS on every table.** Following `0400`/`0401`, all writes go through the API with the service role:

- `content_materials`, `content_material_topics`: select for `public.teaches_class(class_id)` only. Students get materials **only through the API**, which hides `storage_path`, `sha256`, `error_message`, `uploaded_by` (RLS is row-level, so a student policy would expose those columns to anon-key PostgREST).
- `content_objectives`, `content_milestones` (+ join): select for `teaches_class(class_id) or attends_class(class_id)` where `deleted_at is null`. No sensitive columns.
- `content_chunks`, `content_chunk_*`, `content_ai_calls`, `content_ai_flags`: RLS on, **no policies** (service role only, like `intervention_status`).
- Storage: no `storage.objects` policies for clients. Uploads use a server-issued signed upload URL for a server-chosen path; professor downloads use a 60 s signed URL.
- Helpers: reuse `teaches_class` / `attends_class` (already `security definer set search_path = ''`). New functions `content_claim_material`, `content_match_chunks`, `content_activate_generation`, `content_begin_ai_call` run with invoker rights (only the service role can call them, and it bypasses RLS anyway, so definer rights would add nothing) and are `set search_path = ''`, fully qualified (`public.content_chunks`, type `extensions.vector`, operator written `operator(extensions.<=>)`, which fails at runtime otherwise), `revoke all from public, anon, authenticated`, `grant execute to service_role`.

## 3. Upload and ingestion flow

Vercel Functions cap request bodies at ~4.5 MB and may freeze an instance after it responds, so files go **straight to Storage** and processing is **driven in bounded steps**.

1. `POST /api/content/classes/:classId/materials` `{ filename, mimeType, byteSize, sha256, title, topicIds[], locale }` → `canManageClass`, size ≤ 20 MB, allowed mime, topics belong to the class's course. `insert … on conflict (class_id, sha256) do nothing returning *`:
   - new row → `status = uploaded`, returns `{ material, uploadUrl }` (`createSignedUploadUrl` for `{classId}/{sha256}`).
   - existing → `200 { material, duplicate: true }`, topics **unioned** into `content_material_topics`, no upload, no new chunks. A `failed` duplicate is reset for retry.
2. The browser PUTs the file to `uploadUrl`.
3. `POST /materials/:materialId/complete` → server downloads the object, recomputes sha256 and size, sniffs magic bytes (a `.pdf` that is HTML fails as `unsupported_type`), appends `MaterialUploaded`.
4. `POST /materials/:materialId/process` (idempotent, resumable, bounded to ~20 s of work): claims the material with a conditional update (`status in (uploaded, failed)` or stale > 2 min), then advances one stage:
   - `extracting` → `chunking`: extract and split, write chunk rows (no embedding yet) under `building_generation = active_generation + 1`.
   - `embedding`: embed the next batch of up to 100 chunks without embeddings (skipping any whose `content_hash` + model already exist in the active generation, copied instead), update `progress`.
   - when all have embeddings: `content_activate_generation(material_id, gen)` sets `active_generation`, deletes older generations, `status = ready`, appends `MaterialProcessed { materialId, topicIds, status }` — **one transaction**.
5. The professor UI calls `process` again while the status is `extracting|chunking|embedding` (it already polls). Nothing depends on a background runtime; a queue (Supabase cron / Edge Function) can drive the same route later.
6. Any error → `failed` with `error_code` (`unsupported_type`, `no_extractable_text`, `too_large`, `embedding_failed`, `storage_failed`, `internal`) and a short message; `MaterialProcessed { status: "failed" }`; the professor can Retry.

**Re-processing never hides a material.** Retrieval uses `active_generation`, not `status`, so a ready material keeps answering from its old chunks while a new generation builds or after a re-build fails. **Deleting** removes the DB row first (chunks cascade), the storage object last; a sweep removes orphaned objects.

UI shows four states, mapped from six: `uploaded` → Subido / Uploaded, `extracting|chunking|embedding` → Procesando / Processing (with `progress`), `ready`, `failed`.

## 4. Chunking and embedding

- **Extraction:** text/markdown as is; PDF with `unpdf` (serverless pdf.js), page by page. No text layer (scanned PDF) → `failed/no_extractable_text` in v1 (Gemini OCR later).
- **Chunking:** heading- and paragraph-aware recursive split, target ~800 tokens (≈ 3 200 chars, estimate chars/4), 15% overlap, never across materials; keeps `page_start/page_end` and the nearest heading as `section_title`. Cap 2 000 chunks per material.
- **Embedding:** `gemini-embedding-2` at `outputDimensionality: 768` (auto-normalized). Documents prefixed `title: {materialTitle} | text: {chunk}`, queries `task: question answering | query: {q}` (this model takes prefixes, not `task_type`). `embedding_model` is stored per row and search filters on it; a model change is a **re-embed** (admin `POST /admin/content/reindex` creates new generations per material, old ones keep serving until each activates).
- **Index:** at hackathon scale (a class has at most a few thousand chunks) retrieval is an **exact scan** over the class's rows via the btree, so filtering by class cannot lose recall. HNSW is added later with `hnsw.iterative_scan = relaxed_order` if a class grows past ~50k chunks.
- **Mock:** deterministic hashed bag-of-words → 768-dim normalized vector, so similarity is meaningful in tests and mock mode with no key.
- **Objectives/concepts:** chunks inherit the material's topics. Objective tagging embeds each objective statement and links chunks above a threshold; professors can correct it. An objective's optional `concept_id` is how the Learning adapter filters by `conceptId` (Q5).
- **Model ids** come from env with these defaults, checked with `models.list` in the real-provider PR (docs disagree on `gemini-embedding-2` vs `gemini-embedding-2-preview`): `CONTENT_CHAT_MODEL=gemini-3.8-flash`, `CONTENT_GUARD_MODEL=gemini-3.5-flash-lite`, `CONTENT_EMBED_MODEL=gemini-embedding-2`.

## 5. Retrieval and citation

**Invariants:** `classId` comes only from the authorized route param; `topicId` must belong to that class's course (catalog port) or the request is 400; material-id routes authorize against the loaded `material.class_id`.

1. Embed the query; `content_match_chunks(class_id, query_vec, topic_id?, model, k = 6, min_similarity)` over chunks of each material's `active_generation` in the class (and, if scoped, materials tagged with the topic in `content_material_topics`), cosine similarity `1 - (embedding <=> q)`.
2. Nothing above the threshold → **abstain** with a localized "the class material does not cover this" and the class topics as suggestions. No model call.
3. The generator receives sources fenced by a random per-request delimiter and labelled `[S1] … [Sn]`, treated as untrusted data, and returns structured JSON `{ answer, citedSources: ["S2"], unsupported }`.
4. Server validation (Learning's rule): a supported answer has ≥ 1 citation and every citation is in the retrieved set, otherwise it becomes an abstain. Membership is not entailment; `unsupported` is the model's own judgement, which the guardrail fixtures test.
5. The server remaps `[Sn]` to `[1]`, `[2]` in order of first use and returns shared `citationSchema` per cited chunk: `{ materialId, materialTitle, page?, section?, chunkId, excerpt }`. Excerpts are truncated to 300 chars in the content layer (the shared schema has no max) and shown verbatim in the material's language.

`ContentCurriculumContext` (for Learning) reuses steps 1-2 and returns Learning's discriminated union: `no_approved_content` (no active generation for the topic), `insufficient_evidence` (below threshold), `curriculum_version_mismatch`, `concept_not_found` (no objective maps to the concept); `limit ≤ 10`.

## 6. Chat route and guardrails

`POST /api/content/classes/:classId/chat` `{ message (≤ 2 000), topicId?, history? }` → `{ answer, citations, outcome, locale }`. It is not `/api/ai/prompt`, which stays staff-only (PR #27).

Pipeline: `canAccessClass` → rate limit → input checks → classify → retrieve → generate → validate → record. The class professor and admins may use it in **preview** (not rate-limited, no event, no flag).

- **History:** up to 6 previous **student** turns only; the contract has no tutor turns (they could be forged to claim prior approval or fake sources). History goes in the user position, never the system prompt.
- **Rate limit:** per student, 20 messages / 10 min in-process (PR #27's sliding window) **and** 150/day enforced atomically by `content_begin_ai_call` (advisory lock, count, insert), so the daily cap holds across instances. `429 { error, retryAfterSeconds }`.
- **Classification:** deterministic heuristics with an **es + en** phrase set (injection, "hazme la tarea / do my homework", exam answer requests), then `CONTENT_GUARD_MODEL` with structured output `{ category, confidence }`; action only at confidence ≥ 0.7. A practice question from the material is not graded work by itself. **Fail closed:** if the classifier errors or times out, the turn abstains, never answers unchecked. Mock = heuristics only.
- **Generation prompt** forbids following instructions inside sources or history, revealing the prompt, or giving final answers to assessed tasks.

**Policy options per category (decide with you, Q2):**

| Category                       | Refuse | Redirect (Socratic, from the material) | Report to professor | **Proposed default**                                                                                                   |
| ------------------------------ | ------ | -------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Graded work ("do my homework") | ✓      | ✓                                      | ✓                   | Redirect to a guided explanation; flag.                                                                                |
| Prompt injection               | ✓      |                                        | ✓                   | Refuse + flag.                                                                                                         |
| Off-topic                      | ✓      | ✓                                      |                     | Redirect to the class topics, no flag.                                                                                 |
| Unsafe / harassment            | ✓      |                                        | ✓                   | Refuse + flag.                                                                                                         |
| Self-harm / crisis             | ✓      |                                        | ✓                   | Supportive refusal with help resources; flag category only, **no excerpt**. Escalation wording needs a human decision. |

Flags are visible to the class professor and admins only, store at most a 280-char excerpt, and expire after 90 days. No other message text is persisted.

**Usage events.** Outcomes `answered`, `abstained`, `redirected`, `refused` append `AiUsageRecorded` with `classId`, `courseId`, `studentId`, `actorId`, `aggregateType: "content_chat"`, `id` = the `content_ai_calls.id`, `payload: { kind: "chat", outcome, flagCategory? }`. `rate_limited` and `error` are kept in `content_ai_calls` only, so the panel does not count calls that never reached the tutor. Analytics drops events without `classId` or with a non-rostered `studentId` (`projection.ts`), so `classId` is always set, and preview emits no event. Analytics parses only `kind` today, so the panel works unchanged; a typed extension is requested in §11. **Caveat:** the event store is in-memory even in real mode, so in production the panel only shows what the serving instance saw until P4 adds a persistent store; `content_ai_calls` is the durable record.

## 7. Locale and accessibility

- `request.auth` has no locale. A `ProfilePreferencesPort` reads `profiles.locale` and `accessibility_preferences` (mock: `es`, `{}`). The tutor answers, including redirect text, in that locale regardless of the material's language; abstain, refusal and rate-limit strings come from a feature dictionary, not the model. Preview uses the professor's locale with an ES/EN toggle.
- UI strings: a feature-local `{ es, en }` dictionary (no i18n library exists yet), Spanish default, locale from the profile.
- Accessibility (typed schema requested in §11): `reducedMotion` → no typing animation or auto-scroll; `highContrast` → contrast tokens; `fontScale` / `dyslexiaFont` applied to the chat and material lists; `simplifiedLanguage` → an instruction to the generator. Always: answers announced through `aria-live="polite"`, citations are keyboard-focusable buttons, status chips carry text (not colour only), 44 px targets (`--athena-target-min`).

## 8. API routes

All under `/api/content`. Class routes check authorization before existence (analytics pattern); material-id routes return **404 both when the id is missing and when the caller cannot see it**, so ids from other classes do not leak. Errors use the platform `{ error }` body. All routes are class-scoped, so they use `canManageClass` / `canAccessClass`; `canAccessCourse` is not needed (the Learning adapter relies on Learning's own access check).

| Method & path                                                            | Who                        | Returns                                                                                |
| ------------------------------------------------------------------------ | -------------------------- | -------------------------------------------------------------------------------------- |
| `POST /classes/:classId/materials`                                       | `canManageClass`           | `201 { material, uploadUrl }` or `200 { material, duplicate }`                         |
| `POST /materials/:materialId/complete`                                   | `canManageClass`           | `Material` (verified)                                                                  |
| `POST /materials/:materialId/process`                                    | `canManageClass`           | `Material` after one bounded step                                                      |
| `GET /classes/:classId/materials`                                        | `canAccessClass`           | professor: all + status; student: ready only, public fields                            |
| `GET /materials/:materialId`                                             | manage, or access if ready | `Material`                                                                             |
| `PATCH /materials/:materialId`                                           | `canManageClass`           | title, topics                                                                          |
| `DELETE /materials/:materialId`                                          | `canManageClass`           | `204`                                                                                  |
| `GET /materials/:materialId/download`                                    | `canManageClass`           | signed URL (60 s)                                                                      |
| `GET /classes/:classId/objectives`, `/milestones`                        | `canAccessClass`           | ordered lists                                                                          |
| `PUT /classes/:classId/objectives/:id`, `/milestones/:id`; `DELETE` same | `canManageClass`           | upsert by client id, soft delete, `409` on stale `expectedUpdatedAt` or duplicate code |
| `POST /classes/:classId/chat`                                            | `canAccessClass`           | §6                                                                                     |
| `GET /classes/:classId/flags`, `POST /flags/:id/review`                  | `canManageClass`           | professor inbox                                                                        |
| `POST /admin/content/reindex`                                            | admin                      | queues re-embedding (§4)                                                               |

In mock storage only, `PUT /content/dev-uploads/:token` (authenticated, `application/octet-stream`) stands in for the Supabase signed upload URL so mock mode works end to end.

Request/response zod schemas go in a new `shared/src/content.ts`, reusing `materialStatusSchema` and `citationSchema`.

**Mock vs real** follows analytics: the module ships in-memory repositories, an in-memory storage and mock providers; `backend/api/src/content.ts` exposes `contentOptionsFor()`, which injects Supabase repositories when `ATHENA_DATA_MODE=real` and Gemini providers when `ATHENA_AI_MODE=real` (that env var exists but is unused today). New env vars go in `.env.example`.

## 9. UI screens

Professor (`/educator/classes/[classId]/content`, `RoleGate allow={["professor"]}`):

1. **Materials:** upload (file input + drop zone, title, topics; hashing and direct upload in the browser), list with status chips and progress, failure reason + Retry. Polls every 3 s and advances `process` while anything is processing.
2. **Objectives & milestones:** per topic, ordered objectives with ES/EN statements; milestones with optional due date and linked objectives.
3. **Flags:** flagged calls (category, student, excerpt, time) with "Mark reviewed".
4. **Preview chat:** the student chat in preview mode.

Student (`/classes/[classId]/chat?topicId=`): scope picker (whole class or a topic), message list, cited answers with expandable source cards (material, page, section, excerpt), clear abstain, refusal and redirect states, rate-limit notice. Exported as a component so P2/P3 can mount it in the house "Aprender" tab if they choose.

No multipart helper is needed: the file goes to the signed URL, and every API call stays JSON through `lib/api.ts`.

## 10. Generated formats (seam only, not built)

```ts
export interface ContentFormatGenerator {
  readonly format: "podcast" | "slides" | "graphic" | "summary" | "flashcards";
  generate(input: {
    classId: string;
    topicId?: string;
    objectiveIds: string[];
    locale: Locale;
    chunks: CurriculumContextChunk[];
  }): Promise<{ assetPath?: string; body?: unknown; citations: Citation[] }>;
}
```

Same retrieval, citation-membership rule, rate limiter and `AiUsageRecorded` (`kind: "podcast" | "summary"` already exist). A future `content_generations` table and `POST /classes/:classId/generations` route; formats align with `houseResourceFormatSchema`.

## 11. What we need from others (proposals; owners decide)

- **P1 (Vianey):** agreement on §1 ownership; a real `CurriculumCatalogPort` adapter once 0100 `courses`/`topics` exist (then FKs in a follow-up migration); whether objectives/milestones belong in curriculum instead (Q4); uuid fixture ids in `shared/src/contracts/curriculum-world.ts` (`course-math-1` today).
- **P2 (Daniela):** inject `ContentCurriculumContext` as `curriculumContext` in production; how `conceptId` maps to content (objective `concept_id`, or a topic-scope request without `conceptId`) (Q5); pass `locale` on messages and hints, not only at session start.
- **P4 (platform):** typed `accessibilityPreferencesSchema` in `shared/src/platform.ts`; optional `outcome`/`flagCategory` on `aiUsageRecordedPayloadSchema`; a persistent `DomainEventStore` in real mode; claim the 0500 range in `data/supabase/README.md`.

## 12. Test plan

`node:test` via `pnpm test`, all with mock providers and no API keys.

- **Authorization matrix** per route (`backend/api/tests/content-auth.test.ts`, built like `auth.test.ts`): no token 401; class professor and admin allowed on every manage route; enrolled student allowed to read and chat, 403 on manage class routes; other professor and non-enrolled student refused everywhere; material id from class A requested by a member of class B → 404, same as a missing id.
- **Upload:** concurrent duplicate creates → one row, one `duplicate: true`, topics unioned; size/mime rejected up front; magic-byte mismatch at `complete` → `failed/unsupported_type`.
- **Ingestion:** repeated `process` calls advance and finish; same file twice → same chunk count; failure → `failed` + `error_code`; retry recovers; stale claim recovered; a ready material keeps answering while a new generation builds or fails; events appended.
- **Chunker:** page/section metadata, overlap, cap, empty input.
- **Retrieval:** two classes with similar material never cross; non-active generations and other topics excluded; recall with several classes; abstain below threshold; citation-membership downgrade; `[Sn]` remap.
- **Guardrails:** es and en fixtures per category produce the configured action; classifier error → abstain; injection inside a source or in forged assistant history changes nothing; self-harm flag has no excerpt.
- **Rate limit:** 21st message in the window → 429; daily cap holds under concurrent calls; preview exempt.
- **Events:** one `AiUsageRecorded` per counted outcome, visible in `GET /api/analytics/class/:classId`; preview, rate-limited and error calls not counted.
- **Locale:** `en` profile gets English answer and strings; `es` default.
- **Learning adapter:** `ContentCurriculumContext` output parses with `curriculumContextResponseSchema` for each reason.
- **SQL:** reviewed by hand; after your approval, applied, checked with `get_advisors`, `content_match_chunks` called once, and an anon-key student client confirmed unable to read `content_materials` or chunks. Test rows deleted afterwards.

**PR order:** (1) contracts `shared/src/content.ts` + 0500-0503 SQL; (2) module skeleton + upload and ingestion with mock providers; (3) retrieval + chat + guardrails; (4) professor UI; (5) student chat UI; (6) real Gemini + Supabase providers. Each keeps lint, format, typecheck, test and build green.

## 13. Open questions

1. **Ownership:** does Vianey agree that content owns upload → chunks → retrieval (using her shared types), or should it go to P1? Can content use 0500+?
2. **Guardrail policy:** accept the §6 defaults? In particular graded work = redirect vs refuse, and the self-harm wording and escalation path.
3. **Ingestion driver:** OK for v1 to advance processing from the professor's open page (bounded `process` steps), with a queue later?
4. **Objectives & milestones:** class-level in content tables (proposed) or course-level in P1's catalog?
5. **Concept mapping for Learning:** objective `concept_id`, or ask P2 for topic-scope retrieval?
6. **Transcripts and retention:** keep chat stateless (no message text stored except flag excerpts, 90-day expiry) as proposed, or store conversations for the professor?
7. **Downloads:** may students download the original file, or only see cited excerpts?
8. **Models:** `gemini-3.8-flash` (answers), `gemini-3.5-flash-lite` (classifier), `gemini-embedding-2` @ 768, all env-configurable. OK?
9. **Limits:** 20 MB per file, 2 000 chunks, 20 msgs / 10 min and 150 / day per student. OK?
