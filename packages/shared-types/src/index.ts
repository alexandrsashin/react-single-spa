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
  getAccessToken(): Promise<string | null>;
  login(credentials: LoginCredentials): Promise<void>;
  logout(): void;
}

interface AuthEvents {
  AUTH_STATE_CHANGED: "auth:state-changed";
  AUTH_LOGIN_SUCCESS: "auth:login-success";
  AUTH_LOGOUT: "auth:logout";
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed";
  AUTH_ERROR: "auth:error";
  AUTH_INITIALIZED: "auth:initialized";
}

export const AUTH_EVENTS: AuthEvents = {
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_LOGIN_SUCCESS: "auth:login-success",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed",
  AUTH_ERROR: "auth:error",
  AUTH_INITIALIZED: "auth:initialized",
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

export interface MenuItemConfig {
  key: string;
  label: string;
  roles?: string[]; // empty or omitted means public
}

export type SharedCustomProps = {
  sharedState: {
    authService: AuthService;
    navigationService?: NavigationUtilsAPI;
    menuConfig?: MenuItemConfig[];
  };
};
