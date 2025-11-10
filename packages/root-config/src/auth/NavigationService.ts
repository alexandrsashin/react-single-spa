import { authService } from "./AuthService";

class NavigationService {
  // Навигация на страницу логина
  goToLogin(): void {
    window.history.pushState(null, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Навигация на пользовательскую страницу (только для авторизованных)
  goToUser(): void {
    if (authService.isAuthenticated()) {
      window.history.pushState(null, "", "/user");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      this.goToLogin();
    }
  }

  // Навигация на главную страницу (с автоматическим редиректом)
  goToHome(): void {
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Выход из системы с редиректом на главную страницу
  logout(): void {
    authService.logout();
    this.goToHome(); // Перенаправляем на /, который автоматически редиректит на /login
  }

  // Получение текущего маршрута
  getCurrentRoute(): {
    pathname: string;
    search: string;
    hash: string;
  } {
    return {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    };
  }

  // Проверка, находится ли пользователь на определенном маршруте
  isOnRoute(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }

  // Проверка доступности маршрута для текущего пользователя
  canAccessRoute(route: string): boolean {
    const isAuthenticated = authService.isAuthenticated();

    // Маршрут /login доступен всем
    if (route.startsWith("/login")) {
      return true;
    }

    // Маршрут /user доступен только авторизованным
    if (route.startsWith("/user")) {
      return isAuthenticated;
    }

    // Остальные маршруты доступны всем
    return true;
  }

  // Безопасная навигация с проверкой доступа
  navigateTo(route: string): void {
    if (this.canAccessRoute(route)) {
      window.history.pushState(null, "", route);
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      // Если нет доступа, редиректим на подходящую страницу
      if (authService.isAuthenticated()) {
        this.goToUser();
      } else {
        this.goToLogin();
      }
    }
  }
}

// Export instance for sharedState usage
export const navigationService = new NavigationService();
