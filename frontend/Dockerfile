# Stage 1: Build the Vite production assets
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code and build
COPY . .
RUN npm run build

# Stage 2: Serve assets with Nginx
FROM nginx:stable-alpine

# Copy built assets from Stage 1 to Nginx HTML folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
