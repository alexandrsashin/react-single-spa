import "antd/dist/reset.css"; // Ant Design CSS
import React from "react";
import ReactDOMClient from "react-dom/client";

import rootComponent from "./App";
import singleSpaReact from "single-spa-react";

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent,
  errorBoundary(err: any, info: any, props: any) {
    console.error("Microfrontend error:", err, info, props);
    return React.createElement("div", {}, "Microfrontend Error");
  },
});
