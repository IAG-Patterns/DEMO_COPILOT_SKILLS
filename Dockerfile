# INTENTIONALLY VULNERABLE DOCKERFILE FOR SECURITY SCANNING DEMO
# This Dockerfile contains several security issues that Snyk will detect

# Using an older Node.js 18 version (compatible with Next.js >= 18.17.0)
# Snyk should still detect some vulnerabilities in this version
FROM node:18.19.0-alpine

# Running as root (security issue)
# Snyk: CIS-DI-0001 - Container should not run as root

# Hardcoded secrets (security issue)
ENV DATABASE_PASSWORD=admin123
ENV API_SECRET_KEY=super_secret_key_12345
ENV JWT_SECRET=mysecretjwt

# Set working directory
WORKDIR /app

# Install curl without verification (security issue)
RUN apk add --no-cache curl wget bash

# Download a script and execute it directly (security issue)
RUN curl -fsSL https://example.com/install.sh | bash || true

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies in production (security issue)
RUN npm install --legacy-peer-deps

# Copy all files including potentially sensitive ones (security issue)
COPY . .

# Set insecure file permissions (security issue)
RUN chmod -R 777 /app

# Build the Next.js application
RUN npm run build

# Expose multiple unnecessary ports (security issue)
EXPOSE 3000 22 80 443

# No health check defined (best practice issue)

# Run as root user (should use non-root user)
CMD ["npm", "start"]
