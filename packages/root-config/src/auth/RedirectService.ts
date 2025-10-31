import { authService } from "./AuthService";
import { AUTH_EVENTS } from "./types";

class RedirectService {
  private initialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (this.initialized) return;

    // Инициализируем редиректы после загрузки DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupRedirects()
      );
    } else {
      this.setupRedirects();
    }

    this.initialized = true;
  }

  private setupRedirects(): void {
    // Обрабатываем изначальную загрузку страницы
    this.handleInitialNavigation();

    // Слушаем изменения в истории браузера
    window.addEventListener("popstate", () => {
      this.handleNavigation();
    });

    // Перехватываем программную навигацию
    this.wrapHistoryMethods();

    // Подписываемся на изменения состояния авторизации
    authService.subscribe((authState) => {
      // Если пользователь разлогинился, редиректим на /login
      if (!authState.isAuthenticated && !this.isOnLoginPage()) {
        this.redirectTo("/login");
      }
    });

    // Слушаем событие успешного логина
    window.addEventListener(AUTH_EVENTS.AUTH_LOGIN_SUCCESS, () => {
      // После успешного логина перенаправляем на корень
      this.redirectTo("/");
    });
  }

  private handleInitialNavigation(): void {
    // Небольшая задержка для инициализации authService
    setTimeout(() => {
      this.handleNavigation();
    }, 100);
  }

  private handleNavigation(): void {
    const currentPath = window.location.pathname;
    const isAuthenticated = authService.isAuthenticated();

    // Если пользователь на корневой странице или пустом пути
    if (currentPath === "/" || currentPath === "") {
      if (isAuthenticated) {
        this.redirectTo("/user");
      } else {
        this.redirectTo("/login");
      }
      return;
    }

    // Если пользователь не авторизован и пытается попасть на /user
    if (!isAuthenticated && currentPath.startsWith("/user")) {
      this.redirectTo("/login");
      return;
    }

    // Если пользователь уже авторизован и находится на /login
    if (isAuthenticated && currentPath.startsWith("/login")) {
      this.redirectTo("/user");
      return;
    }
  }

  private redirectTo(path: string): void {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
      // Диспатчим событие изменения URL для single-spa
      window.dispatchEvent(new PopStateEvent("popstate"));
    }
  }

  private isOnLoginPage(): boolean {
    return window.location.pathname.startsWith("/login");
  }

  private wrapHistoryMethods(): void {
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      const result = originalPushState.apply(window.history, args);
      setTimeout(() => this.handleNavigation(), 0);
      return result;
    };

    window.history.replaceState = (...args) => {
      const result = originalReplaceState.apply(window.history, args);
      setTimeout(() => this.handleNavigation(), 0);
      return result;
    };
  }

  // Публичный метод для программного редиректа
  public navigateTo(path: string): void {
    this.redirectTo(path);
  }

  // Метод для проверки, нужен ли редирект
  public shouldRedirect(targetPath: string): string | null {
    const isAuthenticated = authService.isAuthenticated();

    if (targetPath === "/" || targetPath === "") {
      return isAuthenticated ? "/user" : "/login";
    }

    if (!isAuthenticated && targetPath.startsWith("/user")) {
      return "/login";
    }

    if (isAuthenticated && targetPath.startsWith("/login")) {
      return "/user";
    }

    return null;
  }
}

// Создаем singleton instance
export const redirectService = new RedirectService();

// Экспортируем для использования в microfrontends
declare global {
  interface Window {
    redirectService: RedirectService;
  }
}

window.redirectService = redirectService;
