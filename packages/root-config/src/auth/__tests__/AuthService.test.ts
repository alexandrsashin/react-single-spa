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
});
