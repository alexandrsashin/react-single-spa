// Утилита для загрузки importmap
(function () {
  // Загружаем importmap
  async function loadImportMap() {
    console.log("📦 Loading importmap...");

    try {
      // Загружаем конфигурацию
      const response = await fetch("/importmap.json");
      const importMapConfig = await response.json();

      // Создаем и вставляем importmap
      const importMapScript = document.createElement("script");
      importMapScript.type = "importmap";
      importMapScript.textContent = JSON.stringify(importMapConfig, null, 2);
      document.head.appendChild(importMapScript);

      console.log("✅ Importmap loaded successfully");

      return Promise.resolve();
    } catch (error) {
      console.error("❌ Failed to load importmap:", error);
      return Promise.reject(error);
    }
  }

  // Экспортируем функцию в глобальную область
  window.loadImportMap = loadImportMap;
})();
