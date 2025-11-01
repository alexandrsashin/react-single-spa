import React from "react";
import { ConfigProvider } from "antd";
import LoginPage from "./LoginPage";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <LoginPage />
    </ConfigProvider>
  );
};

export default App;
