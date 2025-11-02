import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteExternalizeDeps from "vite-plugin-externalize-dependencies";

type CreateViteOptions = {
  externals?: string[];
  input?: string;
};

export default function createViteConfig(options: CreateViteOptions = {}) {
  const { externals = [], input = "src/main.ts" } = options;

  return defineConfig(() => {
    const plugins: any[] = [react()];
    if (externals && externals.length > 0) {
      plugins.push(
        viteExternalizeDeps({
          externals,
        })
      );
    }

    const config: UserConfig = {
      plugins,
      build: {
        rollupOptions: {
          input,
          output: { format: "esm" },
          external: externals,
        },
      },
    };

    return config;
  });
}
