// Shared utilities для работы с авторизацией в microfrontends
import { AuthState, User, AUTH_EVENTS } from "../root-config/src/auth/types";

export interface AuthAPI {
  getState(): AuthState;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  getValidAccessToken(): Promise<string | null>;
  login(credentials: { email: string; password: string }): Promise<void>;
  logout(): void;
  subscribe(callback: (state: AuthState) => void): () => void;
}

// Получение AuthService из global scope (root-config)
export function getAuthService(): AuthAPI | null {
  if (typeof window !== "undefined" && window.authService) {
    return window.authService;
  }

  console.warn(
    "AuthService not available. Make sure root-config is loaded first."
  );
  return null;
}

// Hook для React компонентов
export function useAuth() {
  const [authState, setAuthState] = React.useState<AuthState>(() => {
    const authService = getAuthService();
    return (
      authService?.getState() || {
        isAuthenticated: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      }
    );
  });

  React.useEffect(() => {
    const authService = getAuthService();
    if (!authService) return;

    // Инициализируем состояние
    setAuthState(authService.getState());

    // Подписываемся на изменения
    const unsubscribe = authService.subscribe((newState) => {
      setAuthState(newState);
    });

    return unsubscribe;
  }, []);

  const login = React.useCallback(
    async (credentials: { email: string; password: string }) => {
      const authService = getAuthService();
      if (authService) {
        await authService.login(credentials);
      }
    },
    []
  );

  const logout = React.useCallback(() => {
    const authService = getAuthService();
    if (authService) {
      authService.logout();
    }
  }, []);

  const getValidToken = React.useCallback(async () => {
    const authService = getAuthService();
    if (authService) {
      return await authService.getValidAccessToken();
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

// Утилита для проверки ролей
export function hasRole(user: User | null, role: string): boolean {
  return user?.roles?.includes(role) || false;
}

// Утилита для проверки прав доступа
export function hasPermission(
  user: User | null,
  permissions: string[]
): boolean {
  if (!user?.roles) return false;
  return permissions.some((permission) => user.roles?.includes(permission));
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
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (requireAuth && !isAuthenticated) {
    return <div>Please log in to access this page</div>;
  }

  if (requiredRoles.length > 0 && !hasPermission(user, requiredRoles)) {
    return fallback;
  }

  return <>{children}</>;
}

// Глобальные типы для TypeScript
declare global {
  interface Window {
    authService: AuthAPI;
  }

  // Для использования React без import
  var React: any;
}
