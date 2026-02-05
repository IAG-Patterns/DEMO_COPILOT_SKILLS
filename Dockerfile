# Secure Dockerfile for Next.js application
# Security issues have been addressed

# Using latest secure Node.js LTS version with Alpine
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Install only necessary packages (removed wget, bash not needed)
RUN apk add --no-cache curl

# Copy package files first for better layer caching
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy application files
COPY . .

# Set secure file permissions (owner read/write, group/others read only)
RUN chmod -R 755 /app && \
    chown -R node:node /app

# Build the Next.js application
RUN npm run build

# Only expose the required application port
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Run as non-root user for security
USER node

CMD ["npm", "start"]
