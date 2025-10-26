import React from "react";
import { createRoot } from "react-dom/client";
import Root from "./root.component";

// Standalone development version - renders the component directly without single-spa
const container = document.getElementById("auth-root");
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Root name="Auth Microfrontend" />
    </React.StrictMode>
  );
} else {
  console.error("Could not find auth-root element");
}
