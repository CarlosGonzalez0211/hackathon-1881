import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/.next/**",
      "**/dist/**",
      "**/next-env.d.ts",
      "**/components/ui/**",
      "references/**",
      "frontend/web/public/**",
      "frontend/engine3d/src/extracted/**",
      "frontend/engine3d/src/vendor/**",
      "frontend/engine3d/src/workers/**",
      // The kit is binary art plus the legacy one-line generator; only the new headless
      // generator (athena-assets/code) is source we lint.
      "frontend/engine3d/athena-assets/*",
      "!frontend/engine3d/athena-assets/code/",
      "frontend/engine3d/athena-assets/code/athena-models.js",
      "frontend/engine3d/athena-assets/code/tokens.*",
      "frontend/engine3d/.kit-cache/**",
      ".claude/worktrees/**",
      "tools/reverse-engineering/output/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  {
    // The runtime uses the recovered engine's classes (the `scope` object); the npm `three`
    // is a build-time tool for athena-assets/code, scripts and tests only.
    files: ["frontend/engine3d/src/**/*.{ts,tsx,js,mjs}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "three",
              message: "Runtime code must use the recovered `scope` classes, not the npm three.",
            },
          ],
          patterns: [
            {
              group: ["three/*"],
              message: "Runtime code must use the recovered `scope` classes, not the npm three.",
            },
          ],
        },
      ],
    },
  },
  prettier,
);
