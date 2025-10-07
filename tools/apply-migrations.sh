#!/usr/bin/env bash
set -euo pipefail

# This script now uses 'docker compose exec' to run psql inside the container.
# You can run this script directly from your host machine.

echo "Applying migrations inside the 'postgres' container..."

# 1. Apply the crypto extension
# The -T flag is important for non-interactive execution.
# We connect using the user and db name from the docker-compose.yml environment.
docker compose exec -T postgres psql -U app -d app -v ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL

# 2. Loop through and apply all .sql files from the migrations directory
for f in $(ls -1 migrations/*.sql | sort); do
  echo "Applying $f...";
  # We 'cat' the local migration file and pipe its content into the 'psql'
  # command running inside the container.
  cat "$f" | docker compose exec -T postgres psql -U app -d app -v ON_ERROR_STOP=1
done

echo "Migrations applied successfully."
