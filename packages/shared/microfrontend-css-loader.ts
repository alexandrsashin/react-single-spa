/**
 * CSS Loader Utility for Single-SPA Microfrontends
 *
 * Handles production CSS loading from Vite manifests with:
 * - Duplicate prevention across microfrontends
 * - Tracking of in-flight stylesheet loads
 * - Optional cleanup on unmount
 */

const loadedCssFiles = new Map<string, Set<string>>();
const loadingCssFiles = new Map<string, Map<string, Promise<void>>>();

function ensureAppState(appName: string): void {
  if (!loadedCssFiles.has(appName)) {
    loadedCssFiles.set(appName, new Set());
  }

  if (!loadingCssFiles.has(appName)) {
    loadingCssFiles.set(appName, new Map());
  }
}

function isStylesheetLoaded(link: HTMLLinkElement): boolean {
  if (link.dataset.cssStatus === "loaded") {
    return true;
  }

  try {
    const sheet = link.sheet as CSSStyleSheet | null;
    if (!sheet) {
      return false;
    }

    // Accessing cssRules is enough to know same-origin sheets are ready;
    // cross-origin sheets throw SecurityError which we treat as loaded.
    void sheet.cssRules;
    return true;
  } catch (err) {
    if (err instanceof DOMException && err.name === "SecurityError") {
      return true;
    }

    return false;
  }
}

export interface CSSLoaderOptions {
  appName: string;
  manifestPath: string;
  cleanupOnUnmount?: boolean;
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

export function loadMicrofrontendCSS(options: CSSLoaderOptions): Promise<void> {
  const { appName, manifestPath } = options;
  console.log(`[${appName}] CSS loader invoked (manifest: ${manifestPath})`);

  if (!import.meta.env.PROD) {
    console.log(
      `[${appName}] Development mode detected – skipping CSS preload`,
    );
    return Promise.resolve();
  }

  ensureAppState(appName);

  const appCssFiles = loadedCssFiles.get(appName)!;
  const appLoadingPromises = loadingCssFiles.get(appName)!;

  return fetch(manifestPath)
    .then((res) => res.json())
    .then((manifest: Record<string, ManifestEntry>) => {
      console.log(`[${appName}] Manifest fetched, resolving entry chunks`);

      const entryKey = "src/main.ts";
      const entry = manifest[entryKey];
      if (!entry) {
        console.warn(`[${appName}] Entry ${entryKey} not found in manifest`);
        return;
      }

      const cssFiles = collectCssFiles(manifest, entryKey);
      if (cssFiles.size === 0) {
        console.log(
          `[${appName}] No CSS chunks discovered for entry ${entryKey}`,
        );
        return;
      }

      const basePath = manifestPath.replace("/.vite/manifest.json", "");
      const loadPromises = Array.from(cssFiles).map((cssFile) => {
        const fullPath = `${basePath}/${cssFile}`;

        if (appCssFiles.has(fullPath)) {
          console.log(`[${appName}] CSS already tracked: ${cssFile}`);
          return Promise.resolve();
        }

        const inflight = appLoadingPromises.get(fullPath);
        if (inflight) {
          console.log(
            `[${appName}] CSS load in progress (waiting): ${cssFile}`,
          );
          return inflight;
        }

        const existingLink = document.querySelector(
          `link[href="${fullPath}"]`,
        ) as HTMLLinkElement | null;

        if (existingLink) {
          console.log(`[${appName}] Reusing existing CSS link: ${cssFile}`);

          if (isStylesheetLoaded(existingLink)) {
            existingLink.dataset.cssStatus = "loaded";
            appCssFiles.add(fullPath);
            console.log(`[${appName}] Existing CSS already loaded: ${cssFile}`);
            return Promise.resolve();
          }

          existingLink.dataset.cssStatus = "loading";

          const promise = new Promise<void>((resolve) => {
            const handleLoad = () => {
              existingLink.dataset.cssStatus = "loaded";
              existingLink.removeEventListener("load", handleLoad);
              existingLink.removeEventListener("error", handleError);
              console.log(
                `[${appName}] Existing CSS finished loading: ${cssFile}`,
              );
              appCssFiles.add(fullPath);
              appLoadingPromises.delete(fullPath);
              resolve();
            };

            const handleError = () => {
              existingLink.removeEventListener("load", handleLoad);
              existingLink.removeEventListener("error", handleError);
              console.warn(`[${appName}] CSS link failed to load: ${cssFile}`);
              appLoadingPromises.delete(fullPath);
              resolve();
            };

            existingLink.addEventListener("load", handleLoad, { once: true });
            existingLink.addEventListener("error", handleError, { once: true });
          });

          appLoadingPromises.set(fullPath, promise);
          return promise;
        }

        const promise = new Promise<void>((resolve) => {
          // Use preload to start fetching stylesheet early without blocking render,
          // then switch to rel="stylesheet" on load so styles are applied as soon
          // as the resource is available. This reduces FOUC while allowing
          // bootstrap to start quickly.
          const link = document.createElement("link");
          link.rel = "preload";
          // @ts-ignore - `as` is a valid attribute on link
          link.as = "style" as any;
          link.href = fullPath;
          link.dataset.app = appName;
          link.dataset.cssFile = cssFile;
          link.dataset.cssStatus = "loading";
          console.log(`[${appName}] Preloading CSS link: ${cssFile}`);

          const handleApply = () => {
            // When preload completes, turn link into a stylesheet so it applies.
            try {
              link.rel = "stylesheet";
            } catch (e) {
              // ignore write errors in exotic environments
            }

            link.dataset.cssStatus = "loaded";
            link.removeEventListener("load", handleApply);
            link.removeEventListener("error", handleError);
            appCssFiles.add(fullPath);
            appLoadingPromises.delete(fullPath);
            console.log(`[${appName}] CSS applied: ${cssFile}`);
            resolve();
          };

          const handleError = () => {
            link.removeEventListener("load", handleApply);
            link.removeEventListener("error", handleError);
            // If preload fails, ensure we don't leave a broken preload link.
            link.remove();
            console.warn(`[${appName}] CSS preload failed: ${cssFile}`);
            appCssFiles.delete(fullPath);
            appLoadingPromises.delete(fullPath);
            resolve();
          };

          link.addEventListener("load", handleApply, { once: true });
          link.addEventListener("error", handleError, { once: true });
          document.head.appendChild(link);
        });

        appLoadingPromises.set(fullPath, promise);
        return promise;
      });

      return Promise.all(loadPromises).then(() => {
        console.log(
          `[${appName}] CSS preload finished (${cssFiles.size} file(s))`,
        );
      });
    })
    .catch((err) => {
      console.warn(`[${appName}] Failed to load CSS from manifest:`, err);
    });
}

export function unloadMicrofrontendCSS(appName: string): void {
  const links = document.querySelectorAll(`link[data-app="${appName}"]`);
  console.log(`[${appName}] Unloading ${links.length} CSS link(s)`);

  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href) {
      link.remove();
      console.log(`[${appName}] CSS link removed: ${href}`);
    }
  });

  loadedCssFiles.delete(appName);
  loadingCssFiles.delete(appName);
  console.log(`[${appName}] CSS tracking cleared`);
}

export function wrapLifecyclesWithCSS(
  lifecycles: any,
  options: CSSLoaderOptions,
) {
  const { appName, cleanupOnUnmount = false } = options;

  const originalBootstrap = lifecycles.bootstrap;
  const bootstrap = (props: any) => {
    // Start preloading CSS promptly but don't block bootstrap to keep
    // application startup snappy. The actual mount will wait for CSS to
    // apply which prevents FOUC.
    loadMicrofrontendCSS(options).catch(() => {});
    return originalBootstrap(props);
  };

  const originalMount = lifecycles.mount;
  const mount = (props: any) => {
    // Ensure styles are applied before mount to avoid FOUC. If CSS is
    // already loaded this will resolve immediately.
    return loadMicrofrontendCSS(options).then(() => originalMount(props));
  };

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
    mount,
    unmount,
  };
}
