import { defineConfig, UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteExternalizeDeps from "vite-plugin-externalize-dependencies";
import fs from "fs";
import path from "path";

type CreateViteOptions = {
  externals?: string[];
  input?: string;
  port: number;
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
  const { externals = [], input = "src/main.ts", port } = options;

  return defineConfig(() => {
    const packageDir = process.cwd();
    const { name, version } = readPackageJson(packageDir);
    const outputFileName = `${name}-${version}.js`;

    const plugins: (ReturnType<typeof react> | ReturnType<typeof viteExternalizeDeps>)[] = [
      react(),
    ];
    if (externals && externals.length > 0) {
      plugins.push(
        viteExternalizeDeps({
          externals,
        })
      );
    }

    const config: UserConfig = {
      plugins,
      server: {
        port,
      },
      build: {
        rollupOptions: {
          input,
          output: { format: "esm", dir: "dist", entryFileNames: outputFileName },
          external: externals,
        },
      },
    };

    return config;
  });
}
