#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageDir = path.dirname(__dirname);
const distDir = path.join(packageDir, "dist");

// Copy importmap.json
const importmapSrc = path.join(packageDir, "importmap.json");
if (fs.existsSync(importmapSrc)) {
  fs.copyFileSync(importmapSrc, path.join(distDir, "importmap.json"));
  console.error("✅ Copied importmap.json to dist");
} else {
  console.warn("⚠️  importmap.json not found at", importmapSrc);
}

// Copy importmap-loader.js
const loaderSrc = path.join(packageDir, "importmap-loader.js");
if (fs.existsSync(loaderSrc)) {
  fs.copyFileSync(loaderSrc, path.join(distDir, "importmap-loader.js"));
  console.error("✅ Copied importmap-loader.js to dist");
} else {
  console.warn("⚠️  importmap-loader.js not found at", loaderSrc);
}

// Copy index.html if it exists
const htmlSrc = path.join(packageDir, "index.html");
if (fs.existsSync(htmlSrc)) {
  fs.copyFileSync(htmlSrc, path.join(distDir, "index.html"));
  console.error("✅ Copied index.html to dist");
}

// Copy favicon.svg if it exists
const faviconSrc = path.join(packageDir, "favicon.svg");
if (fs.existsSync(faviconSrc)) {
  fs.copyFileSync(faviconSrc, path.join(distDir, "favicon.svg"));
  console.error("✅ Copied favicon.svg to dist");
}
