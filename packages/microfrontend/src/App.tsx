import { ConfigProvider } from "antd";
import LoginPage from "./LoginPage";
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
      <LoginPage customProps={props} />
    </ConfigProvider>
  );
};

export default App;
