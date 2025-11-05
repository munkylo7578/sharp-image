FROM node:24-alpine

# Install dependencies for Sharp (libvips), healthcheck, and SQLite CLI
RUN apk add --no-cache \
    vips-dev \
    vips-tools \
    python3 \
    make \
    g++ \
    wget \
    sqlite

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all dependencies including dev dependencies)
RUN npm install

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Initialize database during build
RUN npm run init-db || true

# Make entrypoint script executable
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 3000

# Use entrypoint script to ensure DB is initialized on start
ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]

