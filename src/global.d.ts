// Global type definitions for the application

declare module "*.html" {
  const content: string;
  export default content;
}

declare module "*.html?url" {
  const url: string;
  export default url;
}
