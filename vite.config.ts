import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const isProduction = mode === "production";

  return {
    root: ".",
    assetsInclude: ["**/*.html"],
    server: {
      port: 9000,
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control",
      },
    },
    build: isProduction
      ? {
          lib: {
            entry: resolve(__dirname, "src/react-single-spa-root-config.ts"),
            name: "ReactSingleSpaRootConfig",
            fileName: () => "react-single-spa-root-config.js",
            formats: ["es"] as const,
          },
          rollupOptions: {
            external: ["single-spa", "single-spa-layout"],
            output: {
              globals: {
                "single-spa": "singleSpa",
                "single-spa-layout": "singleSpaLayout",
              },
            },
          },
          minify: true,
          sourcemap: true,
          emptyOutDir: true,
        }
      : undefined,
    esbuild: {
      target: "es2015",
    },
    define: {
      __IS_LOCAL__: JSON.stringify(!isProduction),
      __ORG_NAME__: JSON.stringify("react-single-spa"),
    },
  };
});
