import React from "react";
import { ConfigProvider } from "antd";
import Header from "./components/Header";

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Header />
    </ConfigProvider>
  );
};

export default App;
