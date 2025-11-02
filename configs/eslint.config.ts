import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import tsPlugin from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";

export default defineConfig([
  {
    ignores: ["node_modules/**", "**/dist/**", "coverage/**", "**/*.config.ts"],
  },
  js.configs.recommended,
  ...tsPlugin.configs.recommended,
  reactPlugin.configs.flat.recommended,
  reactHooksPlugin.configs.flat.recommended,
  reactRefresh.configs.recommended,
  {
    files: ["**/*.{js,ts,tsx}"],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // React 17+ JSX transform
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { vars: "all", varsIgnorePattern: "^_", args: "after-used", argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
]);
