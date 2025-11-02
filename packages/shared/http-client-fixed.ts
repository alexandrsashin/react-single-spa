import { getAuthToken } from "./auth-utils";

interface FetchConfig extends Omit<RequestInit, "headers"> {
  requireAuth?: boolean;
  baseURL?: string;
  headers?: Record<string, string>;
}

// Расширенная версия fetch с автоматической авторизацией
export async function authFetch(url: string, options: FetchConfig = {}): Promise<Response> {
  const { requireAuth = true, baseURL = "", headers = {}, ...fetchOptions } = options;

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
    if (typeof window !== "undefined" && window.authService) {
      window.authService.logout();
    }
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

// Утилита для создания конфигурации API клиента
export function createApiClient(baseURL: string, defaultConfig: FetchConfig = {}) {
  return {
    async request(url: string, config: FetchConfig = {}) {
      return authFetch(url, {
        baseURL,
        ...defaultConfig,
        ...config,
      });
    },

    async get(url: string, config: FetchConfig = {}) {
      return this.request(url, { ...config, method: "GET" });
    },

    async post(url: string, data?: any, config: FetchConfig = {}) {
      return this.request(url, {
        ...config,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async put(url: string, data?: any, config: FetchConfig = {}) {
      return this.request(url, {
        ...config,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async patch(url: string, data?: any, config: FetchConfig = {}) {
      return this.request(url, {
        ...config,
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...config.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      });
    },

    async delete(url: string, config: FetchConfig = {}) {
      return this.request(url, { ...config, method: "DELETE" });
    },
  };
}

// Пример использования:
// const apiClient = createApiClient('https://api.example.com');
// const response = await apiClient.get('/users');
// const data = await response.json();
