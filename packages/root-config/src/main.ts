import { registerApplication, start } from "single-spa";
import {
  constructApplications,
  constructRoutes,
  constructLayoutEngine,
} from "single-spa-layout";
import { microfrontendLayout } from "./microfrontend-layout";
import { authService } from "./auth/AuthService";
import { redirectService } from "./auth/RedirectService";
import { navigationUtils } from "./navigation-utils";

// Ensure module is loaded for its side-effects (do not add to sharedState per config)
void redirectService;

const routes = constructRoutes(microfrontendLayout);

const applications = constructApplications({
  routes,
  async loadApp({ name }: { name: string }) {
    try {
      const module = await import(/* @vite-ignore */ name);
      return module;
    } catch (error) {
      console.error(`Failed to load application ${name}:`, error);
      throw error;
    }
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach((app) => {
  const appWithProps = {
    ...app,
    customProps: {
      sharedState: {
        authService,
        navigationUtils,
      },
    },
  };

  registerApplication(appWithProps);
});
layoutEngine.activate();
start();
