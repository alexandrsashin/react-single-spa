import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ command }) => {
  const isDev = command === "serve";

  return {
    plugins: [react()],
    root: process.cwd(),
    server: {
      port: 8080,
      host: true,
      open: isDev, // Автоматически открывать браузер в dev режиме
    },
    preview: {
      port: 8080,
      host: true,
    },
    build: {
      outDir: "dist",
      rollupOptions: {
        input: isDev
          ? path.resolve(__dirname, "index.html") // В dev и preview режимах используем standalone HTML
          : path.resolve(__dirname, "src/auth.tsx"), // В production используем single-spa entry
        output: {
          entryFileNames: "auth-auth.js",
          format: "esm",
        },
      },
    },
  };
});
