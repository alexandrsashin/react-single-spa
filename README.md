# React Single-SPA Monorepo

Monorepo for Single-SPA application with React-based microfrontends.

## 🏗️ Project Structure

```
├── packages/
│   ├── root-config/          # Root configuration (Single-SPA)
│   ├── microfrontend/        # First microfrontend
│   └── microfrontend2/       # Second microfrontend
├── index.html               # Main HTML page
└── package.json            # Workspace configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 24+** (recommended)
- Enable Corepack for Yarn stable:

```bash
corepack enable
```

### Install dependencies

```bash
yarn install
```

### Run all microfrontends in parallel

```bash
yarn dev
```

This will start all microfrontends in development mode in parallel with dynamic importmap loading.

## 🔧 Individual Development

### Run root-config separately

```bash
yarn workspace root-config dev
```

### Run individual microfrontend

```bash
# First microfrontend
yarn workspace @react-single-spa/microfrontend dev

# Second microfrontend
yarn workspace @react-single-spa/microfrontend2 dev
```

## 🌐 Ports and URLs

- **Root Config**: http://localhost:3005/
- **Microfrontend 1**: port defined in package
- **Microfrontend 2**: port defined in package

## 📋 Available Commands

```bash
# Development
yarn dev                    # Develop all packages in parallel (auto-detects localhost)

# Production
yarn generate-importmap     # Generate importmap configuration for production
yarn build:production       # Build all packages with production importmap
yarn start:production       # Start production preview

# Build commands
yarn build                  # Build all packages (without importmap generation)

# Individual workspace commands
yarn workspace root-config dev
yarn workspace microfrontend dev
yarn workspace microfrontend2 dev

# Code quality
yarn workspace root-config format
yarn workspace root-config check-format
yarn workspace root-config lint
```

## 🛠️ Development

### Single-SPA Layout

Routing configuration is located in `packages/root-config/src/microfrontend-layout.ts`.

### Debugging

To enable Single-SPA devtools:

1. Open browser console
2. Execute:

```js
localStorage.setItem("devtools", true);
```

3. Reload the page
4. Use the yellow widget in the bottom right corner

## 🏗️ Architecture

The project uses:

- **Single-SPA** for microfrontend orchestration
- **Dynamic ImportMap** for environment-specific module loading
- **Vite** for bundling and dev server
- **Yarn Workspaces** for dependency management
- **TypeScript** for type safety
- **Ant Design** for UI components (in microfrontend 1)
- **Centralized Auth System** for token management across microfrontends

## 🔧 ImportMap Configuration

The project uses dynamic importmap loading that automatically detects the environment:

- **Development**: Uses localhost URLs and JSPM CDN for fast development
- **Production**: Uses built bundles and optimized CDN resources

See [IMPORTMAP_GUIDE.md](./IMPORTMAP_GUIDE.md) for detailed configuration instructions.

## 📚 Useful Links

- [Single-SPA Documentation](https://single-spa.js.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Yarn Workspaces](https://yarnpkg.com/features/workspaces)
