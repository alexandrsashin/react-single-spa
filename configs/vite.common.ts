import { defineConfig, UserConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react";
import viteExternalizeDeps from "vite-plugin-externalize-dependencies";
import fs from "fs";
import path from "path";

type CreateViteOptions = {
  externals?: string[];
  input?: string;
  port: number;
  plugins?: Plugin[];
};

function readPackageJson(packageDir: string): { name: string; version: string } {
  try {
    const packageJsonPath = path.join(packageDir, "package.json");
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return {
      name: packageJson.name || "app",
      version: packageJson.version || "0.0.0",
    };
  } catch (error) {
    console.warn("Failed to read package.json:", error);
    return { name: "app", version: "0.0.0" };
  }
}

export default function createViteConfig(options: CreateViteOptions) {
  const { externals = [], input = "src/main.ts", port, plugins: additionalPlugins = [] } = options;

  return defineConfig(() => {
    const packageDir = process.cwd();
    const { name } = readPackageJson(packageDir);

    const plugins: Plugin[] = [react()];
    if (externals && externals.length > 0) {
      plugins.push(
        viteExternalizeDeps({
          externals,
        })
      );
    }
    // Add any additional plugins
    plugins.push(...additionalPlugins);

    const config: UserConfig = {
      plugins,
      server: {
        port,
      },
      build: {
        manifest: true, // Generate manifest.json with hashed filenames
        rollupOptions: {
          input,
          preserveEntrySignatures: "exports-only",
          output: {
            format: "esm",
            dir: "dist",
            // Use Vite's default hashing: [name]-[hash].js
            entryFileNames: "[name]-[hash].js",
          },
          external: externals,
        },
      },
    };

    return config;
  });
}
