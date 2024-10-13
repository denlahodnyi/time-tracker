#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"
# Docker
docker compose -f $DIR/../docker/docker-compose.test-db.yaml up -d

echo '🟡 - Waiting for database to be ready...'
echo "Database URL: ${DATABASE_URL}"
$DIR/wait-for-it.sh "${DATABASE_URL}" -t 15 -- echo '🟢 - Database is ready!'

# Migrate
pnpm -F @libs/prisma push --skip-generate --force-reset
# Seed
pnpm -F @libs/prisma seed:dev
