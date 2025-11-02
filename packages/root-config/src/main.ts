import { registerApplication, start } from "single-spa";
import { constructApplications, constructRoutes, constructLayoutEngine } from "single-spa-layout";
import { microfrontendLayout } from "./microfrontend-layout";
import "./auth/AuthService"; // Инициализируем AuthService
import "./auth/RedirectService"; // Инициализируем RedirectService для обработки редиректов
import "./navigation-utils"; // Инициализируем утилиты навигации

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

applications.forEach(registerApplication);
layoutEngine.activate();
start();
