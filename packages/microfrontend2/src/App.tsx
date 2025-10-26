import { useAuth, LogoutButton, UserInfo } from "../../shared/auth-hooks";
import { httpClient } from "../../shared/http-client-fixed";

function App() {
  const { isAuthenticated, user } = useAuth();

  const testSecureApiCall = async () => {
    try {
      // Демонстрация API вызова с токеном
      const response = await httpClient.get("/users/1", {
        baseURL: "https://jsonplaceholder.typicode.com",
        requireAuth: true,
      });

      if (response.ok) {
        const data: unknown = await response.json();
        console.log("Secure API Response:", data);
        alert("Secure API call successful! Check console for data.");
      }
    } catch (error) {
      console.error("Secure API call error:", error);
      alert("Secure API call failed");
    }
  };

  const handleSecureApiCall = () => {
    void testSecureApiCall();
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{ padding: "20px", border: "2px solid #FF9800", margin: "10px" }}
      >
        <h2>Microfrontend 2 - Authentication Required</h2>
        <p>You need to be authenticated to see this microfrontend.</p>
        <p>Please log in through Microfrontend 1 first.</p>
      </div>
    );
  }

  return (
    <div
      style={{ padding: "20px", border: "2px solid #2196F3", margin: "10px" }}
    >
      <h2>Microfrontend 2 - Shared Auth State</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>User Information</h3>
        <UserInfo />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Features</h3>
        <p>✅ Shared authentication state across microfrontends</p>
        <p>✅ Automatic token injection in API calls</p>
        <p>✅ Real-time auth state synchronization</p>

        {user?.roles?.includes("admin") && (
          <p style={{ color: "green" }}>✅ Admin-only content visible</p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Actions</h3>
        <button
          onClick={handleSecureApiCall}
          style={{ marginRight: "10px", padding: "8px 16px" }}
        >
          Test Secure API
        </button>

        <LogoutButton
          onLogout={() => console.log("Logged out from microfrontend 2")}
        >
          Logout from MF2
        </LogoutButton>
      </div>

      <div style={{ fontSize: "12px", color: "#666" }}>
        <p>
          This microfrontend automatically receives authentication state from
          the centralized AuthService in root-config.
        </p>
      </div>
    </div>
  );
}

export default App;
