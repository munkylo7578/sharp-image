#!/bin/sh
set -e

# Ensure data directory exists
mkdir -p /app/data

# Get database path from environment or use default
DB_PATH="${DB_PATH:-/app/data/images.db}"

# Check if database exists, if not initialize it
if [ ! -f "$DB_PATH" ]; then
  echo "Database not found at $DB_PATH, initializing..."
  npm run init-db
else
  echo "Database already exists at $DB_PATH, skipping initialization"
fi

# Execute the main command
exec "$@"

