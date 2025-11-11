import "antd/dist/reset.css";
import React from "react";
import ReactDOMClient from "react-dom/client";
import singleSpaReact from "single-spa-react";
import App from "./App";

const lifecycles = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: App,
  errorBoundary(err: any, info: any, props: any) {
    console.error("Sidebar microfrontend error:", err, info, props);
    return React.createElement("div", {}, "Sidebar Error");
  },
});

export const { bootstrap, mount, unmount } = lifecycles;
