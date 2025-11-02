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

const AUTH_EVENTS = {
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_LOGIN_SUCCESS: "auth:login-success",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed",
  AUTH_ERROR: "auth:error",
} as const;

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

// Утилита для проверки ролей
export function hasRole(user: User | null, role: string): boolean {
  return user?.roles?.includes(role) || false;
}

// Утилита для проверки прав доступа
export function hasPermission(user: User | null, permissions: string[]): boolean {
  if (!user?.roles) return false;
  return permissions.some((permission) => user.roles?.includes(permission));
}

// Утилита для прослушивания событий авторизации
function subscribeToAuthEvents(
  eventType: keyof typeof AUTH_EVENTS,
  callback: (event: CustomEvent) => void
): () => void {
  const eventName = AUTH_EVENTS[eventType];

  window.addEventListener(eventName, callback as EventListener);

  return () => {
    window.removeEventListener(eventName, callback as EventListener);
  };
}

// Получение актуального токена для API запросов
export async function getAuthToken(): Promise<string | null> {
  const authService = getAuthService();
  if (!authService) return null;

  return await authService.getValidAccessToken();
}

// Проверка аутентификации
function isUserAuthenticated(): boolean {
  const authService = getAuthService();
  return authService?.isAuthenticated() || false;
}

// Получение текущего пользователя
function getCurrentUser(): User | null {
  const authService = getAuthService();
  return authService?.getCurrentUser() || null;
}

// Глобальные типы для TypeScript
declare global {
  interface Window {
    authService: AuthAPI;
  }
}
