import { ConfigProvider, Layout, Menu } from "antd";
import {
  type SharedCustomProps,
  type MenuItemConfig,
} from "@react-single-spa/shared-types";
import { useMemo } from "react";

const { Sider } = Layout;

type AppProps = SharedCustomProps;

export default function App(props: AppProps) {
  const menuConfig: MenuItemConfig[] = props?.sharedState?.menuConfig ?? [
    { key: "/user", label: "Личный кабинет", roles: ["user"] },
    { key: "/admin", label: "Админка", roles: ["admin"] },
    { key: "/about", label: "О сайте" },
  ];

  const authService = props?.sharedState?.authService;
  const user = authService?.getCurrentUser();
  const roles = user?.roles ?? [];

  // Filter menu based on user roles
  const items = useMemo(() => {
    return menuConfig
      .filter(
        (it) =>
          !it.roles ||
          it.roles.length === 0 ||
          it.roles.some((r) => roles.includes(r))
      )
      .map((it) => ({ key: it.key, label: it.label }));
  }, [menuConfig, roles]);

  const handleClick = (e: any) => {
    const nav = props?.sharedState?.navigationService;
    if (nav && typeof nav.navigateTo === "function") {
      nav.navigateTo(e.key);
    } else {
      window.history.pushState(null, "", e.key);
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Sider width={220} style={{ background: "#fff" }}>
        <Menu mode="inline" items={items} onClick={handleClick} />
      </Sider>
    </ConfigProvider>
  );
}
