import { useState } from "react";
import { Form, Input, Button, Alert, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { AuthService } from "@react-single-spa/shared-types";
import { getAuthService } from "../../../shared/auth-utils";

interface LoginFormProps {
  authService?: AuthService;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function LoginForm({ authService, onSuccess, onError }: LoginFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSubmit = (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const svc = authService ?? (await getAuthService());
        if (!svc) {
          setError("Authentication service not available");
          return;
        }

        await svc.login(values);
        form.resetFields();
        onSuccess?.();
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    })();
  };

  return (
    <Card
      title="Sign In to Microfrontend 1"
      style={{ maxWidth: 400, margin: "0 auto" }}
    >
      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        {error && (
          <Form.Item>
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          </Form.Item>
        )}

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="test@example.com"
            autoComplete="username"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "center" as const }}>
          <div style={{ fontSize: "12px", color: "#999" }}>
            Demo credentials: test@example.com / password
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
}
