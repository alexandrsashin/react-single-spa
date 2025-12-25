FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/

# Create directory structure for each microfrontend
RUN mkdir -p /usr/share/nginx/html/dist/root-config \
    && mkdir -p /usr/share/nginx/html/dist/header \
    && mkdir -p /usr/share/nginx/html/dist/microfrontend \
    && mkdir -p /usr/share/nginx/html/dist/microfrontend2 \
    && mkdir -p /usr/share/nginx/html/dist/sidebar

# Copy root-config files (includes importmap.json, index.html, etc) to root
COPY packages/root-config/dist/index.html /usr/share/nginx/html/
COPY packages/root-config/dist/importmap.json /usr/share/nginx/html/
COPY packages/root-config/dist/importmap-loader.js /usr/share/nginx/html/
COPY packages/root-config/dist/react-refresh-setup.js /usr/share/nginx/html/
COPY packages/root-config/dist/favicon.svg /usr/share/nginx/html/

# Copy root-config bundle to its own directory
COPY packages/root-config/dist/ /usr/share/nginx/html/dist/root-config/

# Copy each microfrontend to its own directory
COPY packages/header/dist/ /usr/share/nginx/html/dist/header/
COPY packages/microfrontend/dist/ /usr/share/nginx/html/dist/microfrontend/
COPY packages/microfrontend2/dist/ /usr/share/nginx/html/dist/microfrontend2/
COPY packages/sidebar/dist/ /usr/share/nginx/html/dist/sidebar/

# Note: We're copying everything to /dist because importmap points to /dist/[filename].js
# The .vite folders are included but won't be served

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
