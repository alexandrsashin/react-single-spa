import { registerApplication, start } from "single-spa";
import { constructApplications, constructRoutes, constructLayoutEngine } from "single-spa-layout";
import { microfrontendLayout } from "./microfrontend-layout";
import "./auth/AuthService"; // Инициализируем AuthService
import "./auth/RedirectService"; // Инициализируем RedirectService для обработки редиректов
import "./navigation-utils"; // Инициализируем утилиты навигации

const routes = constructRoutes(microfrontendLayout);
const applications = constructApplications({
  routes,
  loadApp({ name }: { name: string }) {
    return import(/* @vite-ignore */ name);
  },
});
const layoutEngine = constructLayoutEngine({ routes, applications });

applications.forEach(registerApplication);
layoutEngine.activate();
start();
