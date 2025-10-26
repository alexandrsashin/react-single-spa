# react-single-spa (root-config)

Local development helper for this single-spa root-config + microfrontends monorepo.

## Start both dev servers (recommended)

From the repo root:

```bash
# starts the auth Vite server on port 8080 and the root Vite server on port 9000
yarn dev:all
```

## Start servers individually

Start the root (Vite):

```bash
yarn start   # runs Vite (PORT=9000 by dev:all)
```

Start only the auth microfrontend (Vite):

```bash
yarn --cwd packages/auth start   # runs Vite for @auth/auth (PORT=8080 by dev:all)
```

You can also run the workspace script directly once the repo is configured as a Yarn workspace:

```bash
# start auth via workspace command
yarn workspace @auth/auth start
```

## Verify in browser

- Open the root-config app (Vite): http://localhost:9000/
- The auth microfrontend should be loaded from http://localhost:8080/auth-auth.js (the import map entry in `index.html` points here)

If you want to enable the single-spa devtools widget (handy for development):

1. In the browser console run:

```js
localStorage.setItem("devtools", true);
```

2. Refresh the page.
3. A yellow widget appears in the bottom-right. Click it to inspect loaded modules, or add a new module by pasting the microfrontend entry URL (if needed).
