import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import { microfrontendLayout } from "./microfrontend-layout";
import { authService } from "./auth/AuthService";
import { redirectService } from "./auth/RedirectService";
import { navigationService } from "./auth/NavigationService";

// Ensure module is loaded for its side-effects (do not add to sharedState per config)
void redirectService;

const routes = constructRoutes(microfrontendLayout);

const applications = constructApplications({
  routes,
  async loadApp({ name }: { name: string }) {
    try {
      const module = await import(/* @vite-ignore */ name);
      return module;
    } catch (error) {
      console.error(`Failed to load application ${name}:`, error);
      throw error;
    }
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach((app) => {
  const appWithProps = {
    ...app,
    customProps: {
      sharedState: {
        authService,
        navigationService,
      },
    },
  };

  registerApplication(appWithProps);
});
layoutEngine.activate();
start();

// --- Root-config 404 handling (render Antd Result for non-/login and non-/user routes) ---
function ensureNotFoundContainer() {
  let el = document.getElementById("root-config-not-found");
  if (!el) {
    el = document.createElement("div");
    el.id = "root-config-not-found";
    // keep it at the end of body so single-spa apps can render above it
    Object.assign(el.style, {
      position: "relative",
      zIndex: "1000",
    } as Partial<CSSStyleDeclaration>);
    document.body.appendChild(el);
  }
  return el;
}

function showNotFoundIfNeeded() {
  const path = window.location.pathname || "/";
  // track whether NotFound has been mounted to avoid unnecessary unmount/remount
  // when switching between multiple non-existent routes
  // (module-level flag below)
  // Only show 404 for routes that are not /login and not /user
  if (path !== "/login" && path !== "/user") {
    const container = ensureNotFoundContainer();
    // dynamic import so we don't bloat the initial bundle
    import("./components/NotFound").then((mod) => {
      // If component not mounted yet, mount it; otherwise update route to avoid remount
      if (
        !(window as unknown as { __rootConfigNotFoundMounted?: boolean })
          .__rootConfigNotFoundMounted
      ) {
        mod.renderNotFound(container, path, () => {
          mod.unmountNotFound();
          (
            window as unknown as { __rootConfigNotFoundMounted?: boolean }
          ).__rootConfigNotFoundMounted = false;
        });
        (
          window as unknown as { __rootConfigNotFoundMounted?: boolean }
        ).__rootConfigNotFoundMounted = true;
      } else if (typeof mod.updateNotFound === "function") {
        mod.updateNotFound(path);
      } else {
        // fallback: re-render
        mod.renderNotFound(container, path);
      }
    });
  } else {
    // if on allowed routes, ensure unmounted
    import("./components/NotFound").then((mod) => {
      if (typeof mod.unmountNotFound === "function") mod.unmountNotFound();
      (
        window as unknown as { __rootConfigNotFoundMounted?: boolean }
      ).__rootConfigNotFoundMounted = false;
    });
  }
}

// watch navigation
window.addEventListener("popstate", () => showNotFoundIfNeeded());
// initial check
showNotFoundIfNeeded();
