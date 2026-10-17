# ==============================================================
# Production Dockerfile for Bramarambika REST API
# Multi-stage lightweight Node Alpine build
# ==============================================================

FROM node:20-alpine AS base

# Install security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app

# Copy dependency manifests
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy application source code
COPY . .

# Set non-root user for security best practice
USER node

# Expose backend port
EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

# Healthcheck probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
