import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: Root,
  errorBoundary(err, info, props) {
    // Customize the root error boundary for your microfrontend here.
    return React.createElement(
      "div",
      { style: { color: "red" } },
      "Error loading auth microfrontend"
    );
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
