// Утилиты для навигации между микрофронтендами

import { authService } from "./auth/AuthService";

export class NavigationUtils {
  // Навигация на страницу логина
  static goToLogin(): void {
    window.history.pushState(null, "", "/login");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Навигация на пользовательскую страницу (только для авторизованных)
  static goToUser(): void {
    if (authService.isAuthenticated()) {
      window.history.pushState(null, "", "/user");
      window.dispatchEvent(new PopStateEvent("popstate"));
    } else {
      this.goToLogin();
    }
  }

  // Навигация на главную страницу (с автоматическим редиректом)
  static goToHome(): void {
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  // Выход из системы с редиректом на главную страницу
  static logout(): void {
    authService.logout();
    this.goToHome(); // Перенаправляем на /, который автоматически редиректит на /login
  }

  // Получение текущего маршрута
  static getCurrentRoute(): {
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
  static isOnRoute(route: string): boolean {
    return window.location.pathname.startsWith(route);
  }

  // Проверка доступности маршрута для текущего пользователя
  static canAccessRoute(route: string): boolean {
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
  static navigateTo(route: string): void {
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

// Экспортируем для глобального использования
declare global {
  interface Window {
    NavigationUtils: typeof NavigationUtils;
  }
}

window.NavigationUtils = NavigationUtils;

export default NavigationUtils;
