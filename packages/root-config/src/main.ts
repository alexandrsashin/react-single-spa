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
import { showLoader, hideLoader } from "./components/AppLoader";
import "antd/dist/reset.css"; // ensure Ant Design base styles load early to avoid FOUC

// Показываем лоадер при старте
showLoader("Проверка авторизации...");

// Ensure module is loaded for its side-effects (do not add to sharedState per config)
void redirectService;

// Inject minimal layout CSS so sidebar is left and other apps render to the right
(function injectLayoutStyles() {
  const style = document.createElement("style");
  style.textContent = `
    .root-layout { display: flex; min-height: 100vh; }
    .left-col { width: 220px; flex: 0 0 220px; background: #ffffff; border-right: 1px solid #eee; }
    .right-col { flex: 1 1 auto; min-height: 100vh; background: #f7f7f7; }
    /* ensure apps rendered inside right-col take full width */
    .right-col > * { width: 100%; }
  `.trim();
  document.head.appendChild(style);
})();

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
        menuConfig: [
          { key: "/user", label: "Личный кабинет", roles: ["user"] },
          { key: "/admin", label: "Админка", roles: ["admin"] },
          { key: "/about", label: "О сайте" },
        ],
      },
    },
  };

  registerApplication(appWithProps);
});

// Дождаться инициализации authService перед запуском приложения
(async () => {
  await authService.waitForInitialization();

  // Скрываем лоадер после завершения инициализации
  hideLoader();

  // Проверяем, нужен ли редирект после инициализации
  const isAuthenticated = authService.isAuthenticated();
  const currentPath = window.location.pathname;
  const publicRoutes = ["/login"];
  const isPublicRoute = publicRoutes.some((route) =>
    currentPath.startsWith(route)
  );

  if (currentPath === "/" || currentPath === "") {
    if (isAuthenticated) {
      window.history.replaceState(null, "", "/user");
    } else {
      window.history.replaceState(null, "", "/login");
    }
  } else if (!isAuthenticated && !isPublicRoute) {
    // Если неавторизован и пытается попасть на защищённый маршрут (не публичный)
    // Сохраняем текущий путь в query-параметре redirectTo
    const loginUrl = `/login?redirectTo=${encodeURIComponent(currentPath)}`;
    window.history.replaceState(null, "", loginUrl);
  } else if (isAuthenticated && currentPath.startsWith("/login")) {
    // Если авторизован и на странице логина, проверяем redirectTo
    const urlParams = new URLSearchParams(window.location.search);
    const redirectTo = urlParams.get("redirectTo");

    if (redirectTo && redirectTo !== "/login") {
      window.history.replaceState(null, "", redirectTo);
    } else {
      window.history.replaceState(null, "", "/user");
    }
  }

  layoutEngine.activate();
  start();
})();

// --- Root-config 404 handling (render Antd Result for non-/login and non-/user routes) ---
function ensureNotFoundContainer() {
  // Prefer to mount the NotFound container inside the current .right-col so it
  // appears together with the header and other right-side apps. Fall back to
  // body if .right-col is not present yet.
  let el = document.getElementById("root-config-not-found");
  if (!el) {
    el = document.createElement("div");
    el.id = "root-config-not-found";
    Object.assign(el.style, {
      position: "relative",
      zIndex: "1000",
      padding: "16px",
    } as Partial<CSSStyleDeclaration>);

    const rightCol = document.querySelector(".right-col");
    if (rightCol && rightCol instanceof HTMLElement) {
      rightCol.appendChild(el);
    } else {
      // If layout hasn't been rendered yet, append to body as fallback.
      document.body.appendChild(el);
    }
  }

  return el;
}

function showNotFoundIfNeeded() {
  const path = window.location.pathname || "/";
  // track whether NotFound has been mounted to avoid unnecessary unmount/remount
  // when switching between multiple non-existent routes
  // (module-level flag below)
  // Список известных маршрутов (не показываем 404)
  const knownRoutes = ["/login", "/user", "/roles", "/admin", "/"];
  const isKnownRoute = knownRoutes.some(
    (route) => path === route || path.startsWith(route + "/")
  );

  if (!isKnownRoute) {
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
