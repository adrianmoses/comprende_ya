# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (using install instead of ci due to lockfile sync issues)
RUN npm install

# Copy application code
COPY . .

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy built assets from builder (TanStack Start outputs to .output/)
COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/package-lock.json /app/package-lock.json

# Install only production dependencies (needed for TanStack Start server runtime)
RUN npm install --omit=dev

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the application (TanStack Start server)
CMD ["node", ".output/server/index.mjs"]
