export const microfrontendLayout = `<single-spa-router>
  <!--
    Маршрутизация для микрофронтендов:
    /login - первый микрофронтенд (форма авторизации)
    /user - второй микрофронтенд (пользовательский интерфейс)
    default - редирект на /login если не авторизован, иначе на /user
  -->

  <main>
    <route path="login">
      <application name="@react-single-spa/microfrontend"></application>
    </route>
    
    <route path="user">
      <application name="@react-single-spa/microfrontend2"></application>
    </route>
    
    <route default>
      <!-- Этот роут будет обрабатываться логикой редиректа -->
    </route>
  </main>
</single-spa-router>`;
