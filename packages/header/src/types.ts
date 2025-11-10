interface NavigationService {
  goToLogin(): void;
  goToUser(): void;
  goToHome(): void;
  logout(): void;
  navigateTo(route: string): void;
  canAccessRoute(route: string): boolean;
  getCurrentRoute(): {
    pathname: string;
    search: string;
    hash: string;
  };
}

declare global {
  interface Window {
    NavigationService: NavigationService;
  }
}

export {};
