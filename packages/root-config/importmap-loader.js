// Утилита для определения среды и загрузки соответствующего importmap
(function () {
  // Определяем среду выполнения
  function getEnvironment() {
    const host = window.location.hostname;
    const port = window.location.port;

    // Проверяем query параметры для принудительного режима (высший приоритет)
    const urlParams = new URLSearchParams(window.location.search);
    const forcedEnv = urlParams.get("env");
    if (forcedEnv === "development" || forcedEnv === "production") {
      console.log(`Environment forced via query param: ${forcedEnv}`);
      return forcedEnv;
    }

    // Локальная разработка на localhost/127.0.0.1
    const isLocalhost =
      host === "localhost" || host === "127.0.0.1" || host.includes(".local");

    if (isLocalhost) {
      // Определяем по порту:
      // 3000-3999 - dev режим (Vite dev servers)
      // 8080-8089 - production режим (nginx/docker)
      // Другие порты - смотрим на наличие dev-индикаторов

      const portNum = parseInt(port, 10);

      // Явно dev порты (Vite dev servers)
      if (portNum >= 3000 && portNum <= 3999) {
        console.log(`Development mode detected (port ${port})`);
        return "development";
      }

      // Явно production порты (nginx/docker)
      if (
        portNum === 8080 ||
        portNum === 8081 ||
        portNum === 80 ||
        portNum === 443
      ) {
        console.log(`Production mode detected (port ${port})`);
        return "production";
      }

      // Если порт не указан или неожиданный - проверяем другие индикаторы
      // Наличие HMR или react-refresh указывает на dev
      if (window.__vite__ || window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        console.log("Development mode detected (dev tools present)");
        return "development";
      }

      // По умолчанию для localhost с неопределенным портом - development
      console.log(`Development mode (localhost default)`);
      return "development";
    }

    // Проверяем переменную среды (если доступна)
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV === "development"
        ? "development"
        : "production";
    }

    // Для всех остальных доменов - production
    console.log(`Production mode (non-localhost: ${host})`);
    return "production";
  }

  // Загружаем importmap
  async function loadImportMap() {
    const environment = getEnvironment();
    console.log(`Loading importmap for environment: ${environment}`);

    try {
      // Загружаем конфигурацию
      const response = await fetch("/importmap.json");
      const config = await response.json();

      // Получаем конфигурацию для текущей среды
      const importMapConfig = config[environment];

      if (!importMapConfig) {
        throw new Error(
          `No importmap configuration found for environment: ${environment}`
        );
      }

      // Создаем и вставляем importmap
      const importMapScript = document.createElement("script");
      importMapScript.type = "importmap";
      importMapScript.textContent = JSON.stringify(importMapConfig, null, 2);
      document.head.appendChild(importMapScript);

      console.log("Importmap loaded successfully");

      // Возвращаем Promise для синхронизации
      return Promise.resolve();
    } catch (error) {
      console.error("Failed to load importmap:", error);

      // Fallback к статическому importmap для development
      if (environment === "development") {
        console.log("Using fallback development importmap");
        const fallbackImportMap = {
          imports: {
            "root-config": "http://localhost:3000/src/main.ts",
            "@react-single-spa/microfrontend":
              "http://localhost:3006/src/main.ts",
            "@react-single-spa/microfrontend2":
              "http://localhost:3007/src/main.ts",
            "@react-single-spa/header": "http://localhost:3008/src/main.ts",
            "@react-single-spa/sidebar": "http://localhost:3010/src/main.ts",
            react: "https://ga.jspm.io/npm:react@19.2.0/dev.index.js",
            "react-dom": "https://ga.jspm.io/npm:react-dom@19.2.0/dev.index.js",
            "react-dom/client":
              "https://ga.jspm.io/npm:react-dom@19.2.0/dev.client.js",
            "react/jsx-dev-runtime":
              "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-dev-runtime.js",
            "react/jsx-runtime":
              "https://ga.jspm.io/npm:react@19.2.0/dev.jsx-runtime.js",
            "single-spa":
              "https://ga.jspm.io/npm:single-spa@5.9.5/lib/esm/single-spa.min.js",
            "single-spa-react":
              "https://ga.jspm.io/npm:single-spa-react@5.0.2/lib/esm/single-spa-react.js",
          },
          scopes: {
            "https://ga.jspm.io/": {
              scheduler: "https://ga.jspm.io/npm:scheduler@0.23.0/dev.index.js",
            },
          },
        };

        const importMapScript = document.createElement("script");
        importMapScript.type = "importmap";
        importMapScript.textContent = JSON.stringify(
          fallbackImportMap,
          null,
          2
        );
        document.head.appendChild(importMapScript);
      }

      return Promise.reject(error);
    }
  }

  // Экспортируем для использования
  window.loadImportMap = loadImportMap;
  window.getEnvironment = getEnvironment;
})();
