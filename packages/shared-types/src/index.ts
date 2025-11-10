// Shared types used across microfrontends

export interface User {
  id: string;
  email: string;
  name: string;
  roles?: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthService {
  getState(): AuthState;
  isAuthenticated(): boolean;
  getCurrentUser(): User | null;
  subscribe(callback: (state: AuthState) => void): () => void;
  getValidAccessToken(): Promise<string | null>;
  login(credentials: LoginCredentials): Promise<void>;
  logout(): void;
}

interface AuthEvents {
  AUTH_STATE_CHANGED: "auth:state-changed";
  AUTH_LOGIN_SUCCESS: "auth:login-success";
  AUTH_LOGOUT: "auth:logout";
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed";
  AUTH_ERROR: "auth:error";
}

export const AUTH_EVENTS: AuthEvents = {
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_LOGIN_SUCCESS: "auth:login-success",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed",
  AUTH_ERROR: "auth:error",
};

export interface NavigationUtilsAPI {
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

export type SharedCustomProps = {
  sharedState: {
    authService: AuthService;
    navigationUtils?: NavigationUtilsAPI;
  };
};
