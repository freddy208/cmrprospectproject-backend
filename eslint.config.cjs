/* eslint-disable prettier/prettier */
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettierRecommended = require("eslint-plugin-prettier/recommended");
const globals = require("globals");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  // --- Ignorer tous les tests ---
  {
    ignores: ["**/*.spec.ts", "test/**/*.ts"],
  },

  // --- Base JS ---
  js.configs.recommended,

  // --- TypeScript avec typage (code source principal) ---
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser, // 👈 obligatoire sinon "parser unknown"
      parserOptions: {
        project: "./tsconfig.eslint.json",
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,
      "@typescript-eslint/no-floating-promises": "warn",
    },
  },

  // --- Prettier ---
  prettierRecommended,
];
