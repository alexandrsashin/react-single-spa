import createViteConfig from "../../configs/vite.common";
import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const externalDependencies = [
  "single-spa",
  "react",
  "react/jsx-dev-runtime",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "root-config",
];

interface PackageManifest {
  name: string;
  file: string;
}

interface ImportMapConfig {
  development: {
    imports: Record<string, string>;
    scopes: Record<string, Record<string, string>>;
  };
  production: {
    imports: Record<string, string>;
    scopes: Record<string, Record<string, string>>;
  };
}

// Read manifest from a microfrontend package
function readMicrofrontendManifest(packageName: string): string | null {
  try {
    const manifestPath = path.join(
      process.cwd(),
      "../..",
      "packages",
      packageName,
      "dist",
      ".vite",
      "manifest.json"
    );
    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      const mainEntry = manifest["src/main.ts"] || manifest["src/main.tsx"];
      if (mainEntry && mainEntry.file) {
        return `/dist/${packageName}/${mainEntry.file}`;
      }
    }
  } catch (error) {
    console.warn(`⚠️  Failed to read manifest for ${packageName}:`, error);
  }
  return null;
}

// Plugin to generate importmap and copy files after build
function generateImportMapPlugin(): Plugin {
  return {
    name: "generate-importmap-post-build",
    closeBundle() {
      const packageDir = process.cwd();
      const distDir = path.join(packageDir, "dist");

      // Read the root-config manifest
      const manifestPath = path.join(distDir, ".vite", "manifest.json");
      let rootConfigFile = "/dist/root-config/main.js";

      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
        const mainEntry = manifest["src/main.ts"];
        if (mainEntry && mainEntry.file) {
          rootConfigFile = `/dist/root-config/${mainEntry.file}`;
        }
      }

      // Read manifests from all microfrontends
      const packages = [
        "header",
        "microfrontend",
        "microfrontend2",
        "sidebar",
        // "notification-bell", - library package, not built with Vite
      ];
      const manifestFiles: Record<string, string> = {};

      packages.forEach((pkg) => {
        const file = readMicrofrontendManifest(pkg);
        if (file) {
          const importMapName =
            pkg === "header" || pkg === "sidebar" || pkg === "notification-bell"
              ? `@react-single-spa/${pkg}`
              : `@react-single-spa/${pkg}`;
          manifestFiles[importMapName] = file;
        }
      });

      // Generate importmap.json
      const importMap: ImportMapConfig = {
        development: {
          imports: {
            "root-config": "http://localhost:3000/src/main.ts",
            "@react-single-spa/header": "http://localhost:3008/src/main.ts",
            "@react-single-spa/microfrontend":
              "http://localhost:3006/src/main.ts",
            "@react-single-spa/microfrontend2":
              "http://localhost:3007/src/main.ts",
            "@react-single-spa/sidebar": "http://localhost:3010/src/main.ts",
            react: "https://ga.jspm.io/npm:react@19.2.0/dev.index.js",
            "react-dom": "https://ga.jspm.io/npm:react-dom@19.2.0/dev.index.js",
            "react-dom/client":
              "https://ga.jspm.io/npm:react-dom@19.2.0/dev.client.js",
            "react/jsx-dev-runtime":
              "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-dev-runtime.js",
            "react/jsx-runtime":
              "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-runtime.js",
            "single-spa":
              "https://ga.jspm.io/npm:single-spa@5.9.5/lib/esm/single-spa.min.js",
            "single-spa-react":
              "https://ga.jspm.io/npm:single-spa-react@5.0.2/lib/esm/single-spa-react.js",
            antd: "https://ga.jspm.io/npm:antd@5.21.4/es/index.js",
            "@ant-design/icons":
              "https://ga.jspm.io/npm:@ant-design/icons@5.5.1/es/index.js",
          },
          scopes: {
            "https://ga.jspm.io/": {
              scheduler: "https://ga.jspm.io/npm:scheduler@0.23.0/dev.index.js",
            },
          },
        },
        production: {
          imports: {
            "root-config": rootConfigFile,
            ...manifestFiles,
            react:
              process.env.REACT_CDN ||
              "https://ga.jspm.io/npm:react@19.2.0/index.js",
            "react-dom":
              process.env.REACT_DOM_CDN ||
              "https://ga.jspm.io/npm:react-dom@19.2.0/index.js",
            "react-dom/client":
              process.env.REACT_DOM_CLIENT_CDN ||
              "https://ga.jspm.io/npm:react-dom@19.2.0/client.js",
            "react/jsx-runtime":
              process.env.REACT_JSX_RUNTIME_CDN ||
              "https://ga.jspm.io/npm:react@19.2.0/jsx-runtime.js",
            "single-spa":
              process.env.SINGLE_SPA_CDN ||
              "https://unpkg.com/single-spa@5.9.5/lib/esm/single-spa.min.js",
            "single-spa-react":
              process.env.SINGLE_SPA_REACT_CDN ||
              "https://unpkg.com/single-spa-react@5.0.2/lib/esm/single-spa-react.js",
            antd:
              process.env.ANTD_CDN ||
              "https://ga.jspm.io/npm:antd@5.21.4/es/index.js",
            "@ant-design/icons":
              process.env.ANT_DESIGN_ICONS_CDN ||
              "https://ga.jspm.io/npm:@ant-design/icons@5.5.1/es/index.js",
          },
          scopes: {
            "https://ga.jspm.io/": {
              scheduler: "https://ga.jspm.io/npm:scheduler@0.23.0/index.js",
            },
          },
        },
      };

      // Save importmap.json
      fs.writeFileSync(
        path.join(distDir, "importmap.json"),
        JSON.stringify(importMap, null, 2),
        "utf-8"
      );
      console.log("✅ Generated importmap.json with hashed filenames");
      console.log("📦 Production imports:");
      console.log(`   root-config: ${rootConfigFile}`);
      Object.entries(manifestFiles).forEach(([name, file]) => {
        console.log(`   ${name}: ${file}`);
      });

      // Copy other files
      const filesToCopy = [
        { src: "importmap-loader.js", required: true },
        { src: "react-refresh-setup.js", required: false },
        { src: "index.html", required: false },
        { src: "favicon.svg", required: false },
      ];

      filesToCopy.forEach(({ src, required }) => {
        const srcPath = path.join(packageDir, src);
        if (fs.existsSync(srcPath)) {
          fs.copyFileSync(srcPath, path.join(distDir, src));
          console.log(`✅ Copied ${src} to dist`);
        } else if (required) {
          console.warn(`⚠️  ${src} not found at ${srcPath}`);
        }
      });
    },
  };
}

export default createViteConfig({
  externals: externalDependencies,
  input: "src/main.ts",
  port: 3000,
  plugins: [generateImportMapPlugin()],
});
