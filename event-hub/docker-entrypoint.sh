#!/bin/sh
set -e

# Apply database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting application..."
exec "$@" 