import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteExternalizeDeps from "vite-plugin-externalize-dependencies";

// Keep single-spa and single-spa-react external, but bundle React/ReactDOM into
// the header during development to avoid importmap/ESM export shape issues
// (rc-util imports `version` as a named export from 'react').
const externalDependencies = ["single-spa", "single-spa-react"];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteExternalizeDeps({
      externals: externalDependencies,
    }),
  ],
  build: {
    rollupOptions: {
      input: "src/main.ts",
      output: {
        format: "esm",
      },
      // Only treat the values above as externals. React and ReactDOM will be
      // bundled into the header to ensure AntD/rc-* can import `version`.
      external: externalDependencies,
    },
  },
});
