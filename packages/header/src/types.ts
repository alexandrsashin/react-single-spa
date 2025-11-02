// Глобальные типы для Window объектов

export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

interface AuthService {
  getState(): AuthState;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  subscribe(callback: (state: AuthState) => void): () => void;
  logout(): void;
}

interface NavigationUtils {
  goToLogin(): void;
  goToUser(): void;
  goToHome(): void;
  logout(): void;
  navigateTo(route: string): void;
  canAccessRoute(route: string): boolean;
  getCurrentRoute(): {
    pathname: string;
    search: string;
    hash: string;
  };
}

declare global {
  interface Window {
    authService: AuthService;
    NavigationUtils: NavigationUtils;
    redirectService: any;
  }
}

export {};
