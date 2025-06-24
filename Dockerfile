# Base image
FROM node:20-alpine AS base
WORKDIR /app

# Development dependencies stage
FROM base AS deps
COPY package*.json ./
RUN npm ci

# Build stage
FROM deps AS builder
COPY . .
RUN npm run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

# Copy production dependencies and build output
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Create uploads directory
RUN mkdir -p uploads && chmod 777 uploads

# Expose port (using your specified port 3333)
EXPOSE 3333

# Start the server
CMD ["node", "dist/index.js"]