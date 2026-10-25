# Authenticated curriculum routes for World

Person 1 now implements the two read endpoints in the existing World contract.
`curriculumRoutes` is exported by `@athena/curriculum`; the current API module
registry already registers it under `/api`. No Platform, World, shared schema,
API composition, or frontend file is modified.

| Endpoint                            | Query                                          | Response                   |
| ----------------------------------- | ---------------------------------------------- | -------------------------- |
| `GET /api/courses/:courseId/topics` | Optional `published=true` or `published=false` | `CurriculumTopicSummary[]` |
| `GET /api/topics/:topicId/sources`  | Optional `locale=en` or `locale=es`            | `HouseContent`             |

The topic endpoint returns all summaries when `published` is omitted; `true`
returns only published topics, and `false` only unpublished topics. The content
endpoint defaults to the authorized course's locale when none is supplied.
Other query fields are rejected. No request body can provide identity or grants.

## Authentication and authorization

The root API's installed Platform hook supplies `request.auth`. Curriculum also
requires a nonempty Bearer header and a valid authenticated context before either
handler runs. It delegates course access to `app.platform.authorization` and does
not grant access by checking a role string itself. A Platform denial wins even
for an admin.

Canonical Mathematics IDs and the documented UUID aliases are resolved without
rewriting identity. When a verified course membership uses a UUID alias, Platform
must authorize that original grant; the module does not add fake grants to the
context. A denied known-course lookup never reads the curriculum repository.

The existing Platform auth mode still matters: real token verification requires
its configured verifier/directory. The application's explicit mock mode uses an
allow-all demo auth stub, which does not validate a nonempty token. Requiring a
header does not turn that stub into real authentication. These fixture routes
must be evaluated with real Platform authentication before use with private data.
The integration tests use `DirectoryAuthService`, `StaticTokenVerifier`, and
`RoleAuthorizationService` with test-only identities, not production credentials.
No new auth mechanism or environment setting is introduced.

## Content and publication

The routes serve the current in-memory mock repository by default, even when a
real identity provider is supplied. They do not implement database persistence.
They use the existing World topic and HouseContent adapters:

- Mathematics IDs, orders, house slots, and demo prerequisites remain unchanged.
- Default publication intent includes the six Mathematics topics only.
- Published status also requires ready material in the active course/version.
- History is published by default; its resources do not displace Mathematics.
- A published History topic can return English or Spanish TXT/resource bodies.
- Sources enforce course access and publication server-side. Only ready sources
  and approved resources are projected, with inline references for TXT content.
- No PDF pages, downloads, playable media URLs, uploads, writes, or progress updates
  are invented. An unavailable language produces empty content in the unchanged
  HouseContent shape; use capability discovery for richer availability details.

Successful responses use `Cache-Control: private, no-store`.
Errors preserve the API's `{ error: string }` convention: 400 invalid inputs,
401 missing/invalid authentication, 403 forbidden course or unpublished/unready
content, 404 unknown authorized course/topic. Unexpected provider failures remain
errors rather than fabricated successful payloads.

## Server-owned route options

`CurriculumRoutesOptions` supports dependency injection in tests/composition:

- `repository`: defaults to `MockCurriculumRepository`.
- `publishedTopicIds`: explicit mock publication intent; ready-source checks remain.
- `preserveMathematicsDemo`: defaults to the existing adapter compatibility profile.
- `topicCourses`: server-owned topic-to-course routing metadata, defaulting to the
  current demo catalog. Custom catalogs must provide their matching routing index.

Example for a separately composed demo app with Platform already installed:

```ts
import { curriculumRoutes } from "@athena/curriculum";

await app.register(curriculumRoutes, {
  prefix: "/api",
  publishedTopicIds: ["topic-comparing-rights"],
});
```

That example opts into History only. Include the Mathematics IDs as well if that
composed demo should publish both courses. It is not a publishing endpoint, and
clients cannot change these options through requests. The default manifest publishes both Mathematics and History.

## Tests and next integration boundary

```sh
pnpm build:platform
pnpm --filter @athena/api exec tsx --test ../modules/curriculum/tests/curriculum-routes.test.ts
pnpm exec tsc -p backend/modules/curriculum/tsconfig.tests.json
```

Tests cover real Platform token-verification flow with fixture identities, both
read contracts, students/professors/admins, explicit Platform denial, denied
repository reads, aliases, publication, ready materials, History languages,
invalid queries, and errors. The existing World browser mock still uses its own
fixtures; replacing that client or changing the Material panel is a later scoped
integration step. No capability-discovery or concept-retrieval HTTP route is
added here.
