export const microfrontendLayout = `<single-spa-router>
  <!--
    Маршрутизация для микрофронтендов:
    /login - первый микрофронтенд (форма авторизации)
    /user - второй микрофронтенд (пользовательский интерфейс)
    header - отображается на маршрутах /, /user
    default - редирект на /login если не авторизован, иначе на /user
  -->

  <route path="user">
    <application name="@react-single-spa/header"></application>
    <application name="@react-single-spa/microfrontend2"></application>
  </route>
  
  <route path="login">
    <application name="@react-single-spa/microfrontend"></application>
  </route>
  
  <route default>
    <application name="@react-single-spa/header"></application>
    <!-- Этот роут будет обрабатываться логикой редиректа -->
  </route>
</single-spa-router>`;
