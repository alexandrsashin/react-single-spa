import React, { useState, useEffect } from "react";
import { Badge, Popover, List, Button, Typography } from "antd";
import { BellOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: "info" | "warning" | "error" | "success";
}

interface NotificationBellProps {
  userId?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visible, setVisible] = useState(false);

  // Симуляция получения нотификаций
  useEffect(() => {
    // Начальные нотификации
    const initialNotifications: Notification[] = [
      {
        id: "1",
        title: "Добро пожаловать!",
        message: "Вы успешно вошли в систему",
        timestamp: new Date(),
        read: false,
        type: "success",
      },
      {
        id: "2",
        title: "Системное уведомление",
        message: "Обновление системы запланировано на завтра в 02:00",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 минут назад
        read: false,
        type: "info",
      },
      {
        id: "3",
        title: "Важное уведомление",
        message: "Не забудьте сохранить ваши изменения",
        timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 час назад
        read: true,
        type: "warning",
      },
    ];

    setNotifications(initialNotifications);

    // Симуляция периодических уведомлений
    const interval = setInterval(() => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title: "Новое уведомление",
        message: `Тестовое уведомление в ${new Date().toLocaleTimeString()}`,
        timestamp: new Date(),
        read: false,
        type: Math.random() > 0.5 ? "info" : "success",
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 10)); // Максимум 10 уведомлений
    }, 30000); // Каждые 30 секунд

    return () => clearInterval(interval);
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getTypeColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "#52c41a";
      case "warning":
        return "#faad14";
      case "error":
        return "#ff4d4f";
      default:
        return "#1890ff";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "только что";
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflow: "auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          borderBottom: "1px solid #f0f0f0",
          paddingBottom: 8,
        }}
      >
        <Text strong>Уведомления ({notifications.length})</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Прочитать все
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
          Нет уведомлений
        </div>
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => (
            <List.Item
              style={{
                padding: "8px 0",
                backgroundColor: notification.read ? "transparent" : "#f6ffed",
                borderRadius: 4,
                marginBottom: 4,
                cursor: "pointer",
              }}
              onClick={() => markAsRead(notification.id)}
              actions={[
                <Button
                  type="text"
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                />,
              ]}
            >
              <List.Item.Meta
                title={
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: getTypeColor(notification.type),
                      }}
                    />
                    <Text
                      strong={!notification.read}
                      style={{ fontSize: "14px" }}
                    >
                      {notification.title}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Text style={{ fontSize: "12px", color: "#666" }}>
                      {notification.message}
                    </Text>
                    <br />
                    <Text style={{ fontSize: "11px", color: "#999" }}>
                      {formatTimestamp(notification.timestamp)}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={notificationContent}
      title={null}
      trigger="click"
      open={visible}
      onOpenChange={setVisible}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          style={{
            fontSize: "18px",
            color: unreadCount > 0 ? "#1890ff" : "#666",
            border: "none",
            background: "transparent",
          }}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
