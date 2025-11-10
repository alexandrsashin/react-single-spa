import "@testing-library/jest-dom";

// You can add any global test setup here, for example mocking fetch or console
// Example: globalThis.fetch = globalThis.fetch || (() => Promise.reject('no fetch'));

// Prevent vitest from failing the run on expected rejected promises that are
// handled asynchronously by tests (e.g. negative login tests that reject
// inside timers). We still rethrow unknown errors so real issues surface.
process.on("unhandledRejection", (err) => {
  try {
    if (err && (err as Error).message === "Invalid credentials") {
      // swallow expected invalid credentials rejection used in tests
      return;
    }
  } catch (_ignored) {
    // ignore
    void _ignored;
  }
  // If it's not the known test rejection, rethrow so Vitest will fail the run
  throw err as Error;
});

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
  window.addEventListener("unhandledrejection", (ev: PromiseRejectionEvent) => {
    const reason = (ev as unknown as { reason?: unknown }).reason as Error | undefined;
    if (reason && reason.message === "Invalid credentials") {
      ev.preventDefault();
    }
  });
}
