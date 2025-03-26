#!/bin/sh
set -e

# Try to apply database migrations but don't fail if they don't work
echo "Attempting database migrations (with 10s timeout)..."
timeout 10 npx prisma migrate deploy || echo "Warning: Prisma migrations timed out or failed, but continuing startup"

# Start the application
echo "Starting application..."
exec "$@" 