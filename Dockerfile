# Secure Dockerfile for Next.js Application
# Security issues have been remediated

# Using Node.js 20 LTS Alpine for security and smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

# Copy application files
COPY . .

# Set proper file ownership and permissions
RUN chown -R node:node /app && chmod -R 755 /app

# Build the Next.js application
RUN npm run build

# Expose only the required port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Switch to non-root user
USER node

# Start the application
CMD ["npm", "start"]
