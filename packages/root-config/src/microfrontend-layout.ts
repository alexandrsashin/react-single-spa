export const microfrontendLayout = `<single-spa-router>
   <route path="login">
    <application name="@react-single-spa/microfrontend"></application>
  </route>

  <route default>
    <div class="root-layout">
      <div class="left-col">
        <application name="@react-single-spa/sidebar"></application>
      </div>

      <div class="right-col">
        <application name="@react-single-spa/header"></application>

        <route path="user">
          <application name="@react-single-spa/microfrontend2"></application>
        </route>

        <route path="roles">
          <application name="@react-single-spa/microfrontend2"></application>
        </route>

        <route default>
        </route>
      </div>
    </div>
  </route>
</single-spa-router>`;
