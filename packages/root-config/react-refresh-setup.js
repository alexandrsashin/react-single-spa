/**
 * React Refresh Setup
 * Handles React Refresh configuration for HMR during development
 */

function setupReactRefresh() {
  const isDev =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

  if (!isDev) {
    return;
  }

  const devServers = [
    "http://localhost:3006",
    "http://localhost:3007",
    "http://localhost:3008",
  ];

  // Setup React Refresh global variables
  window.$RefreshReg$ = () => {};
  window.$RefreshSig$ = () => (type) => type;
  window.__vite_plugin_react_preamble_installed__ = true;

  // Inject React Refresh runtime from each dev server
  devServers.forEach((origin) => {
    const script = document.createElement("script");
    script.type = "module";
    script.textContent = `
      import RefreshRuntime from '${origin}/@react-refresh';
      RefreshRuntime.injectIntoGlobalHook(window);
    `;
    document.head.appendChild(script);
  });
}

export { setupReactRefresh };
