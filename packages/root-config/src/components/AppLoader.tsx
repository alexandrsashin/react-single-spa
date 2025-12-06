/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createRoot, Root } from "react-dom/client";

interface LoaderProps {
  message?: string;
}

const AppLoader: React.FC<LoaderProps> = ({ message = "Загрузка..." }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #1890ff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <p
        style={{
          marginTop: "20px",
          fontSize: "16px",
          color: "#666",
        }}
      >
        {message}
      </p>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

let rootInstance: Root | null = null;
let containerElement: HTMLDivElement | null = null;

export function showLoader(message?: string): void {
  if (!containerElement) {
    containerElement = document.createElement("div");
    containerElement.id = "app-loader-root";
    document.body.appendChild(containerElement);
  }

  if (!rootInstance) {
    rootInstance = createRoot(containerElement);
  }

  rootInstance.render(<AppLoader message={message} />);
}

export function hideLoader(): void {
  if (rootInstance && containerElement) {
    rootInstance.unmount();
    rootInstance = null;

    if (containerElement.parentNode) {
      containerElement.parentNode.removeChild(containerElement);
    }
    containerElement = null;
  }
}
