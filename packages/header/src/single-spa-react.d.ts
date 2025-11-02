// Temporary ambient declaration to work around package "exports" blocking
// TypeScript cannot resolve the `single-spa-react` typings through package.json "exports".
// This file provides a minimal module declaration so the project compiles.
declare module "single-spa-react" {
  const singleSpaReact: any;
  export default singleSpaReact;
}
