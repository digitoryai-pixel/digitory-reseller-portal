#!/bin/sh
set -e

echo "🚀 Starting Digitory Reseller Portal..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 3

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed database if needed (only on first run)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Seeding database..."
  npx prisma db seed
fi

# Start the application
echo "✅ Starting application..."
exec node server.js
