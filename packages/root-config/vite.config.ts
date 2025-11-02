import createViteConfig from "../../configs/vite.common";

const externalDependencies = [
  "single-spa",
  "react",
  "react/jsx-dev-runtime",
  "react/jsx-runtime",
  "react-dom",
  "react-dom/client",
  "root-config",
];

export default createViteConfig({
  externals: externalDependencies,
  input: "src/main.ts",
  port: 3000,
});
