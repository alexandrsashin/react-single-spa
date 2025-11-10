import { AuthState, User, LoginCredentials, AUTH_EVENTS } from "./types";

class AuthService {
  private state: AuthState = {
    isAuthenticated: false,
    user: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
  };

  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: "auth_access_token",
    REFRESH_TOKEN: "auth_refresh_token",
    USER: "auth_user",
    TOKEN_EXPIRY: "auth_token_expiry",
  };

  private tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initializeFromStorage();
    this.setupTokenRefresh();
  }

  // Инициализация состояния из localStorage
  private initializeFromStorage(): void {
    try {
      const accessToken = localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
      const refreshToken = localStorage.getItem(
        this.STORAGE_KEYS.REFRESH_TOKEN
      );
      const userStr = localStorage.getItem(this.STORAGE_KEYS.USER);
      const tokenExpiryStr = localStorage.getItem(
        this.STORAGE_KEYS.TOKEN_EXPIRY
      );

      if (accessToken && userStr) {
        const user = JSON.parse(userStr) as User;
        const tokenExpiry = tokenExpiryStr
          ? parseInt(tokenExpiryStr, 10)
          : null;

        // Проверяем, не истек ли токен
        if (tokenExpiry && Date.now() < tokenExpiry) {
          this.updateState({
            isAuthenticated: true,
            user,
            accessToken,
            refreshToken,
            tokenExpiry,
          });
        } else {
          // Токен истек, очищаем состояние
          this.clearStorage();
        }
      }
    } catch (error) {
      console.error("Error initializing auth from storage:", error);
      this.clearStorage();
    }
  }

  // Аутентификация пользователя
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      // Здесь должен быть реальный API запрос
      const response = await this.mockLogin(credentials);

      this.updateState({
        isAuthenticated: true,
        user: response.user,
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        tokenExpiry: response.tokenExpiry,
      });

      this.saveToStorage();
      this.setupTokenRefresh();

      this.dispatchEvent(AUTH_EVENTS.AUTH_LOGIN_SUCCESS, {
        user: response.user,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed";
      this.dispatchEvent(AUTH_EVENTS.AUTH_ERROR, { error: errorMessage });
      throw error;
    }
  }

  // Выход из системы
  logout(): void {
    this.clearTokenRefreshTimer();
    this.clearStorage();
    this.updateState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
    });

    this.dispatchEvent(AUTH_EVENTS.AUTH_LOGOUT, {});
  }

  // Обновление токена
  async refreshAccessToken(): Promise<string | null> {
    if (!this.state.refreshToken) {
      this.logout();
      return null;
    }

    try {
      // Здесь должен быть реальный API запрос для обновления токена
      const response = await this.mockRefreshToken(this.state.refreshToken);

      this.updateState({
        ...this.state,
        accessToken: response.accessToken,
        tokenExpiry: response.tokenExpiry,
      });

      this.saveToStorage();
      this.setupTokenRefresh();

      this.dispatchEvent(AUTH_EVENTS.AUTH_TOKEN_REFRESHED, {
        accessToken: response.accessToken,
      });

      return response.accessToken;
    } catch (error) {
      this.logout();
      const errorMessage =
        error instanceof Error ? error.message : "Token refresh failed";
      this.dispatchEvent(AUTH_EVENTS.AUTH_ERROR, { error: errorMessage });
      return null;
    }
  }

  // Получение текущего токена (с автообновлением если нужно)
  async getValidAccessToken(): Promise<string | null> {
    if (!this.state.accessToken) {
      return null;
    }

    // Проверяем, не истекает ли токен в ближайшие 5 минут
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    if (this.state.tokenExpiry && this.state.tokenExpiry < fiveMinutesFromNow) {
      return await this.refreshAccessToken();
    }

    return this.state.accessToken;
  }

  // Получение текущего состояния
  getState(): AuthState {
    return { ...this.state };
  }

  // Проверка аутентификации
  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.accessToken;
  }

  // Получение текущего пользователя
  getCurrentUser(): User | null {
    return this.state.user;
  }

  // Подписка на изменения состояния авторизации
  subscribe(callback: (state: AuthState) => void): () => void {
    const handleAuthChange = (event: CustomEvent) => {
      callback(event.detail.state);
    };

    window.addEventListener(
      AUTH_EVENTS.AUTH_STATE_CHANGED,
      handleAuthChange as EventListener
    );

    return () => {
      window.removeEventListener(
        AUTH_EVENTS.AUTH_STATE_CHANGED,
        handleAuthChange as EventListener
      );
    };
  }

  // Приватные методы
  private updateState(newState: AuthState): void {
    this.state = { ...newState };
    this.dispatchEvent(AUTH_EVENTS.AUTH_STATE_CHANGED, { state: this.state });
  }

  private saveToStorage(): void {
    try {
      if (this.state.accessToken) {
        localStorage.setItem(
          this.STORAGE_KEYS.ACCESS_TOKEN,
          this.state.accessToken
        );
      }
      if (this.state.refreshToken) {
        localStorage.setItem(
          this.STORAGE_KEYS.REFRESH_TOKEN,
          this.state.refreshToken
        );
      }
      if (this.state.user) {
        localStorage.setItem(
          this.STORAGE_KEYS.USER,
          JSON.stringify(this.state.user)
        );
      }
      if (this.state.tokenExpiry) {
        localStorage.setItem(
          this.STORAGE_KEYS.TOKEN_EXPIRY,
          this.state.tokenExpiry.toString()
        );
      }
    } catch (error) {
      console.error("Error saving auth state to storage:", error);
    }
  }

  private clearStorage(): void {
    Object.values(this.STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  private dispatchEvent(eventType: string, detail: any): void {
    const event = new CustomEvent(eventType, { detail });
    window.dispatchEvent(event);
  }

  private setupTokenRefresh(): void {
    this.clearTokenRefreshTimer();

    if (this.state.tokenExpiry) {
      // Обновляем токен за 5 минут до истечения
      const refreshTime = this.state.tokenExpiry - Date.now() - 5 * 60 * 1000;

      if (refreshTime > 0) {
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshAccessToken();
        }, refreshTime);
      }
    }
  }

  private clearTokenRefreshTimer(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  // Mock методы (заменить на реальные API вызовы)
  private async mockLogin(credentials: LoginCredentials): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number;
  }> {
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      credentials.email === "test@example.com" &&
      credentials.password === "password"
    ) {
      const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 час

      return {
        user: {
          id: "1",
          email: credentials.email,
          name: "Test User",
          roles: ["user"],
        },
        accessToken: "mock-access-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
        tokenExpiry,
      };
    }

    throw new Error("Invalid credentials");
  }

  private async mockRefreshToken(_refreshToken: string): Promise<{
    accessToken: string;
    tokenExpiry: number;
  }> {
    // Имитация API запроса
    await new Promise((resolve) => setTimeout(resolve, 500));

    const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 час

    return {
      accessToken: "mock-access-token-refreshed-" + Date.now(),
      tokenExpiry,
    };
  }
}

// Создаем singleton instance
export const authService = new AuthService();
