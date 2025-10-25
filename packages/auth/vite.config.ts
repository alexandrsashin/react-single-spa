import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  root: process.cwd(),
  server: {
    port: 8080,
    host: true,
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "auth-auth.js"),
      },
      output: {
        entryFileNames: "auth-auth.js",
        format: "es",
      },
    },
  },
});
