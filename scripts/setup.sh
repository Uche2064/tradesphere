#!/bin/sh
set -e

echo "TradeSphere Docker startup"
echo "===================================="

# 1. Vérifier que DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set"
  exit 1
fi

echo "DATABASE_URL detected"

# 2. Prisma setup
echo "Generating Prisma client..."
npx prisma generate

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Seeding database..."
npx prisma db seed || echo "⚠️ Seed skipped (already done)"

# 3. Start app
echo "🔥 Starting application..."
npm run dev
