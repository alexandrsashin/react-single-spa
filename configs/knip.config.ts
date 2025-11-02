/**
 * Knip configuration for detecting unused files, exports, and dependencies
 * Documentation: https://knip.dev/
 *
 * Note: The main configuration is in knip.config.js
 * This file is kept here for reference and can be used in development
 */

export default {
  // Workspaces configuration for monorepo
  workspaces: {
    "packages/header": {
      entry: "src/main.ts",
      project: "src/**/*.{ts,tsx}",
    },
    "packages/microfrontend": {
      entry: "src/main.ts",
      project: "src/**/*.{ts,tsx}",
    },
    "packages/microfrontend2": {
      entry: "src/main.ts",
      project: "src/**/*.{ts,tsx}",
    },
    "packages/root-config": {
      entry: "src/main.ts",
      project: "src/**/*.{ts,tsx,js}",
    },
    scripts: {
      project: "**/*.js",
    },
  },
};
