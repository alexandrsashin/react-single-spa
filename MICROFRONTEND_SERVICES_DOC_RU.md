# microfrontend-css-loader

## Назначение

`packages/shared/microfrontend-css-loader.ts` добавляет к Single-SPA микрофронтендам механизм гарантированной загрузки CSS из Vite-манифеста до запуска приложения. Утилита защищает от дублирования линков, отслеживает активные загрузки и умеет очищать стили при размонтировании.

## Ключевые возможности

- **Загрузка по манифесту**: функция `loadMicrofrontendCSS` читает `manifest.json`, собирает цепочку зависимых чанков и добавляет в DOM все CSS-файлы, относящиеся к `src/main.ts`.
- **Ожидание готовности**: промис на bootstrap завершается только после того, как каждый `<link>` сработал по событию `load` (или уже присутствует и считается загруженным).
- **Трекинг активностей**: `loadedCssFiles` хранит уже подключённые файлы, `loadingCssFiles` — текущие промисы загрузки, что предотвращает гонки при повторном монтировании.
- **Переиспользование линков**: если нужный `<link>` уже есть в `document.head`, утилита ожидает завершение его загрузки вместо повторного добавления.
- **Очистка**: `unloadMicrofrontendCSS` удаляет `<link>` с датасетами `data-app` и `data-css-file`, а также очищает кеши.

## Рабочий цикл

1. Вызов `wrapLifecyclesWithCSS(lifecycles, options)` оборачивает `bootstrap/mount/unmount` предоставленного микрофронтенда.
2. В `bootstrap` выполняется `loadMicrofrontendCSS`:
   - Пропуск в dev-режиме (Vite HMR сам управляет стилями).
   - Загрузка `manifestPath` и сбор списка CSS.
   - Для каждого файла проверяется кеш, активная загрузка или наличие `<link>` в DOM.
   - При необходимости создаётся `<link>` с атрибутами `rel="stylesheet"`, `data-app`, `data-css-status`.
   - Результат `Promise.all` сообщает о завершении всех подключений.
3. В `unmount` по опции `cleanupOnUnmount` выполняется `unloadMicrofrontendCSS(appName)`.

## Ошибки и логирование

- Все ключевые действия сопровождаются `console.log` / `console.warn` с префиксом `[${appName}]`, что облегчает отладку.
- Сбой загрузки конкретного файла логируется и не прерывает процесс (промис разрешается, файл удаляется из кешей, `<link>` убирается).

## Настройки

Параметры `CSSLoaderOptions`:

- `appName` — уникальный идентификатор микрофронтенда (используется в логах и дата-атрибутах).
- `manifestPath` — путь до `.vite/manifest.json` в production-сборке.
- `cleanupOnUnmount` — очищать ли стили при размонтировании (по умолчанию `false`).

## Базовый пример

```ts
import singleSpaReact from "single-spa-react";
import { wrapLifecyclesWithCSS } from "../../shared/microfrontend-css-loader";

const lifecycles = singleSpaReact({
  /* ... */
});

export const { bootstrap, mount, unmount } = wrapLifecyclesWithCSS(lifecycles, {
  appName: "microfrontend",
  manifestPath: "/dist/microfrontend/.vite/manifest.json",
  cleanupOnUnmount: false,
});
```

---

# AuthService

## Назначение

`packages/root-config/src/auth/AuthService.ts` реализует единую точку управления авторизацией в браузере: хранит токены, восстанавливает сессию, обновляет access token и рассылает события Single-SPA-приложениям.

## Жизненный цикл

1. **Конструктор** сразу запускает `initializeAsync`:
   - Читает токены из `localStorage`.
   - При наличии refresh token автоматически обновляет access token.
   - Устанавливает таймер для logout при истечении токена.
   - Диспатчит `AUTH_INITIALIZED` с текущим статусом.
2. **Доступ к готовности**: метод `waitForInitialization()` позволяет дождаться завершения стартовой инициализации.

## Публичные методы

- `login(credentials)` — выполняет mock-логин (заменить на реальный API), сохраняет токены, обновляет state и рассылает `AUTH_LOGIN_SUCCESS`.
- `logout()` — очищает таймеры, storage, state и шлёт `AUTH_LOGOUT`.
- `getAccessToken()` — возвращает актуальный access token, при необходимости автоматически обновляет его (если токен истекает в течение 5 минут).
- `getState()`, `isAuthenticated()`, `getCurrentUser()` — геттеры состояния.
- `subscribe(callback)` — подписка на `AUTH_STATE_CHANGED`; возвращает disposer.
- `waitForInitialization()` — возвращает промис, который разрешается после завершения инициализации.
- `isInitializationComplete()` — проверяет, завершена ли инициализация.

## Хранение и события

- Storage-ключи: `auth_access_token`, `auth_refresh_token`, `auth_token_expiry`.
- События: `AUTH_INITIALIZED`, `AUTH_LOGIN_SUCCESS`, `AUTH_LOGOUT`, `AUTH_TOKEN_REFRESHED`, `AUTH_STATE_CHANGED`, `AUTH_ERROR`.
- Все события генерируются через `CustomEvent` и доступны глобально (на `window`).

## Тайминги и автообновление

- Токен обновляется реактивно при вызове `getAccessToken()`, если токен истекает в течение 5 минут.
- Grace period в 30 секунд предотвращает избыточные обновления токена.
- `setupTokenExpiryTimer()` устанавливает таймер для автоматического logout при истечении токена.
- `refreshMutex` гарантирует, что одновременные запросы на обновление токена используют один запрос.

## Mock API

- `mockLogin` и `mockRefreshToken` имитируют сетевые вызовы (1 секунду и 0.5 секунды соответственно).
- Для production следует заменить эти методы реальными запросами, сохранив структуру возвращаемых данных.

## Использование

```ts
import { authService } from "@react-single-spa/root-config";

await authService.waitForInitialization();

if (!authService.isAuthenticated()) {
  await authService.login({ email, password });
}

const token = await authService.getAccessToken();
```

---

# RedirectService

## Назначение

`packages/root-config/src/auth/RedirectService.ts` управляет маршрутизацией на уровне браузера: направляет пользователей на нужные страницы в зависимости от авторизационного состояния и подключает обработчики навигации для single-spa.

## Инициализация

- В конструкторе вызывается `initialize()`, который:
  - Дожидается готовности DOM, затем стартует `setupRedirects()`.
  - Подписывается на `popstate`, переопределяет `history.pushState/replaceState`, чтобы контролировать любую навигацию.
  - Слушает события AuthService и перенаправляет после логина/разлогина.

## Правила маршрутизации

- `publicRoutes = ["/login"]` — публичные маршруты; остальные считаются защищёнными.
- При загрузке `/` происходит редирект: авторизованные → `/user`, неавторизованные → `/login`.
- Попытка доступа без авторизации на защищённый путь ведёт к `/login?redirectTo=...`.
- После успешного логина пользователь перенаправляется на `redirectTo` (если указан) либо на `/user`.
- Авторизованному пользователю запрещено оставаться на `/login` — выполняется redirect на `/user`.

## Взаимодействие с AuthService

- Использует `authService.waitForInitialization()` перед первой проверкой, чтобы избежать гонок.
- Подписка через `authService.subscribe` позволяет реагировать на логаут и возвращать пользователя на `/login`.
- Слушает `AUTH_LOGIN_SUCCESS` для перенаправления после входа.

## Примечания

- RedirectService работает автоматически и не требует прямого вызова методов из приложений.
- Для программной навигации используйте NavigationService.
- Список публичных маршрутов определяется в конструкторе сервиса и включает `/login`.
- Для изменения логики маршрутизации необходимо модифицировать сам RedirectService.

Документ обновляется по мере изменения сервисов; при расширении функциональности рекомендуется описывать новые события и опции.
