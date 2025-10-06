# empty
#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL in environment}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE EXTENSION IF NOT EXISTS pgcrypto;
SQL
for f in $(ls -1 migrations/*.sql | sort); do
echo "Applying $f";
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f";
done
echo "Migrations applied."