# API-backed Material panel

Person 1's `CurriculumMaterialPanel` preserves the current World Material slot
props: `topicId`, `studentId`, `cta`, `onStart`, and optional `showStart`.
It loads `GET /api/topics/:topicId/sources` and validates the unchanged HouseContent
response before rendering ready material metadata and resource bodies.

## Files

- `api/http-house-content-client.ts`: pure authenticated HTTP client with injectable
  session-token provider and fetch transport for tests.
- `api/house-content-client.ts`: browser factory using the existing Supabase session
  and `NEXT_PUBLIC_API_URL` (same-origin API if unset).
- `components/CurriculumMaterialPanel.tsx`: loading/error/retry/language states,
  sign-in link, request cancellation, and preserved start callback.
- `components/CurriculumMaterialView.tsx`: escaped TXT/resource presentation,
  source references, safe web links, and preserved line breaks.
- `components/CurriculumMaterialPanel.module.css`: local styles using brand tokens.

The client intentionally uses the curriculum API even if World's existing mock
mode is enabled. It reads the existing session on each request, sends its Bearer
token, disables response caching, and never invents a token. It does not change
shared auth helpers, auth settings, environment files, or World data clients.

A working configured Supabase browser session and reachable API are required for
live loading. Missing configuration/session shows a sign-in message without making
an anonymous request. Expired sessions, denied/unpublished content, missing
materials, invalid responses, and network failures have clear retry states.
The existing backend mock auth remains demo-only; a header is not proof of real
authentication unless Platform's verified auth mode is configured.

## Content behavior

- TXT files show a TXT badge. Actual lesson text is shown in source resource cards;
  there is no invented file download or "preview soon" placeholder.
- Script/lyrics/slide-outline labels reflect the existing authored resources, not
  playable media or generated presentation files.
- Resource bodies and inline source references are escaped text with preserved
  line breaks. Only HTTP(S) links render as links.
- Language choices are course default, English, and Spanish. Requests include
  `locale` only for an explicit language choice; missing language content shows an
  empty state and never substitutes another language.
- History topics are published by default through the curriculum API and require
  authorized course access. World still uses its existing Mathematics connection;
  connecting History course selection remains separate World integration work.
- `studentId` remains a view-context prop. It is not used to grant API access;
  authenticated server identity controls access.

## World boundary

World mounts this panel through a props-preserving client re-export in
`features/world/components/HouseContentPanel.tsx`. HousePage retains its existing
props and `showStart={false}` behavior, so its separate start controls remain in
charge. Topic/student changes cancel stale requests; retry and language selection
are handled inside the panel.

The existing `house-content-client.ts`, HousePage, WorldProvider, stylesheets,
engine, course selection, and progress behavior are unchanged. The Material slot
now always uses authenticated curriculum API content, including when the rest of
World uses mocks. A missing session shows the sign-in state instead of mock content.
History content is available when World opens an authorized History topic; this
change does not add History enrollment or course navigation.

## Checks from repository root

```sh
pnpm --filter @athena/web typecheck
pnpm --filter @athena/api exec tsx --tsconfig ../../frontend/web/src/features/curriculum/tests/tsconfig.json --test "$PWD"/frontend/web/src/features/curriculum/tests/*.test.ts "$PWD"/frontend/web/src/features/curriculum/tests/*.test.tsx
```

The local test config enables React's automatic JSX runtime for Node tests;
it does not modify the web/global TypeScript configuration. Tests cover the HTTP
boundary, current-session handling, errors, schema validation, TXT/media honesty,
inline citations, line breaks, empty language content, and escaped content.
They do not claim that a real logged-in browser session was tested.
