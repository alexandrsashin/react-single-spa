import React, { useState, useEffect, useCallback } from "react";
import { AuthState, getAuthService, hasPermission } from "./auth-utils";

// Hook для работы с авторизацией
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      const authService = await getAuthService();
      if (!mounted || !authService) return;

      // Initialize state
      setAuthState(authService.getState());

      // Subscribe for updates
      const unsubscribe = authService.subscribe((newState) => {
        setAuthState(newState);
      });

      // cleanup
      return () => {
        unsubscribe();
      };
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      const authService = await getAuthService();
      if (authService) {
        await authService.login(credentials);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const authService = await getAuthService();
    if (authService) {
      authService.logout();
    }
  }, []);

  const getValidToken = useCallback(async () => {
    const authService = await getAuthService();
    if (authService) {
      return await authService.getAccessToken();
    }
    return null;
  }, []);

  return {
    ...authState,
    login,
    logout,
    getValidToken,
  };
}

// React компонент для защищенных маршрутов
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requiredRoles = [],
  fallback = <div>Access denied</div>,
}: ProtectedRouteProps): JSX.Element {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  if (requiredRoles.length > 0 && !hasPermission(user, requiredRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Компонент для отображения информации о пользователе
export function UserInfo(): JSX.Element {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <div>Not authenticated</div>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <p>Email: {user.email}</p>
      {user.roles && user.roles.length > 0 && (
        <p>Roles: {user.roles.join(", ")}</p>
      )}
    </div>
  );
}

// Компонент кнопки выхода
interface LogoutButtonProps {
  children?: React.ReactNode;
  onLogout?: () => void;
}

export function LogoutButton({
  children = "Logout",
  onLogout,
}: LogoutButtonProps): JSX.Element {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    onLogout?.();
  };

  return <button onClick={handleLogout}>{children}</button>;
}
