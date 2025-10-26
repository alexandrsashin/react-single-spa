import React from "react";
import {
  useAuth,
  LoginForm,
  LogoutButton,
  UserInfo,
  ProtectedRoute,
} from "../../shared/auth-hooks";
import { httpClient } from "../../shared/http-client-fixed";

function App() {
  const { isAuthenticated } = useAuth();

  const testApiCall = async () => {
    try {
      // Пример использования HTTP клиента с автоматической авторизацией
      const response = await httpClient.get("/posts/1", {
        baseURL: "https://jsonplaceholder.typicode.com", // Демо API
        requireAuth: true,
      });

      if (response.ok) {
        const data: unknown = await response.json();
        console.log("API Response:", data);
        alert("API call successful! Check console for data.");
      } else {
        console.error("API call failed:", response.status);
        alert("API call failed");
      }
    } catch (error) {
      console.error("API call error:", error);
      alert("API call error");
    }
  };

  const handleTestApiCall = () => {
    void testApiCall();
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{ padding: "20px", border: "2px solid #ccc", margin: "10px" }}
      >
        <h2>Microfrontend 1 - Login Required</h2>
        <p>Please log in to access this microfrontend.</p>
        <LoginForm
          onSuccess={() => console.log("Login successful!")}
          onError={(error) => console.error("Login error:", error)}
        />
        <p style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
          Test credentials: test@example.com / password
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "20px", border: "2px solid #4CAF50", margin: "10px" }}
    >
      <h2>Microfrontend 1 - Authenticated</h2>

      <UserInfo />

      <div style={{ marginTop: "20px" }}>
        <h3>Protected Content</h3>
        <ProtectedRoute>
          <p>This content is only visible to authenticated users!</p>
        </ProtectedRoute>

        <ProtectedRoute requiredRoles={["admin"]}>
          <p style={{ color: "red" }}>
            This content is only visible to admins (you might not see this)
          </p>
        </ProtectedRoute>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={handleTestApiCall} style={{ marginRight: "10px" }}>
          Test API Call
        </button>
        <LogoutButton
          onLogout={() => console.log("Logged out from microfrontend 1")}
        />
      </div>
    </div>
  );
}

export default App;
