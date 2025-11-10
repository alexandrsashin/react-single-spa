import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    include: ["packages/**/src/**/*.test.{ts,tsx}"],
    setupFiles: ["configs/vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      // Allow tests to import shared-types by package source (not built)
      "@react-single-spa/shared-types": path.resolve(
        __dirname,
        "packages/shared-types/src"
      ),
    },
  },
});
