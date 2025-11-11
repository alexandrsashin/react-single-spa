export const microfrontendLayout = `<single-spa-router>
  <route path="user">
    <div class="root-layout">
      <div class="left-col">
        <application name="@react-single-spa/sidebar"></application>
      </div>
      <div class="right-col">
        <application name="@react-single-spa/header"></application>
        <application name="@react-single-spa/microfrontend2"></application>
      </div>
    </div>
  </route>
  
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
      </div>
    </div>
  </route>
</single-spa-router>`;
