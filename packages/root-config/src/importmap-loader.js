// Утилита для определения среды и загрузки соответствующего importmap
(function () {
  // Определяем среду выполнения
  function getEnvironment() {
    // Проверяем хост
    const host = window.location.hostname;

    // Локальная разработка
    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.includes(".local")
    ) {
      return "development";
    }

    // Проверяем query параметры для принудительного режима
    const urlParams = new URLSearchParams(window.location.search);
    const forcedEnv = urlParams.get("env");
    if (forcedEnv === "development" || forcedEnv === "production") {
      return forcedEnv;
    }

    // Проверяем переменную среды (если доступна)
    if (typeof process !== "undefined" && process.env && process.env.NODE_ENV) {
      return process.env.NODE_ENV === "development"
        ? "development"
        : "production";
    }

    // По умолчанию production для продакшена
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
            "root-config": "http://localhost:3005/src/main.ts",
            "@react-single-spa/microfrontend":
              "http://localhost:3006/src/main.ts",
            "@react-single-spa/microfrontend2":
              "http://localhost:3007/src/main.ts",
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
