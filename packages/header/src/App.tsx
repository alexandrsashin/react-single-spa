import { ConfigProvider } from "antd";
import Header from "./components/Header";

import { type SharedCustomProps } from "@react-single-spa/shared-types";

type AppProps = SharedCustomProps;

const App = (props: AppProps) => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Header customProps={props} />
    </ConfigProvider>
  );
};

export default App;
