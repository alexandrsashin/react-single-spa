import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const modulePath = "./microfrontend-css-loader";

const manifestStub = {
  "src/main.ts": {
    file: "main-B123.js",
    css: ["assets/main.css"],
  },
};

function mockFetchWithManifest(manifest: Record<string, unknown>) {
  const response = {
    json: vi.fn().mockResolvedValue(manifest),
  } as unknown as Response;
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function flushPromises() {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), 0);
  });
}

describe("microfrontend-css-loader", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    document.head.innerHTML = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  test("loads CSS from manifest before resolving", async () => {
    vi.stubEnv("PROD", "true");
    const fetchMock = mockFetchWithManifest(manifestStub);

    const { loadMicrofrontendCSS } = await import(modulePath);

    const promise = loadMicrofrontendCSS({
      appName: "test-app",
      manifestPath: "/dist/test-app/.vite/manifest.json",
    });

    await flushPromises();

    const link = document.querySelector(
      'link[href="/dist/test-app/assets/main.css"]',
    ) as HTMLLinkElement | null;

    expect(link).toBeTruthy();
    expect(link?.dataset.cssStatus).toBe("loading");
    expect(fetchMock).toHaveBeenCalledWith(
      "/dist/test-app/.vite/manifest.json",
    );

    link!.dispatchEvent(new Event("load"));
    await promise;

    expect(link?.dataset.cssStatus).toBe("loaded");
  });

  test("reuses existing loading link and waits for completion", async () => {
    vi.stubEnv("PROD", "true");
    mockFetchWithManifest(manifestStub);

    const existingLink = document.createElement("link");
    existingLink.rel = "stylesheet";
    existingLink.href = "/dist/test-app/assets/main.css";
    document.head.appendChild(existingLink);

    const { loadMicrofrontendCSS } = await import(modulePath);

    const promise = loadMicrofrontendCSS({
      appName: "test-app",
      manifestPath: "/dist/test-app/.vite/manifest.json",
    });

    await flushPromises();

    expect(existingLink.dataset.cssStatus).toBe("loading");

    existingLink.dispatchEvent(new Event("load"));
    await promise;

    expect(existingLink.dataset.cssStatus).toBe("loaded");
  });

  test("skips CSS loading in development mode", async () => {
    vi.stubEnv("PROD", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { loadMicrofrontendCSS } = await import(modulePath);

    await loadMicrofrontendCSS({
      appName: "test-app",
      manifestPath: "/dist/test-app/.vite/manifest.json",
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(document.querySelectorAll("link").length).toBe(0);
  });
});
