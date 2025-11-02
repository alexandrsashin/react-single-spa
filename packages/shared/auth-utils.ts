// Shared utilities для работы с авторизацией в microfrontends
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

interface AuthAPI {
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

  console.warn("AuthService not available. Make sure root-config is loaded first.");
  return null;
}

// Утилита для проверки прав доступа
export function hasPermission(user: User | null, permissions: string[]): boolean {
  if (!user?.roles) return false;
  return permissions.some((permission) => user.roles?.includes(permission));
}

// Получение актуального токена для API запросов
export async function getAuthToken(): Promise<string | null> {
  const authService = getAuthService();
  if (!authService) return null;

  return await authService.getValidAccessToken();
}

// Глобальные типы для TypeScript
declare global {
  interface Window {
    authService: AuthAPI;
  }
}
