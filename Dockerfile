# Stage 1: Build stage
FROM node:20-slim AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code and TypeScript configuration
COPY . .

# Build TypeScript
RUN pnpm run build:ts

# Stage 2: Production stage
FROM node:20-slim

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

# Copy only necessary files from builder
COPY --from=builder --chown=fastify:nodejs /app/package.json ./
COPY --from=builder --chown=fastify:nodejs /app/pnpm-lock.yaml* ./
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER fastify

# Expose port
EXPOSE 3000

# Start the application using Fastify CLI
CMD ["pnpm", "start"]