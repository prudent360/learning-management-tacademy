#!/bin/sh
set -e

# DATA_DIR should point at the platform's persistent volume mount (e.g. "/data"
# on Fly.io, a Railway volume mount path). Both the SQLite database and
# admin-uploaded branding assets live under it so they survive deploys/restarts.
DATA_DIR="${DATA_DIR:-/data}"
mkdir -p "$DATA_DIR/uploads/branding"

# The app writes branding uploads to ./public/uploads/branding (relative to
# cwd) — replace the baked-in empty directory with a symlink into the volume
# so those writes land on persistent storage without any app code changes.
if [ ! -L "./public/uploads/branding" ]; then
  rm -rf "./public/uploads/branding"
  ln -s "$DATA_DIR/uploads/branding" "./public/uploads/branding"
fi

# Apply any migrations that haven't run yet against the persistent database.
# Safe to run on every boot: it's a no-op when already up to date.
npx prisma migrate deploy

exec node server.js
