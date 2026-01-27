/**
 * CSS Loader Utility for Single-SPA Microfrontends
 *
 * This utility handles dynamic CSS loading in production with:
 * - Duplicate prevention
 * - DOM state tracking
 * - Optional cleanup on unmount
 */

const loadedCssFiles = new Map<string, Set<string>>();

export interface CSSLoaderOptions {
  appName: string;
  manifestPath: string;
  cleanupOnUnmount?: boolean; // Default: false
}

interface ManifestEntry {
  file: string;
  css?: string[];
  imports?: string[];
  dynamicImports?: string[];
}

function collectCssFiles(
  manifest: Record<string, ManifestEntry>,
  startKey: string,
): Set<string> {
  const visited = new Set<string>();
  const cssFiles = new Set<string>();

  const walk = (key: string | undefined) => {
    if (!key || visited.has(key)) {
      return;
    }

    visited.add(key);
    const chunk = manifest[key];
    if (!chunk) {
      return;
    }

    if (Array.isArray(chunk.css)) {
      chunk.css.forEach((css) => cssFiles.add(css));
    }

    if (Array.isArray(chunk.imports)) {
      chunk.imports.forEach((importKey) => walk(importKey));
    }
  };

  walk(startKey);
  return cssFiles;
}

/**
 * Load CSS files for a microfrontend from its Vite manifest
 */
export function loadMicrofrontendCSS(options: CSSLoaderOptions): Promise<void> {
  const { appName, manifestPath } = options;

  // Skip in development (Vite HMR handles CSS)
  if (!import.meta.env.PROD) {
    return Promise.resolve();
  }

  // Initialize tracking for this app
  if (!loadedCssFiles.has(appName)) {
    loadedCssFiles.set(appName, new Set());
  }

  const appCssFiles = loadedCssFiles.get(appName)!;

  return fetch(manifestPath)
    .then((res) => res.json())
    .then((manifest: Record<string, ManifestEntry>) => {
      const entryKey = "src/main.ts";
      const entry = manifest[entryKey];
      if (!entry) {
        return;
      }

      const cssFiles = collectCssFiles(manifest, entryKey);
      if (cssFiles.size === 0) {
        return;
      }

      const basePath = manifestPath.replace("/.vite/manifest.json", "");
      const loadPromises = Array.from(cssFiles).map((cssFile) => {
        const fullPath = `${basePath}/${cssFile}`;

        if (appCssFiles.has(fullPath)) {
          return Promise.resolve();
        }

        const existingLink = document.querySelector(
          `link[href="${fullPath}"]`,
        ) as HTMLLinkElement | null;

        if (existingLink) {
          appCssFiles.add(fullPath);

          if (
            existingLink.dataset.cssStatus === "loaded" ||
            existingLink.sheet
          ) {
            return Promise.resolve();
          }

          return new Promise<void>((resolve) => {
            const handleLoad = () => {
              existingLink.dataset.cssStatus = "loaded";
              existingLink.removeEventListener("load", handleLoad);
              existingLink.removeEventListener("error", handleError);
              resolve();
            };

            const handleError = () => {
              existingLink.removeEventListener("load", handleLoad);
              existingLink.removeEventListener("error", handleError);
              console.warn(`[${appName}] CSS link failed to load: ${cssFile}`);
              resolve();
            };

            existingLink.addEventListener("load", handleLoad, { once: true });
            existingLink.addEventListener("error", handleError, { once: true });
          });
        }

        return new Promise<void>((resolve) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = fullPath;
          link.dataset.app = appName;
          link.dataset.cssFile = cssFile;
          appCssFiles.add(fullPath);

          const handleLoad = () => {
            link.dataset.cssStatus = "loaded";
            link.removeEventListener("load", handleLoad);
            link.removeEventListener("error", handleError);
            resolve();
          };

          const handleError = () => {
            link.removeEventListener("load", handleLoad);
            link.removeEventListener("error", handleError);
            appCssFiles.delete(fullPath);
            link.remove();
            console.warn(`[${appName}] CSS failed to load: ${cssFile}`);
            resolve();
          };

          link.addEventListener("load", handleLoad, { once: true });
          link.addEventListener("error", handleError, { once: true });
          document.head.appendChild(link);
        });
      });

      return Promise.all(loadPromises).then(() => void 0);
    })
    .catch((err) => {
      console.warn(`[${appName}] Failed to load CSS from manifest:`, err);
    });
}

/**
 * Remove CSS files loaded by a specific microfrontend
 * Only call this if you need to clean up styles on unmount
 */
export function unloadMicrofrontendCSS(appName: string): void {
  const links = document.querySelectorAll(`link[data-app="${appName}"]`);

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      link.remove();
    }
  });

  // Clear tracking
  loadedCssFiles.delete(appName);
}

/**
 * Wrap Single-SPA lifecycle with CSS loading
 */
export function wrapLifecyclesWithCSS(
  lifecycles: any,
  options: CSSLoaderOptions,
) {
  const { appName, cleanupOnUnmount = false } = options;

  // Wrap bootstrap to load CSS before app starts
  const originalBootstrap = lifecycles.bootstrap;
  const bootstrap = (props: any) => {
    return loadMicrofrontendCSS(options).then(() => originalBootstrap(props));
  };

  // Optionally wrap unmount to clean up CSS
  const originalUnmount = lifecycles.unmount;
  const unmount = cleanupOnUnmount
    ? (props: any) => {
        return originalUnmount(props).then(() => {
          unloadMicrofrontendCSS(appName);
        });
      }
    : originalUnmount;

  return {
    bootstrap,
    mount: lifecycles.mount,
    unmount,
  };
}
