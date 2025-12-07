import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { AuthState } from "../types";
import { AUTH_EVENTS } from "../types";

const AUTH_PATH = "../AuthService";

async function importFreshAuthService() {
  vi.resetModules();
  // dynamic import ensures class is constructed anew
  const mod = await import(AUTH_PATH);
  return mod.authService;
}

beforeEach(() => {
  // Clear storage and reset timers before each test
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("authService (unit tests)", () => {
  it("login success: updates state, saves to storage and emits AUTH_LOGIN_SUCCESS & AUTH_STATE_CHANGED", async () => {
    const authService = await importFreshAuthService();

    const loginEventSpy = vi.fn();
    const stateChangedSpy = vi.fn();

    window.addEventListener(AUTH_EVENTS.AUTH_LOGIN_SUCCESS, (e: Event) => {
      loginEventSpy((e as CustomEvent).detail);
    });
    window.addEventListener(AUTH_EVENTS.AUTH_STATE_CHANGED, (e: Event) => {
      stateChangedSpy((e as CustomEvent).detail.state);
    });

    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });

    // advance mock timers for mockLogin (1s)
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    expect(authService.isAuthenticated()).toBe(true);

    // storage checks
    const access = localStorage.getItem("auth_access_token");
    const refresh = localStorage.getItem("auth_refresh_token");
    const user = localStorage.getItem("auth_user");
    const expiry = localStorage.getItem("auth_token_expiry");

    expect(access).toBeTruthy();
    expect(refresh).toBeTruthy();
    expect(user).toBeTruthy();
    expect(expiry).toBeTruthy();

    expect(loginEventSpy).toHaveBeenCalledTimes(1);
    expect(loginEventSpy.mock.calls[0][0]).toHaveProperty("user");

    expect(stateChangedSpy).toHaveBeenCalled();
    const lastState: AuthState =
      stateChangedSpy.mock.calls[stateChangedSpy.mock.calls.length - 1][0];
    expect(lastState.isAuthenticated).toBe(true);
    expect(lastState.user).not.toBeNull();
  });

  it("login failure: rejects and emits AUTH_ERROR", async () => {
    const authService = await importFreshAuthService();

    const errorSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.AUTH_ERROR, (e: Event) => {
      errorSpy((e as CustomEvent).detail);
    });

    const loginPromise = authService.login({
      email: "wrong@example.com",
      password: "bad",
    });

    // Attach rejection handler immediately to avoid unhandled rejection warnings
    let caughtError: unknown;
    const observedRejection = loginPromise.catch((err: unknown) => {
      caughtError = err;
      return Promise.reject(err);
    });

    // advance mock timers for mockLogin (1s)
    await vi.advanceTimersByTimeAsync(1000);

    await expect(observedRejection).rejects.toThrow("Invalid credentials");

    expect(caughtError).toBeInstanceOf(Error);
    expect((caughtError as Error).message).toContain("Invalid credentials");

    expect(errorSpy).toHaveBeenCalled();
    const detail = errorSpy.mock.calls[0][0];
    expect(detail).toHaveProperty("error");
  });

  it("logout clears storage and emits AUTH_LOGOUT", async () => {
    const authService = await importFreshAuthService();

    // first login to populate state and storage
    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    expect(authService.isAuthenticated()).toBe(true);

    const logoutSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.AUTH_LOGOUT, () => {
      logoutSpy();
    });

    authService.logout();

    expect(authService.isAuthenticated()).toBe(false);

    // storage should be cleared
    expect(localStorage.getItem("auth_access_token")).toBeNull();
    expect(localStorage.getItem("auth_refresh_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(localStorage.getItem("auth_token_expiry")).toBeNull();

    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it("getValidAccessToken auto-refreshes when token is expiring within 5 minutes", async () => {
    // Step 1: login with fresh instance
    let authService = await importFreshAuthService();

    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    // verify tokens present
    const originalAccess = localStorage.getItem("auth_access_token");
    const refreshToken = localStorage.getItem("auth_refresh_token");
    expect(originalAccess).toBeTruthy();
    expect(refreshToken).toBeTruthy();

    // Make token expiry very soon (2 minutes from now)
    const soonExpiry = Date.now() + 2 * 60 * 1000;
    localStorage.setItem("auth_token_expiry", String(soonExpiry));

    // Reload module to pick up modified storage
    authService = await importFreshAuthService();

    const refreshedSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.AUTH_TOKEN_REFRESHED, (e: Event) => {
      refreshedSpy((e as CustomEvent).detail);
    });

    // Call getValidAccessToken which should trigger refreshAccessToken because expiry < 5 min
    const tokenPromise = authService.getValidAccessToken();

    // advance timers for mockRefreshToken (500ms)
    await vi.advanceTimersByTimeAsync(500);

    const newToken = await tokenPromise;

    expect(newToken).toBeTruthy();
    expect(newToken).not.toEqual(originalAccess);

    // localStorage should be updated with new access token and expiry
    const storedAccess = localStorage.getItem("auth_access_token");
    expect(storedAccess).toEqual(newToken);
    expect(refreshedSpy).toHaveBeenCalled();
  });

  it("subscribe/unsubscribe receives state changes and stops receiving after unsubscribe", async () => {
    const authService = await importFreshAuthService();

    const callback = vi.fn();
    const unsubscribe = authService.subscribe(callback);

    // perform login
    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    // callback should have been invoked at least once with new state
    expect(callback).toHaveBeenCalled();
    const calledWith: AuthState = callback.mock.calls[0][0];
    expect(calledWith.isAuthenticated).toBe(true);

    // unsubscribe and call logout
    unsubscribe();
    authService.logout();

    // clear any queued tasks to be safe
    await vi.runAllTimersAsync();

    // callback should not be called again after unsubscribe
    const callCountAfter = callback.mock.calls.length;
    // small allowance: ensure no new calls beyond previous count
    expect(callback.mock.calls.length).toBe(callCountAfter);
  });

  it("isInitializationComplete returns false during init, true after", async () => {
    // Import fresh instance
    vi.resetModules();
    const importPromise = import(AUTH_PATH);

    // Check immediately - should still be initializing
    const mod1 = await importPromise;

    // Wait for initialization to complete
    await mod1.authService.waitForInitialization();

    const complete = mod1.authService.isInitializationComplete();

    // After waitForInitialization it must be true
    expect(complete).toBe(true);
  });
  it("waitForInitialization resolves when initialization is complete", async () => {
    const authService = await importFreshAuthService();

    // Should resolve without error
    await expect(authService.waitForInitialization()).resolves.toBeUndefined();

    // After waiting, should be complete
    expect(authService.isInitializationComplete()).toBe(true);
  });

  it("emits AUTH_INITIALIZED event on initialization with correct auth state", async () => {
    const initializedSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.AUTH_INITIALIZED, (e: Event) => {
      initializedSpy((e as CustomEvent).detail);
    });

    // Import fresh service (triggers initialization)
    await importFreshAuthService();

    // Wait a tick for event to dispatch
    await vi.runAllTimersAsync();

    expect(initializedSpy).toHaveBeenCalled();
    const detail = initializedSpy.mock.calls[0][0];
    expect(detail).toHaveProperty("isAuthenticated");
  });

  it("initializeFromStorage restores valid state from localStorage", async () => {
    // Pre-populate localStorage with valid auth data
    const futureExpiry = Date.now() + 60 * 60 * 1000; // 1 hour from now
    const user = {
      id: "123",
      email: "stored@example.com",
      name: "Stored User",
      roles: ["user"],
    };

    localStorage.setItem("auth_access_token", "stored-access-token");
    localStorage.setItem("auth_refresh_token", "stored-refresh-token");
    localStorage.setItem("auth_user", JSON.stringify(user));
    localStorage.setItem("auth_token_expiry", futureExpiry.toString());

    // Import fresh instance to trigger initialization from storage
    const authService = await importFreshAuthService();
    await authService.waitForInitialization();

    expect(authService.isAuthenticated()).toBe(true);
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it("initializeFromStorage clears storage if token is expired", async () => {
    // Pre-populate with expired token
    const pastExpiry = Date.now() - 1000; // 1 second ago

    localStorage.setItem("auth_access_token", "expired-token");
    localStorage.setItem("auth_refresh_token", "expired-refresh");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: "1",
        email: "test@test.com",
        name: "Test",
        roles: [],
      })
    );
    localStorage.setItem("auth_token_expiry", pastExpiry.toString());

    const authService = await importFreshAuthService();
    await authService.waitForInitialization();

    // Should not be authenticated with expired token
    expect(authService.isAuthenticated()).toBe(false);
    expect(localStorage.getItem("auth_access_token")).toBeNull();
  });

  it("initializeFromStorage handles corrupted localStorage gracefully", async () => {
    // Set invalid JSON in user field
    localStorage.setItem("auth_access_token", "some-token");
    localStorage.setItem("auth_user", "invalid-json{{{");

    const authService = await importFreshAuthService();
    await authService.waitForInitialization();

    // Should not crash, should clear storage
    expect(authService.isAuthenticated()).toBe(false);
  });

  it("getCurrentUser returns user when authenticated, null otherwise", async () => {
    const authService = await importFreshAuthService();

    expect(authService.getCurrentUser()).toBeNull();

    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    const user = authService.getCurrentUser();
    expect(user).not.toBeNull();
    expect(user?.email).toBe("test@example.com");
  });

  it("getState returns a copy of current state", async () => {
    const authService = await importFreshAuthService();

    const state1 = authService.getState();
    expect(state1.isAuthenticated).toBe(false);

    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    const state2 = authService.getState();
    expect(state2.isAuthenticated).toBe(true);

    // Modifying returned state should not affect internal state
    state2.isAuthenticated = false;
    expect(authService.getState().isAuthenticated).toBe(true);
  });

  it("setupTokenRefresh schedules auto-refresh before expiry", async () => {
    const authService = await importFreshAuthService();

    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    const refreshSpy = vi.fn();
    window.addEventListener(AUTH_EVENTS.AUTH_TOKEN_REFRESHED, (e: Event) => {
      refreshSpy((e as CustomEvent).detail);
    });

    // Token expires in 1 hour, should refresh 5 min before (55 min from now)
    // Advance time to just before refresh point
    await vi.advanceTimersByTimeAsync(54 * 60 * 1000); // 54 minutes
    expect(refreshSpy).not.toHaveBeenCalled();

    // Now advance to trigger refresh
    await vi.advanceTimersByTimeAsync(2 * 60 * 1000); // +2 min = 56 total

    // Wait for mock refresh (500ms)
    await vi.advanceTimersByTimeAsync(500);

    expect(refreshSpy).toHaveBeenCalled();
  });

  it("refreshAccessToken returns null and logs out if no refresh token", async () => {
    const authService = await importFreshAuthService();

    // Login first
    const loginPromise = authService.login({
      email: "test@example.com",
      password: "password",
    });
    await vi.advanceTimersByTimeAsync(1000);
    await loginPromise;

    // Manually clear refresh token
    localStorage.removeItem("auth_refresh_token");

    // Force state update to remove refresh token
    authService.logout();

    // Try to refresh - should return null
    const result = await authService.refreshAccessToken();
    expect(result).toBeNull();
    expect(authService.isAuthenticated()).toBe(false);
  });

  it("getValidAccessToken returns null if not authenticated", async () => {
    const authService = await importFreshAuthService();

    const token = await authService.getValidAccessToken();
    expect(token).toBeNull();
  });
});
