# ImportMap Configuration Guide

## Обзор

Этот проект использует динамическую конфигурацию importmap для поддержки как локальной разработки, так и production deployment. Система автоматически определяет среду выполнения и загружает соответствующие модули.

## 🏗️ Архитектура

### Файлы конфигурации

- `packages/root-config/importmap.json` - Основной файл конфигурации
- `packages/root-config/src/importmap-loader.js` - Утилита для динамической загрузки
- `.env.production` - Переменные окружения для production
- `scripts/generate-importmap.js` - Генератор конфигурации

### Логика определения среды

1. **Development** - если:
   - `hostname === 'localhost'` или `127.0.0.1`
   - URL параметр `?env=development`

2. **Production** - во всех остальных случаях
   - URL параметр `?env=production`
   - Любой другой домен

## 🚀 Использование

### Локальная разработка

```bash
# Запуск dev серверов (importmap генерируется автоматически)
yarn dev

# Доступно на http://localhost:3000
# Автоматически загружает development importmap или fallback
```

### Production deployment

```bash
# Генерация production importmap
yarn generate-importmap

# Полная сборка
yarn build
```

### Переменные окружения (.env.production)

```env
# CDN URLs для microfrontends
MICROFRONTEND_URL=https://cdn.your-domain.com/microfrontend
MICROFRONTEND2_URL=https://cdn.your-domain.com/microfrontend2
ROOT_CONFIG_URL=https://cdn.your-domain.com/root-config

# External libraries
REACT_CDN=https://unpkg.com/react@19.2.0
ANTD_CDN=https://unpkg.com/antd@5.21.4
```

## 📋 Доступные команды

```bash
# Разработка
yarn dev                    # Запуск всех microfrontends

# Production
yarn generate-importmap     # Генерация importmap с env переменными
yarn build       # Полная сборка с importmap

# Отдельные пакеты
yarn workspace root-config dev
yarn workspace microfrontend dev
yarn workspace microfrontend2 dev
```

## 🔧 Конфигурация importmap

### Development

- Использует локальные dev серверы (`localhost:3000-3007`)
- Загружает модули от JSPM CDN для быстрой разработки
- Поддерживает HMR (Hot Module Replacement)

### Production

- Использует собранные бандлы или CDN
- Оптимизированные версии библиотек
- Настраивается через переменные окружения

## 🌐 Пример конфигурации

### Development importmap

```json
{
  "imports": {
    "root-config": "http://localhost:3000/src/main.ts",
    "@react-single-spa/microfrontend": "http://localhost:3006/src/main.ts",
    "react": "https://ga.jspm.io/npm:react@19.2.0/dev.index.js",
    "antd": "https://ga.jspm.io/npm:antd@5.21.4/es/index.js"
  }
}
```

### Production importmap

```json
{
  "imports": {
    "root-config": "/dist/root-config.js",
    "@react-single-spa/microfrontend": "/dist/microfrontend.js",
    "react": "https://unpkg.com/react@19.2.0/index.js",
    "antd": "https://unpkg.com/antd@5.21.4/dist/antd.min.js"
  }
}
```

## 🔄 Кастомизация

### Добавление новых зависимостей

1. **Development**: Добавьте в `scripts/generate-importmap.js`

```javascript
"your-library": "https://ga.jspm.io/npm:your-library@1.0.0/index.js"
```

2. **Production**: Добавьте URL в `.env.production`

```env
YOUR_LIBRARY_CDN=https://unpkg.com/your-library@1.0.0/dist/index.min.js
```

### Принудительная среда

Добавьте параметр в URL:

- `http://localhost:3000?env=production` - принудительный production режим
- `https://your-domain.com?env=development` - принудительный development режим

## 🚨 Troubleshooting

### Проблемы с загрузкой модулей

1. Проверьте консоль браузера на ошибки
2. Убедитесь что все dev серверы запущены
3. Проверьте доступность CDN ресурсов

### Fallback механизм

Если динамическая загрузка importmap не работает, система автоматически использует fallback конфигурацию для development среды.

### Отладка

Добавьте в localStorage для включения devtools:

```javascript
localStorage.setItem("devtools", true);
```

## 📚 Полезные ссылки

- [Import Maps Specification](https://github.com/WICG/import-maps)
- [Single-SPA Import Maps](https://single-spa.js.org/docs/recommended-setup/#import-maps)
- [JSPM Generator](https://generator.jspm.io/)
- [unpkg CDN](https://unpkg.com/)
