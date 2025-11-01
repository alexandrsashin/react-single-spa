import createViteConfig from "../../configs/vite.common";

const externalDependencies = ["single-spa"];

export default createViteConfig({
  externals: externalDependencies,
  input: "src/main.ts",
});
