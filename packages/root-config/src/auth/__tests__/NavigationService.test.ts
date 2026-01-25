import { type Mock } from "vitest";

type MockAuthService = {
  isAuthenticated: () => boolean;
  logout: () => void;
};

async function importNavWithMock(opts?: { isAuthenticated?: boolean }) {
  vi.resetModules();
  const mockAuthService: MockAuthService = {
    isAuthenticated: vi.fn().mockReturnValue(Boolean(opts?.isAuthenticated)),
    logout: vi.fn(),
  };

  // Provide the mock before importing NavigationService
  // the module under test imports the auth service at ../AuthService from
  // this test's location, so mock that path
  vi.doMock("../AuthService", () => ({ authService: mockAuthService }));

  const mod = await import("../NavigationService");
  return { navigationService: mod.navigationService, mockAuthService };
}

function clearPopStateListeners() {
  // Recreate history state to remove potential lingering listeners in some environments
  // (there is no direct way to remove all listeners; tests attach their own spies per-test)
  // Ensure a known baseline location
  window.history.pushState({}, "", "/");
}

beforeEach(() => {
  // Ensure clean environment
  clearPopStateListeners();
  localStorage.clear();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.resetModules();
  clearPopStateListeners();
});

describe("NavigationService", () => {
  it("goToLogin pushes /login and dispatches popstate", async () => {
    const { navigationService } = await importNavWithMock();
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    navigationService.goToLogin();

    expect(window.location.pathname).toBe("/login");
    expect(popSpy).toHaveBeenCalled();
  });

  it("goToUser navigates to /user when authenticated", async () => {
    const { navigationService } = await importNavWithMock({
      isAuthenticated: true,
    });
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    navigationService.goToUser();

    expect(window.location.pathname).toBe("/user");
    expect(popSpy).toHaveBeenCalled();
  });

  it("goToUser redirects to /login when not authenticated", async () => {
    const { navigationService } = await importNavWithMock({
      isAuthenticated: false,
    });
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    navigationService.goToUser();

    expect(window.location.pathname).toBe("/login");
    expect(popSpy).toHaveBeenCalled();
  });

  it("goToHome pushes / and dispatches popstate", async () => {
    const { navigationService } = await importNavWithMock();
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    navigationService.goToHome();

    expect(window.location.pathname).toBe("/");
    expect(popSpy).toHaveBeenCalled();
  });

  it("logout calls authService.logout and redirects to /", async () => {
    const { navigationService, mockAuthService } = await importNavWithMock({
      isAuthenticated: true,
    });
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    // Start at a different route
    window.history.pushState({}, "", "/somewhere");

    navigationService.logout();

    expect(
      (mockAuthService.logout as unknown as Mock).mock?.calls === undefined
        ? true
        : true,
    ).toBe(true);
    // The above line is a no-op compatibility check; assert call separately:
    expect((mockAuthService.logout as unknown as Mock).mock.calls.length).toBe(
      1,
    );

    expect(window.location.pathname).toBe("/");
    expect(popSpy).toHaveBeenCalled();
  });

  it("getCurrentRoute returns pathname, search and hash; isOnRoute works", async () => {
    const { navigationService } = await importNavWithMock();
    window.history.pushState({}, "", "/foo/bar?x=1#section");

    const route = navigationService.getCurrentRoute();
    expect(route.pathname).toBe("/foo/bar");
    expect(route.search).toBe("?x=1");
    expect(route.hash).toBe("#section");

    expect(navigationService.isOnRoute("/foo")).toBe(true);
    expect(navigationService.isOnRoute("/other")).toBe(false);
  });

  it("canAccessRoute allows /login to everyone, /user only to authenticated, others to all", async () => {
    let navWithMock = await importNavWithMock({ isAuthenticated: false });
    let navigationService = navWithMock.navigationService;

    expect(navigationService.canAccessRoute("/login")).toBe(true);
    expect(navigationService.canAccessRoute("/user")).toBe(false);
    expect(navigationService.canAccessRoute("/public")).toBe(true);

    // Re-import with authenticated user
    navWithMock = await importNavWithMock({ isAuthenticated: true });
    navigationService = navWithMock.navigationService;

    expect(navigationService.canAccessRoute("/user")).toBe(true);
  });

  it("navigateTo goes to route when allowed; redirects appropriately when not allowed", async () => {
    // Allowed route
    let result = await importNavWithMock({ isAuthenticated: false });
    let navigationService = result.navigationService;
    const popSpy = vi.fn();
    window.addEventListener("popstate", popSpy);

    navigationService.navigateTo("/about");
    expect(window.location.pathname).toBe("/about");
    expect(popSpy).toHaveBeenCalled();

    // Not allowed: trying to navigate to /user when not authenticated -> should go to /login
    result = await importNavWithMock({ isAuthenticated: false });
    navigationService = result.navigationService;
    window.history.pushState({}, "", "/");
    navigationService.navigateTo("/user");
    expect(window.location.pathname).toBe("/login");

    // Not allowed but authenticated: navigateTo('/user') should succeed
    result = await importNavWithMock({ isAuthenticated: true });
    navigationService = result.navigationService;
    window.history.pushState({}, "", "/");
    navigationService.navigateTo("/user");
    expect(window.location.pathname).toBe("/user");
  });
});
