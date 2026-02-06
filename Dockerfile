# Secure Dockerfile for Next.js application
# Security fixes applied by automated remediation

# Use current LTS Node.js version with minimal Alpine base
FROM node:20-alpine

# SECURITY FIX: Upgrade npm to fix vulnerabilities in npm@10.8.2
# Fixes: tar directory traversal, cross-spawn ReDoS, glob command injection, diff ReDoS
RUN npm install -g npm@latest

# Set working directory
WORKDIR /app

# Install only necessary packages (curl for healthcheck)
RUN apk add --no-cache curl

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production --legacy-peer-deps

# Copy application files
COPY . .

# Set secure file permissions (owner read/write/execute, group/others read/execute)
RUN chmod -R 755 /app

# Build the Next.js application
RUN npm run build

# Create non-root user and switch to it
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose only the required port
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application
CMD ["npm", "start"]
