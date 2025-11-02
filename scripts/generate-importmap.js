#!/usr/bin/env node

/**
 * Script to generate production importmap with environment variables
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.production") });

function generateProductionImportMap() {
  const config = {
    development: {
      imports: {
        "root-config": "http://localhost:3005/src/main.ts",
        "@react-single-spa/microfrontend": "http://localhost:3006/src/main.ts",
        "@react-single-spa/microfrontend2": "http://localhost:3007/src/main.ts",
        react: "https://ga.jspm.io/npm:react@19.2.0/dev.index.js",
        "react-dom": "https://ga.jspm.io/npm:react-dom@19.2.0/dev.index.js",
        "react-dom/client": "https://ga.jspm.io/npm:react-dom@19.2.0/dev.client.js",
        "react/jsx-dev-runtime": "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-dev-runtime.js",
        "react/jsx-runtime": "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-runtime.js",
        "single-spa": "https://ga.jspm.io/npm:single-spa@5.9.5/lib/esm/single-spa.min.js",
        antd: "https://ga.jspm.io/npm:antd@5.21.4/es/index.js",
        "@ant-design/icons": "https://ga.jspm.io/npm:@ant-design/icons@5.5.1/es/index.js",
      },
      scopes: {
        "https://ga.jspm.io/": {
          scheduler: "https://ga.jspm.io/npm:scheduler@0.23.0/dev.index.js",
        },
      },
    },
    production: {
      imports: {
        "root-config": process.env.ROOT_CONFIG_URL || "/dist/root-config.js",
        "@react-single-spa/microfrontend":
          process.env.MICROFRONTEND_URL || "/dist/microfrontend.js",
        "@react-single-spa/microfrontend2":
          process.env.MICROFRONTEND2_URL || "/dist/microfrontend2.js",
        react: process.env.REACT_CDN || "https://unpkg.com/react@19.2.0/index.js",
        "react-dom": process.env.REACT_DOM_CDN || "https://unpkg.com/react-dom@19.2.0/index.js",
        "react-dom/client":
          (process.env.REACT_DOM_CDN || "https://unpkg.com/react-dom@19.2.0") + "/client.js",
        "react/jsx-runtime":
          (process.env.REACT_CDN || "https://unpkg.com/react@19.2.0") + "/jsx-runtime.js",
        "single-spa":
          process.env.SINGLE_SPA_CDN ||
          "https://unpkg.com/single-spa@5.9.5/lib/esm/single-spa.min.js",
        antd: process.env.ANTD_CDN || "https://unpkg.com/antd@5.21.4/dist/antd.min.js",
        "@ant-design/icons": "https://unpkg.com/@ant-design/icons@5.5.1/dist/index.umd.min.js",
      },
      scopes: {},
    },
  };

  // Сохраняем в файл
  const outputPath = path.join(__dirname, "../packages/root-config/importmap.json");

  fs.writeFileSync(outputPath, JSON.stringify(config, null, 2), "utf8");

  console.log("✅ Production importmap generated successfully!");
  console.log(`📁 Saved to: ${outputPath}`);
  console.log("🚀 Environment variables used:");
  console.log(`   ROOT_CONFIG_URL: ${process.env.ROOT_CONFIG_URL || "default"}`);
  console.log(`   MICROFRONTEND_URL: ${process.env.MICROFRONTEND_URL || "default"}`);
  console.log(`   MICROFRONTEND2_URL: ${process.env.MICROFRONTEND2_URL || "default"}`);
  console.log(`   REACT_CDN: ${process.env.REACT_CDN || "default"}`);
  console.log(`   ANTD_CDN: ${process.env.ANTD_CDN || "default"}`);
}

generateProductionImportMap();
