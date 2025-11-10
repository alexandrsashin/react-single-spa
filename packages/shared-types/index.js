// Runtime entry for shared-types package.
// Export runtime values that are needed by other packages (e.g. AUTH_EVENTS).
export const AUTH_EVENTS = {
  AUTH_STATE_CHANGED: "auth:state-changed",
  AUTH_LOGIN_SUCCESS: "auth:login-success",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESHED: "auth:token-refreshed",
  AUTH_ERROR: "auth:error",
};

// Default export (handy for some bundlers/resolvers)
export default {};
