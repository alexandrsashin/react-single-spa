// Development-only single-spa lifecycles (non-React) for @auth/auth
// This file allows the root-config to load the microfrontend quickly during
// local development without involving the React plugin transform problems.

export async function bootstrap() {
  // no-op for dev
}

export async function mount(props) {
  const container =
    (props && props.domElement) || document.createElement("div");
  container.className = "auth-root";
  container.textContent = `${
    (props && props.name) || "@auth/auth"
  } is mounted!`;

  if (!props || !props.domElement) {
    document.body.appendChild(container);
    container.setAttribute("data-auth-mounted", "true");
  }
}

export async function unmount(props) {
  const el = document.querySelector('.auth-root[data-auth-mounted="true"]');
  if (el && el.parentNode) el.parentNode.removeChild(el);
}
