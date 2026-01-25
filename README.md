# React Single-SPA Monorepo

Микрофронтенд архитектура на базе Single-SPA с React, TypeScript и централизованной системой авторизации.

## 🎯 Ключевые возможности

- ✅ **Микрофронтенд архитектура** - независимая разработка и деплой модулей
- 🔐 **Централизованная авторизация** - единая система для всех микрофронтендов
- 🚀 **Hot Module Replacement** - быстрая разработка с мгновенными обновлениями
- 📦 **Import Map** - динамическая загрузка модулей в runtime
- 🎨 **Ant Design** - современный UI kit
- 🔄 **Auto Token Refresh** - автоматическое обновление токенов
- 🛡️ **Protected Routes** - защита маршрутов с автоматическими редиректами
- 🌐 **Multi-repo support** - возможность подключения внешних микрофронтендов

## 🏗️ Структура проекта

```
react-single-spa/
├── packages/
│   ├── root-config/          # 🎯 Root приложение (Single-SPA orchestrator)
│   │   ├── src/
│   │   │   ├── auth/         # Сервисы авторизации и навигации
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── RedirectService.ts
│   │   │   │   └── NavigationService.ts
│   │   │   ├── components/   # AppLoader, NotFound
│   │   │   └── main.ts       # Entry point
│   │   └── importmap.json    # Конфигурация модулей
│   │
│   ├── header/               # 🎨 Верхняя панель (localhost:3008)
│   │   └── src/
│   │       └── components/Header.tsx
│   │
│   ├── sidebar/              # 📋 Боковое меню (localhost:3010)
│   │   └── src/App.tsx
│   │
│   ├── microfrontend/        # 🔐 Login страница (localhost:3006)
│   │   └── src/
│   │       ├── LoginPage.tsx
│   │       └── components/LoginForm.tsx
│   │
│   ├── microfrontend2/       # 👤 User профиль (localhost:3007)
│   │   └── src/App.tsx
│   │
│   ├── notification-bell/    # 🔔 Уведомления (parcel)
│   │   └── src/
│   │
│   ├── shared/               # 🔧 Общие утилиты
│   │   ├── auth-hooks.tsx    # useAuth, ProtectedRoute
│   │   ├── auth-utils.ts     # getAuthService, hasPermission
│   │   └── http-client-fixed.ts  # HTTP клиент с авто-токенами
│   │
│   └── shared-types/         # 📝 TypeScript типы
│       ├── src/index.ts      # User, AuthState, AUTH_EVENTS
│       └── package.json      # npm пакет
│
├── scripts/
│   └── generate-importmap.js # Генератор importmap для production
│
├── .env.production           # Environment переменные
└── package.json              # Yarn workspaces конфигурация
```

## 🚀 Быстрый старт

### Требования

- **Node.js 24+** (рекомендуется)
- **Yarn 4.x** (через Corepack)

### Установка

```bash
# Включить Corepack для Yarn
corepack enable

# Установить зависимости
yarn install
```

### Запуск в режиме разработки

```bash
# Запустить все микрофронтенды одновременно
yarn dev
```

Приложение будет доступно по адресу: **http://localhost:3000**

### Первый вход

Используйте тестовые credentials:

- **Email**: `test@example.com`
- **Password**: `password`

## 🌐 Порты и URL микрофронтендов

| Приложение                | Порт | URL                   | Описание             |
| ------------------------- | ---- | --------------------- | -------------------- |
| **Root Config**           | 3000 | http://localhost:3000 | Основное приложение  |
| **Microfrontend (Login)** | 3006 | http://localhost:3006 | Страница авторизации |
| **Microfrontend2 (User)** | 3007 | http://localhost:3007 | Профиль пользователя |
| **Header**                | 3008 | http://localhost:3008 | Верхняя панель       |
| **Sidebar**               | 3010 | http://localhost:3010 | Боковое меню         |

## 📋 Доступные команды

### Разработка

```bash
# Запуск всех микрофронтендов
yarn dev

# Запуск отдельного микрофронтенда
yarn workspace root-config dev
yarn workspace @react-single-spa/header dev
yarn workspace @react-single-spa/microfrontend dev
yarn workspace @react-single-spa/microfrontend2 dev
yarn workspace @react-single-spa/sidebar dev
```

### Production

```bash
# Генерация importmap с environment переменными
yarn generate-importmap

# Сборка всех пакетов
yarn build

# Полная сборка с importmap
yarn build:production

# Предпросмотр production версии
yarn start:production

# 🐳 Тестирование production сборки с nginx
yarn test:production

# Управление Docker контейнером
yarn docker:up          # Запустить nginx
yarn docker:down        # Остановить nginx
yarn docker:logs        # Просмотр логов
yarn docker:rebuild     # Пересобрать и запустить
```

### 🐳 Тестирование с nginx

Для локального тестирования production сборки с nginx:

```bash
# Автоматическая сборка и запуск nginx
yarn test:production

# Или вручную
yarn build
yarn docker:up

# Проверка работы
open http://localhost:8080
```

Подробнее см. [NGINX_TESTING_GUIDE.md](NGINX_TESTING_GUIDE.md)

### Качество кода

```bash
# Форматирование
yarn workspace root-config format

# Проверка форматирования
yarn workspace root-config check-format

# Линтинг
yarn workspace root-config lint
```

## 🛠️ Разработка

### Маршруты приложения

| Маршрут      | Доступ        | Описание                         |
| ------------ | ------------- | -------------------------------- |
| `/`          | Публичный     | Редирект на `/login` или `/user` |
| `/login`     | Публичный ✅  | Страница авторизации             |
| `/user`      | Защищённый 🔒 | Профиль пользователя             |
| `/roles`     | Защищённый 🔒 | Управление ролями                |
| `/admin`     | Защищённый 🔒 | Админ панель                     |
| Любой другой | Защищённый 🔒 | Требует авторизации              |

> 💡 **Все маршруты защищены по умолчанию**. Только маршруты из `publicRoutes` доступны без авторизации.

### Конфигурация маршрутов

Находится в `packages/root-config/src/microfrontend-layout.ts`:

```typescript
export const microfrontendLayout = `<single-spa-router>
  <route path="login">
    <application name="@react-single-spa/microfrontend"></application>
  </route>
  
  <route default>
    <div class="root-layout">
      <div class="left-col">
        <application name="@react-single-spa/sidebar"></application>
      </div>
      <div class="right-col">
        <application name="@react-single-spa/header"></application>
        <route path="user">
          <application name="@react-single-spa/microfrontend2"></application>
        </route>
      </div>
    </div>
  </route>
</single-spa-router>`;
```

### Отладка Single-SPA

Включите devtools для визуализации состояния микрофронтендов:

```javascript
// В консоли браузера
localStorage.setItem("devtools", true);
// Перезагрузить страницу
```

Появится жёлтый виджет в правом нижнем углу с информацией о:

- Зарегистрированных приложениях
- Активных маршрутах
- Статусах монтирования

### Import Map Override

Для тестирования разных версий микрофронтендов:

```javascript
// Переопределить URL конкретного микрофронтенда
localStorage.setItem(
  "import-map-override:@react-single-spa/microfrontend",
  "http://localhost:4000/src/main.ts",
);
```

## 🏗️ Технологический стек

### Core

- **[Single-SPA](https://single-spa.js.org/)** - Микрофронтенд фреймворк
- **[React 19](https://react.dev/)** - UI библиотека
- **[TypeScript 5](https://www.typescriptlang.org/)** - Типизация
- **[Vite 6](https://vitejs.dev/)** - Сборщик и dev сервер
- **[Yarn 4](https://yarnpkg.com/)** - Пакетный менеджер (Workspaces)

### UI & Styling

- **[Ant Design 5](https://ant.design/)** - UI компоненты
- **[Ant Design Icons](https://ant.design/components/icon/)** - Иконки
- CSS-in-JS для кастомных стилей

### Auth & Routing

- **AuthService** - Централизованная система авторизации
- **RedirectService** - Умная навигация с защитой маршрутов
- **NavigationService** - Программная навигация
- JWT токены с автоматическим refresh

### Development Tools

- **ESLint** - Линтинг кода
- **Prettier** - Форматирование
- **Vitest** - Тестирование
- **Import Map Override** - DevTools для Single-SPA

## 🔐 Система авторизации

### Ключевые возможности

- ✅ JWT токены (access + refresh)
- ✅ Автоматическое обновление за 5 минут до истечения
- ✅ Хранение в localStorage с проверкой валидности
- ✅ Глобальный лоадер при проверке авторизации
- ✅ Защита маршрутов по умолчанию
- ✅ Сохранение пути при редиректе (`redirectTo`)
- ✅ Подписка на события авторизации
- ✅ React хуки для компонентов

### Основные сервисы

```typescript
// AuthService - управление состоянием авторизации
import { authService } from "./auth/AuthService";

await authService.login({ email, password });
authService.logout();
const isAuth = authService.isAuthenticated();
const token = await authService.getAccessToken();

// RedirectService - защита маршрутов
// Автоматически редиректит неавторизованных пользователей

// NavigationService - программная навигация
import { navigationService } from "./auth/NavigationService";

navigationService.goToLogin();
navigationService.goToUser();
navigationService.logout();
```

### Использование в микрофронтендах

```typescript
// React хук
import { useAuth } from '../../shared/auth-hooks';

const { isAuthenticated, user, login, logout } = useAuth();

// HTTP клиент с авто-токенами
import { httpClient } from '../../shared/http-client-fixed';

const response = await httpClient.get('/api/data', {
  requireAuth: true
});

// Защищённые компоненты
import { ProtectedRoute } from '../../shared/auth-hooks';

<ProtectedRoute requireAuth requiredRoles={['admin']}>
  <AdminPanel />
</ProtectedRoute>
```

## 📖 Документация проекта

### Основные гайды

- **[IMPORTMAP_GUIDE.md](./IMPORTMAP_GUIDE.md)** - Конфигурация Import Map для разработки и production
- **[AUTH_GUIDE.md](./AUTH_GUIDE.md)** - Централизованная система авторизации
- **[AUTH_LOADER_GUIDE.md](./AUTH_LOADER_GUIDE.md)** - Глобальный лоадер и защита маршрутов
- **[ROUTING_GUIDE.md](./ROUTING_GUIDE.md)** - Настройка роутинга между микрофронтендами
- **[EXTERNAL_MICROFRONTENDS_GUIDE.md](./EXTERNAL_MICROFRONTENDS_GUIDE.md)** - Подключение микрофронтендов из других репозиториев
- **[REDIRECT_TO_GUIDE.md](./REDIRECT_TO_GUIDE.md)** - Сохранение пути при редиректе на логин
- **[AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)** - 📐 UML диаграммы (Mermaid - для GitHub/VS Code)
- **[AUTH_ARCHITECTURE_ASCII.md](./AUTH_ARCHITECTURE_ASCII.md)** - 📐 ASCII диаграммы (для терминала/любого редактора)

### Архитектура

#### 📐 Диаграммы системы

Доступны в двух версиях:

**Интерактивные (Mermaid)** - **[AUTH_ARCHITECTURE.md](./AUTH_ARCHITECTURE.md)**:

- ✅ Автоматический рендеринг на GitHub
- ✅ Встроенная поддержка в VS Code (`Cmd+Shift+V`)
- Class, Sequence, State, Activity, Component и Data Flow диаграммы

**Текстовые (ASCII)** - **[AUTH_ARCHITECTURE_ASCII.md](./AUTH_ARCHITECTURE_ASCII.md)**:

- ✅ Работает в любом терминале или редакторе
- ✅ Не требует дополнительных инструментов
- Блок-схемы, таблицы, ASCII art диаграммы

#### `/packages/shared-types` - Общие типы

Npm пакет с TypeScript интерфейсами и константами:

- `User`, `AuthState`, `LoginCredentials` - типы данных
- `AUTH_EVENTS` - константы событий
- Используется через: `import { User } from "@react-single-spa/shared-types"`

#### `/packages/shared` - Общие утилиты

React-хуки и утилиты для микрофронтендов:

- `useAuth()` - хук авторизации
- `ProtectedRoute` - компонент защищённого маршрута
- `httpClient` - HTTP клиент с автоматической авторизацией
- Используется через: `import { useAuth } from "../../shared/auth-hooks"`

### Быстрый старт с документацией

1. **Настройка авторизации** → [`AUTH_GUIDE.md`](./AUTH_GUIDE.md)
2. **Добавление нового маршрута** → [`ROUTING_GUIDE.md`](./ROUTING_GUIDE.md)
3. **Подключение внешнего микрофронтенда** → [`EXTERNAL_MICROFRONTENDS_GUIDE.md`](./EXTERNAL_MICROFRONTENDS_GUIDE.md)
4. **Production деплой** → [`IMPORTMAP_GUIDE.md`](./IMPORTMAP_GUIDE.md)
5. **Просмотр архитектуры** → [`AUTH_ARCHITECTURE.md`](./AUTH_ARCHITECTURE.md) или [`AUTH_ARCHITECTURE_ASCII.md`](./AUTH_ARCHITECTURE_ASCII.md)

## 🚦 Workflow разработки

### Добавление нового микрофронтенда

1. **Создать пакет** в `packages/new-app/`
2. **Настроить vite.config.ts** с single-spa плагином
3. **Добавить в importmap.json** URL для dev и production
4. **Зарегистрировать в microfrontend-layout.ts**
5. **Добавить маршрут** (если нужно публичный доступ, обновить `publicRoutes`)

### Добавление нового защищённого маршрута

1. **Добавить route** в `microfrontend-layout.ts`
2. **Маршрут автоматически защищён** (не требует дополнительной настройки)

### Добавление публичного маршрута

1. **Добавить route** в `microfrontend-layout.ts`
2. **Обновить publicRoutes** в `RedirectService.ts`:
   ```typescript
   private publicRoutes = ["/login", "/about", "/public"];
   ```
3. **Синхронизировать в main.ts**:
   ```typescript
   const publicRoutes = ["/login", "/about", "/public"];
   ```

## 🔧 Import Map

Система использует динамический Import Map для управления зависимостями:

### Development

- Загружает микрофронтенды с `localhost`
- Использует JSPM CDN для библиотек
- Автоматически определяет среду по hostname

### Production

- Загружает собранные бандлы с CDN
- Версионирование через environment переменные
- Оптимизированные зависимости

**Подробнее**: [`IMPORTMAP_GUIDE.md`](./IMPORTMAP_GUIDE.md)

## 🌐 Подключение внешних микрофронтендов

Микрофронтенды из других репозиториев можно подключить через Import Map:

```json
{
  "production": {
    "imports": {
      "@company/orders-app": "https://cdn.company.com/orders-app/v1.0.0/app.js"
    }
  }
}
```

**Полный гайд**: [`EXTERNAL_MICROFRONTENDS_GUIDE.md`](./EXTERNAL_MICROFRONTENDS_GUIDE.md)

## 📊 Мониторинг и отладка

### localStorage ключи

Авторизация хранит данные в localStorage:

```javascript
localStorage.getItem("auth_access_token"); // JWT access token
localStorage.getItem("auth_refresh_token"); // Refresh token
localStorage.getItem("auth_token_expiry"); // Timestamp истечения
```

### События авторизации

Слушайте события для интеграции:

```javascript
window.addEventListener("auth:login-success", (e) => {
  console.log("User logged in:", e.detail.user);
});

window.addEventListener("auth:logout", () => {
  console.log("User logged out");
});

window.addEventListener("auth:initialized", (e) => {
  console.log("Auth initialized:", e.detail.isAuthenticated);
});
```

## 🤝 Contributing

1. Создайте feature branch (`git checkout -b feature/amazing-feature`)
2. Commit изменения (`git commit -m 'Add amazing feature'`)
3. Push в branch (`git push origin feature/amazing-feature`)
4. Создайте Pull Request

## 📄 License

MIT License - см. [LICENSE](./LICENSE)

## 🔗 Полезные ссылки

- [Single-SPA Documentation](https://single-spa.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Ant Design](https://ant.design/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)

1. **Настройка авторизации** → [`AUTH_GUIDE.md`](./AUTH_GUIDE.md)
2. **Добавление нового маршрута** → [`ROUTING_GUIDE.md`](./ROUTING_GUIDE.md)
3. **Подключение внешнего микрофронтенда** → [`EXTERNAL_MICROFRONTENDS_GUIDE.md`](./EXTERNAL_MICROFRONTENDS_GUIDE.md)
4. **Production деплой** → [`IMPORTMAP_GUIDE.md`](./IMPORTMAP_GUIDE.md)
5. **Хэшированная сборка** → [`HASH_BUILD_GUIDE.md`](./HASH_BUILD_GUIDE.md)
6. **Тестирование с nginx** → [`NGINX_TESTING_GUIDE.md`](./NGINX_TESTING_GUIDE.md)
7. **Структура директорий** → [`DIRECTORY_STRUCTURE.md`](./DIRECTORY_STRUCTURE.md)
8. **Import Map Loader** → [`IMPORTMAP_LOADER_GUIDE.md`](./IMPORTMAP_LOADER_GUIDE.md)
