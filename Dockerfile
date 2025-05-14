# Base stage for development and production
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache dumb-init

# Install production dependencies only
FROM base AS deps
COPY package*.json ./
RUN npm ci --only=production

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy dependencies and build files
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
COPY .env.example ./

# Use dumb-init as entrypoint to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# Expose API port
EXPOSE 3000

# Set healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1