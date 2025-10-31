# Система маршрутизации с авторизацией

## Структура маршрутов

- **`/login`** - Первый микрофронтенд (@react-single-spa/microfrontend) - форма авторизации
- **`/user`** - Второй микрофронтенд (@react-single-spa/microfrontend2) - пользовательский интерфейс
- **`/` (корень)** - Автоматический редирект в зависимости от состояния авторизации

## Логика редиректов

### Неавторизованные пользователи:

- `/` → `/login`
- `/user` → `/login`
- `/login` → остается на `/login`

### Авторизованные пользователи:

- `/` → `/user`
- `/login` → `/user`
- `/user` → остается на `/user`

## Доступные сервисы

### AuthService

Глобально доступен как `window.authService`

```typescript
// Проверка авторизации
const isAuth = window.authService.isAuthenticated();

// Получение пользователя
const user = window.authService.getCurrentUser();

// Вход в систему
await window.authService.login({
  email: "test@example.com",
  password: "password",
});

// Выход из системы
window.authService.logout();

// Подписка на изменения
const unsubscribe = window.authService.subscribe((authState) => {
  console.log("Auth state changed:", authState);
});
```

### NavigationUtils

Глобально доступен как `window.NavigationUtils`

```typescript
// Навигация на страницу логина
window.NavigationUtils.goToLogin();

// Навигация на пользовательскую страницу
window.NavigationUtils.goToUser();

// Навигация на главную (с автоматическим редиректом)
window.NavigationUtils.goToHome();

// Выход с редиректом
window.NavigationUtils.logout();

// Безопасная навигация с проверкой доступа
window.NavigationUtils.navigateTo("/user");

// Проверка доступности маршрута
const canAccess = window.NavigationUtils.canAccessRoute("/user");

// Получение текущего маршрута
const route = window.NavigationUtils.getCurrentRoute();
```

### RedirectService

Автоматически обрабатывает редиректы (не требует прямого взаимодействия)

## Использование в микрофронтендах

### В компонентах React:

```typescript
import React, { useEffect, useState } from "react";

const MyComponent = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Проверка начального состояния
    setIsAuthenticated(window.authService.isAuthenticated());

    // Подписка на изменения авторизации
    const unsubscribe = window.authService.subscribe((authState) => {
      setIsAuthenticated(authState.isAuthenticated);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async () => {
    try {
      await window.authService.login({
        email: "test@example.com",
        password: "password",
      });
      // Автоматический редирект произойдет через RedirectService
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    window.NavigationUtils.logout();
  };

  return (
    <div>
      {isAuthenticated ? (
        <button onClick={handleLogout}>Выйти</button>
      ) : (
        <button onClick={handleLogin}>Войти</button>
      )}
    </div>
  );
};
```

## Тестовые данные

Для тестирования используйте:

- **Email**: `test@example.com`
- **Password**: `password`

## Архитектура

1. **AuthService** - управление состоянием авторизации
2. **RedirectService** - автоматические редиректы на основе состояния авторизации
3. **NavigationUtils** - утилиты для программной навигации
4. **microfrontend-layout.ts** - определение маршрутов для single-spa-layout

Все сервисы автоматически инициализируются при загрузке root-config и доступны глобально для использования в микрофронтендах.
