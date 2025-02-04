# Stage 1: Build stage
FROM node:20-slim AS builder

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml* ./
COPY /prisma ./prisma

# Install dependencies
RUN pnpm install --frozen-lockfile

RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npx prisma generate

# Copy source code and TypeScript configuration
COPY . .

# Build TypeScript
RUN pnpm run build:ts

# Stage 2: Production stage
FROM node:20-slim

# Install pnpm
RUN npm install -g pnpm

RUN apt-get update && \
    apt-get install -y openssl && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN apt-get update && apt-get install curl -y    

# Set working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 fastify

# Copy only necessary files from builder
COPY --from=builder --chown=fastify:nodejs /app/package.json ./
COPY --from=builder --chown=fastify:nodejs /app/pnpm-lock.yaml* ./
COPY --from=builder --chown=fastify:nodejs /app/dist ./dist
# Copy the generated Prisma client
COPY --from=builder --chown=fastify:nodejs /app/prisma ./prisma

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

RUN npx prisma generate

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Switch to non-root user
USER fastify

# Expose port
EXPOSE 3000

# Start the application using Fastify CLI
CMD ["pnpm", "start:prod"]