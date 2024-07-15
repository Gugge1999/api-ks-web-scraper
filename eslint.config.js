import pluginJs from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    rules: {
      "no-var": "error",
      "prefer-const": "error",
      eqeqeq: "error",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  {
    ignores: ["dist/", "node-modules/", "package-lock.json"]
  },
  { files: ["**/*.{ts}"] },

  {
    languageOptions: {
      globals: {
        ...globals.node
      },

      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",

      parserOptions: {
        project: "tsconfig.json"
      }
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended
];
