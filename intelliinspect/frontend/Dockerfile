# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies with cache mount for speed  
RUN --mount=type=cache,target=/root/.npm \
    npm install --silent

# Copy source code
COPY . .

# Build the Angular app
RUN npx ng build --configuration production

# Production stage
FROM nginx:alpine

# Copy built app to nginx
COPY --from=build /app/dist/intelliinspect-frontend/browser /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
