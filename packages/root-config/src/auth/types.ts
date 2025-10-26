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

export interface AuthEvents {
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
