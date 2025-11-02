// Ambient declaration for single-spa-react to avoid resolving issues with package.json "exports"
declare module "single-spa-react" {
  const singleSpaReact: any;
  export default singleSpaReact;
}
