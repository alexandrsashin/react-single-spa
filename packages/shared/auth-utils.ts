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

// Получение AuthService из shared module (root-config export)
export async function getAuthService(): Promise<AuthAPI | null> {
  // Use the singleton `authService` exported by the root-config package
  // This is the preferred way to access auth service in microfrontends
  // instead of using global window object
  try {
    // dynamic import to avoid ESM/CJS issues and keep this function async
    const module: any = await import("../root-config/src/auth/AuthService");
    // module should export `authService`
    const rootAuthService = module?.authService;
    if (rootAuthService) return rootAuthService as AuthAPI;
  } catch {
    // ignore and fall back to window
  }

  console.warn(
    "AuthService not available. Make sure root-config is loaded first."
  );
  return null;
}

// Утилита для проверки прав доступа
export function hasPermission(
  user: User | null,
  permissions: string[]
): boolean {
  if (!user?.roles) return false;
  return permissions.some((permission) => user.roles?.includes(permission));
}

// Получение актуального токена для API запросов
export async function getAuthToken(): Promise<string | null> {
  const authService = await getAuthService();
  if (!authService) return null;

  return await authService.getValidAccessToken();
}

// Глобальные типы для TypeScript
declare global {
  interface Window {
    authService: AuthAPI;
  }
}
