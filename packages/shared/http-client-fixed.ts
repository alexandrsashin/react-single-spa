import { getAuthToken } from "./auth-utils";

interface FetchConfig extends Omit<RequestInit, "headers"> {
  requireAuth?: boolean;
  baseURL?: string;
  headers?: Record<string, string>;
}

// Расширенная версия fetch с автоматической авторизацией
async function authFetch(
  url: string,
  options: FetchConfig = {}
): Promise<Response> {
  const {
    requireAuth = true,
    baseURL = "",
    headers = {},
    ...fetchOptions
  } = options;

  // Формируем полный URL
  const fullUrl = baseURL ? `${baseURL}${url}` : url;

  // Подготавливаем заголовки
  const requestHeaders: Record<string, string> = { ...headers };

  // Добавляем токен авторизации если требуется
  if (requireAuth) {
    const token = await getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No auth token available for authenticated request");
    }
  }

  // Выполняем запрос
  const response = await fetch(fullUrl, {
    ...fetchOptions,
    headers: requestHeaders,
  });

  // Обрабатываем ошибки авторизации
  if (response.status === 401) {
    // Токен истек или недействителен
    console.warn("Unauthorized request, token may be expired");

    // Можно добавить автоматический логаут
    try {
      const { getAuthService } = await import("./auth-utils");
      const authService = await getAuthService();
      if (authService) {
        authService.logout();
      }
    } catch {}
  }

  return response;
}

// Утилиты для HTTP методов
export const httpClient = {
  async get(url: string, config: FetchConfig = {}) {
    return authFetch(url, { ...config, method: "GET" });
  },

  async post(url: string, data?: any, config: FetchConfig = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    return authFetch(url, {
      ...config,
      method: "POST",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async put(url: string, data?: any, config: FetchConfig = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    return authFetch(url, {
      ...config,
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async patch(url: string, data?: any, config: FetchConfig = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    return authFetch(url, {
      ...config,
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  async delete(url: string, config: FetchConfig = {}) {
    return authFetch(url, { ...config, method: "DELETE" });
  },
};
