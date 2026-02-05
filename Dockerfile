# Production Dockerfile with security best practices
# Fixed security issues identified by Snyk scan

# Use Node.js 20.20.0 or later to fix vulnerabilities
FROM node:20.20.0-alpine

# Set working directory
WORKDIR /app

# Install only necessary packages
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy application files
COPY . .

# Build the Next.js application
RUN npm run build

# Create non-root user and set proper permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose only the necessary port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Run the application
CMD ["npm", "start"]
