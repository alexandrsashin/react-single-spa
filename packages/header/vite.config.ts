import createViteConfig from "../../configs/vite.common";

const externalDependencies = ["single-spa", "single-spa-react"];

export default createViteConfig({
  externals: externalDependencies,
  input: "src/main.ts",
});
