# Система авторизации для Single-SPA микрофронтендов

## Архитектура

Была реализована централизованная система авторизации для архитектуры single-spa со следующими компонентами:

### 1. Централизованный AuthService (`packages/root-config/src/auth/AuthService.ts`)

**Основные функции:**

- Управление состоянием авторизации (токены, пользователь)
- Автоматическое обновление токенов
- Сохранение состояния в localStorage
- Отправка событий изменения состояния

**Ключевые методы:**

- `login(credentials)` - Аутентификация пользователя
- `logout()` - Выход из системы
- `getValidAccessToken()` - Получение актуального токена (с автообновлением)
- `subscribe(callback)` - Подписка на изменения состояния

### 2. Shared Utilities (`packages/shared/auth-utils.ts`)

**Функции для microfrontends:**

- `getAuthService()` - Получение AuthService из global scope
- `getAuthToken()` - Быстрое получение токена для API
- `hasPermission()` - Проверка ролей и прав доступа

### 3. HTTP Client (`packages/shared/http-client-fixed.ts`)

**Автоматическая авторизация в HTTP запросах:**

- `authFetch()` - Wrapper для fetch с автоматическим добавлением токена
- `httpClient` - Готовые методы (get, post, put, delete)

### 4. React Hooks (`packages/shared/auth-hooks.tsx`)

**Готовые компоненты и хуки:**

- `useAuth()` - Хук для работы с авторизацией
- `ProtectedRoute` - Компонент для защищенных маршрутов
- `LoginForm` - Готовая форма входа
- `LogoutButton` - Кнопка выхода
- `UserInfo` - Информация о пользователе

## Использование

### В Root Config

AuthService автоматически инициализируется при загрузке root-config и становится доступен глобально.

### В Microfrontends

```tsx
import { useAuth, ProtectedRoute } from "../../shared/auth-hooks";
import { httpClient } from "../../shared/http-client-fixed";

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();

  // API вызов с автоматической авторизацией
  const fetchData = async () => {
    const response = await httpClient.get("/api/data", {
      baseURL: "https://api.example.com",
      requireAuth: true,
    });
    return response.json();
  };

  return (
    <div>
      {isAuthenticated ? (
        <ProtectedRoute requiredRoles={["user"]}>
          <div>Protected content</div>
        </ProtectedRoute>
      ) : (
        <LoginForm onSuccess={() => console.log("Logged in!")} />
      )}
    </div>
  );
}
```

## Безопасность

1. **Токены хранятся в localStorage** - для production рекомендуется httpOnly cookies
2. **Автоматическое обновление токенов** - за 5 минут до истечения
3. **Автоматический logout** при ошибках 401
4. **Проверка ролей и прав доступа** на клиенте (дублировать на сервере!)

## Тестирование

Для тестирования используйте учетные данные:

- Email: `test@example.com`
- Password: `password`

## Workflow

1. **Пользователь заходит на сайт**
   - AuthService проверяет localStorage на наличие токенов
   - Если токены валидны - автоматическая авторизация

2. **Вход в систему**
   - Любой microfrontend может инициировать вход
   - Состояние синхронизируется между всеми microfrontends

3. **API запросы**
   - Используйте `httpClient` для автоматического добавления токенов
   - Токены обновляются автоматически при необходимости

4. **Выход из системы**
   - Любой microfrontend может инициировать выход
   - Все microfrontends получают уведомление и обновляют UI

## Преимущества

✅ **Централизованное управление** - одно место для всей логики авторизации
✅ **Автоматическая синхронизация** - состояние авторизации синхронизируется между всеми microfrontends
✅ **Готовые компоненты** - переиспользуемые React компоненты
✅ **Автоматические токены** - HTTP клиент автоматически добавляет токены
✅ **Безопасность** - автоматическое обновление токенов и обработка ошибок
✅ **Типизация** - полная TypeScript поддержка

## Расширение

Для подключения к реальному API:

1. Замените mock методы в `AuthService.ts` на реальные API вызовы
2. Настройте baseURL в HTTP клиенте
3. Добавьте обработку специфичных ошибок API
4. Настройте refresh token логику под ваш бэкенд
