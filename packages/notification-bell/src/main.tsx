import React from "react";
import ReactDOMClient from "react-dom/client";

import singleSpaReact from "single-spa-react";
import NotificationBell from "./index";

export const { bootstrap, mount, unmount } = singleSpaReact({
  React,
  ReactDOMClient,
  rootComponent: NotificationBell as any,
  errorBoundary(err: any, info: any, props: any) {
    console.error("Notification bell error:", err, info, props);
    return React.createElement("div", {}, "Notification Bell Error");
  },
});
