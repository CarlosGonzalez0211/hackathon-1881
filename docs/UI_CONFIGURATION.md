# UI configuration

The app defaults to English. To use Spanish, set `NEXT_PUBLIC_ATHENA_LOCALE=es` in `frontend/web/.env.local`, then restart the web preview (rebuild deployed bundles). Use `en` for English. The same setting controls HTML language, interface text, learning states, badges, NPC dialogue, engine accessibility/touch controls, and known demo lesson/analytics content.

- `frontend/web/src/lib/i18n.ts`: the locale and translation helpers.
- `frontend/web/src/lib/locales/en.json` and `es.json`: shared copy catalogs. Components use the English key with `t("Cancel")`; placeholders use `t("{0} planets", { 0: count })`.
- `frontend/web/src/lib/locales/content.json`: maps existing Spanish demo content to catalog keys. IDs, asset filenames, student names, progress, and unknown teacher-authored content are preserved.
- `frontend/web/src/app/paper-ui.css`: global `--athena-ui-*` palette, paper edges, shadows, and overlay styles. These tokens style both the orbit overlays and world controls.
- `frontend/brand/src/tokens.css`: shared motion timing and reduced-motion support. Global typography remains in `frontend/web/src/app/globals.css`.

`Tooltip` provides pointer/keyboard hints with Escape dismissal. `usePaperDialog` keeps native dialog focus behavior, adds entry/exit motion, and dismisses on an outside pointer gesture or Escape. `useOutsideDismiss` handles directory, topic-list, and sound popovers. The lesson overlay also closes on its backdrop.

Run `pnpm test` for the existing suite and locale/content regressions; `pnpm typecheck` and `pnpm lint` check the full workspace.
