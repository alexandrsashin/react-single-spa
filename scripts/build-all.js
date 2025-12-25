#!/usr/bin/env node

/**
 * Build script that builds all microfrontends first, then root-config
 * This ensures root-config can read all manifests to generate importmap
 */

import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const packages = [
  "header",
  "microfrontend",
  "microfrontend2",
  "sidebar",
  // "notification-bell", - library package, built differently
  "root-config", // Must be last!
];

console.log("🚀 Building all microfrontends...\n");

for (const pkg of packages) {
  console.log(`📦 Building ${pkg}...`);
  try {
    const packagePath = path.join(__dirname, "..", "packages", pkg);
    execSync("npm run build", {
      cwd: packagePath,
      stdio: "inherit",
    });
    console.log(`✅ ${pkg} built successfully\n`);
  } catch (error) {
    console.error(`❌ Failed to build ${pkg}`);
    process.exit(1);
  }
}

console.log("🎉 All packages built successfully!");
console.log(
  "📁 Check packages/root-config/dist/importmap.json for the generated import map"
);
