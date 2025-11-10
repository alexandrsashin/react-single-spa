export const microfrontendLayout = `<single-spa-router>
  <route path="user">
    <application name="@react-single-spa/header"></application>
    <application name="@react-single-spa/microfrontend2"></application>
  </route>
  
  <route path="login">
    <application name="@react-single-spa/microfrontend"></application>
  </route>
  
  <route default>
    <application name="@react-single-spa/header"></application>
  </route>
</single-spa-router>`;
