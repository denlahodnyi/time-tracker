#!/usr/bin/env bash

DIR="$(cd "$(dirname "$0")" && pwd)"
# Docker
docker compose -f $DIR/../docker/docker-compose.dev-db.yaml down -v
echo "Container stopped"
