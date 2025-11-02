// Provide minimal JSX namespace types for shared code when package-level
// @types/react resolution doesn't expose the JSX namespace (monorepo edge cases).
import * as React from "react";

declare global {
  namespace JSX {
    // Minimal JSX element type mapping
    type Element = React.ReactElement;
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

export {};
