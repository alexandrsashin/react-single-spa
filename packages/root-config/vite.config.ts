import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function readPackageJson(packageDir: string): {
  name: string;
  version: string;
} {
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

const externalDependencies = [
  "single-spa",
  "react",
  "react/jsx-dev-runtime",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "root-config",
];

export default defineConfig(() => {
  const packageDir = process.cwd();
  const { name, version } = readPackageJson(packageDir);
  const outputFileName = `${name}-${version}.js`;

  return {
    build: {
      rollupOptions: {
        input: "src/main.ts",
        output: {
          format: "esm",
          dir: "dist",
          entryFileNames: outputFileName,
        },
        external: externalDependencies,
      },
    },
  };
});
