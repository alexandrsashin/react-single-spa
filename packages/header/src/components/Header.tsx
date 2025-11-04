import React, { useState, useEffect, useRef } from "react";
import { Layout, Space, Avatar, Dropdown, Typography, Button } from "antd";
import { UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { mountRootParcel } from "single-spa";
import { type User } from "../types";

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const parcelElRef = useRef<HTMLDivElement | null>(null);
  const parcelRef = useRef<{ unmount?: () => void } | null>(null);

  useEffect(() => {
    // Получаем состояние авторизации из глобального AuthService
    const checkAuthState = () => {
      if (window.authService) {
        const authState = window.authService.getState();
        setIsAuthenticated(authState.isAuthenticated);
        setUser(authState.user);
      }
    };

    // Проверяем начальное состояние
    checkAuthState();

    // Подписываемся на изменения авторизации
    const unsubscribe = window.authService?.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
      setUser(authState.user);
    });

    return unsubscribe;
  }, []);

  // Mount notification parcel (ESM dynamic import)
  useEffect(() => {
    let canceled = false;

    (async () => {
      try {
        const parcelModule = await import("notification-bell/parcel");
        if (canceled) return;
        parcelRef.current = mountRootParcel(parcelModule as any, {
          domElement: parcelElRef.current!,
          userId: user?.id,
        });
      } catch (err) {
        // only console.error (allowed by lint)
        console.error("Failed to load notification parcel", err);
      }
    })();

    return () => {
      canceled = true;
      parcelRef.current?.unmount?.();
    };
  }, [user?.id]);

  const handleLogout = () => {
    if (window.NavigationUtils) {
      window.NavigationUtils.logout();
    }
  };

  const handleSettings = () => {
    console.log("Открыть настройки");
  };

  const userMenuItems = [
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Настройки",
      onClick: handleSettings,
    },
    {
      type: "divider" as const,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Выйти",
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader
      style={{
        background: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #f0f0f0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "64px",
      }}
    >
      {/* Логотип/Название */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <Typography.Title
          level={4}
          style={{
            margin: 0,
            color: "#1890ff",
            fontWeight: "bold",
          }}
        >
          Micro Frontend App
        </Typography.Title>
      </div>

      {/* Правая часть хэдера */}
      {isAuthenticated && user ? (
        <Space size="large">
          {/* Parcel с нотификациями */}
          <div ref={parcelElRef} />

          {/* Информация о пользователе */}
          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              style={{
                height: "auto",
                padding: "4px 8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: "#1890ff" }} />
              <Text strong>{user.name}</Text>
            </Button>
          </Dropdown>
        </Space>
      ) : (
        <Space>
          <Text type="secondary">Не авторизован</Text>
        </Space>
      )}
    </AntHeader>
  );
};

export default Header;
