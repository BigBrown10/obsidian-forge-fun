# Multi-stage build for smaller image size
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build step if needed (for TS, though tsx runs directly usually)
# RUN npm run build

# --- Production Image ---
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies (if any native modules needed)
RUN apk add --no-cache curl

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./ 2>/dev/null || :

# Define environment variables (overridden by docker-compose/k8s)
ENV NODE_ENV=production
ENV PORT=3000

# Expose port (if API is still running inside, though runtime might be headless)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
