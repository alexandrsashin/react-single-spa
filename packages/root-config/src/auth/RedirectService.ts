import { authService } from "./AuthService";
import { AUTH_EVENTS } from "./types";

class RedirectService {
  private initialized = false;

  // Список публичных маршрутов (доступны всем)
  // Все остальные маршруты считаются защищёнными и требуют авторизации
  private publicRoutes = ["/login"];

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
    // Ждём инициализации authService перед обработкой навигации
    authService.waitForInitialization().then(() => {
      this.handleNavigation();
    });
  }

  private handleNavigation(): void {
    // Не выполняем редиректы, пока идёт инициализация
    if (!authService.isInitializationComplete()) {
      return;
    }

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

    // Проверяем, является ли текущий путь публичным
    const isPublicRoute = this.publicRoutes.some((route) =>
      currentPath.startsWith(route)
    );

    // Если пользователь не авторизован и пытается попасть на защищённый маршрут (не публичный)
    if (!isAuthenticated && !isPublicRoute) {
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

    const isPublicRoute = this.publicRoutes.some((route) =>
      targetPath.startsWith(route)
    );

    if (!isAuthenticated && !isPublicRoute) {
      return "/login";
    }

    if (isAuthenticated && targetPath.startsWith("/login")) {
      return "/user";
    }

    return null;
  }

  // Публичный метод для добавления публичного маршрута
  public addPublicRoute(route: string): void {
    if (!this.publicRoutes.includes(route)) {
      this.publicRoutes.push(route);
    }
  }

  // Публичный метод для получения списка публичных маршрутов
  public getPublicRoutes(): string[] {
    return [...this.publicRoutes];
  }
}

// Создаем и экспортируем singleton instance
export const redirectService = new RedirectService();
