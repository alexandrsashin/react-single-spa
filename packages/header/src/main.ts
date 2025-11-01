import "antd/dist/reset.css"; // Ant Design CSS
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import App from "./App";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err: any, info: any, props: any) {
    console.error("Header microfrontend error:", err, info, props);
    return React.createElement("div", {}, "Header Error");
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
