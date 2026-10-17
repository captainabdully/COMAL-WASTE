#!/usr/bin/env bash
# Full deploy for the COMAL WASTE server. Safe to run repeatedly.
#
#   bash deploy.sh              # pull + backend + admin frontend + web app + nginx
#   bash deploy.sh web          # only part of it: backend | frontend | web | nginx
#
# http://54.209.99.13/      -> admin frontend (/var/www/comal)
# http://54.209.99.13/web/  -> vendor web app (/var/www/comal-web)
# http://54.209.99.13/api/  -> Node backend on :5001 (pm2 process "app")
set -euo pipefail

REPO=/home/ubuntu/COMAL-WASTE
NGINX_SITE=/etc/nginx/sites-enabled/default
SNIPPET=/etc/nginx/snippets/comal-web.conf
PARTS=("$@"); [ ${#PARTS[@]} -eq 0 ] && PARTS=(backend frontend web nginx)
want() { for p in "${PARTS[@]}"; do [ "$p" = "$1" ] && return 0; done; return 1; }
step() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }

cd "$REPO"
node_major=$(node -p 'process.versions.node.split(".")[0]')
[ "$node_major" -ge 18 ] || { echo "Node 18+ required (found $(node -v))"; exit 1; }

step "Pulling origin main"
git pull --ff-only origin main

# ---------------------------------------------------------------- backend
if want backend; then
  step "Backend"
  cd "$REPO/backend"
  [ -f .env ] || { echo "ERROR: backend/.env is missing"; exit 1; }
  grep -q '^TRUST_PROXY=true' .env || echo "WARNING: set TRUST_PROXY=true in backend/.env (nginx is in front; otherwise all users share one rate-limit bucket)"
  npm ci --omit=dev
  pm2 describe app >/dev/null 2>&1 && pm2 restart app --update-env || pm2 start app.js --name app
  pm2 save >/dev/null
  sleep 8
  pm2 status
  pm2 logs app --lines 30 --nostream
  curl -fsS http://127.0.0.1:5001/ && echo
fi

# --------------------------------------------------------- admin frontend
if want frontend; then
  step "Admin frontend"
  cd "$REPO/frontend"
  npm ci
  npm run build
  sudo mkdir -p /var/www/comal
  sudo rsync -a --delete dist/ /var/www/comal/
fi

# ---------------------------------------------------------------- web app
if want web; then
  step "Web app (/web)"
  cd "$REPO/web"
  npm ci
  npm run build            # production build: base /web/, same-origin /api
  sudo mkdir -p /var/www/comal-web
  sudo rsync -a --delete dist/ /var/www/comal-web/
fi

# ------------------------------------------------------------------ nginx
if want nginx; then
  step "nginx"
  SITE=$(readlink -f "$NGINX_SITE")
  [ -f "$HOME/nginx-backup.conf" ] || sudo cp "$SITE" "$HOME/nginx-backup.conf"

  sudo tee "$SNIPPET" >/dev/null <<'EOF'
location = /web { return 301 /web/; }
location /web/ {
    alias /var/www/comal-web/;
    try_files $uri $uri/ /web/index.html;
}
EOF

  # one-time edits to the server block (skipped when already present)
  if ! grep -q 'snippets/comal-web.conf' "$SITE"; then
    sudo sed -i '0,/^[[:space:]]*location \/ {/s//    include snippets\/comal-web.conf;\n\n    location \/ {/' "$SITE"
  fi
  if ! grep -q 'client_max_body_size' "$SITE" /etc/nginx/nginx.conf; then
    # waste photos are up to 5 MB; nginx's 1 MB default would answer 413
    sudo sed -i '0,/root \/var\/www\/comal;/s//root \/var\/www\/comal;\n    client_max_body_size 6m;/' "$SITE"
  fi

  if sudo nginx -t; then
    sudo systemctl reload nginx
  else
    echo "nginx config test FAILED - restoring backup, not reloading"
    sudo cp "$HOME/nginx-backup.conf" "$SITE"
    exit 1
  fi
fi

# ----------------------------------------------------------------- verify
step "Checks"
code() { curl -s -o /dev/null -w '%{http_code}' "$1"; }
echo "admin  /            -> $(code http://127.0.0.1/)"
echo "api    /api/...     -> $(code http://127.0.0.1/api/dropping-point)"
echo "web    /web/        -> $(code http://127.0.0.1/web/)"
echo "web    deep link    -> $(code http://127.0.0.1/web/app/profile)"
curl -s http://127.0.0.1/web/ | grep -q '/web/assets/' \
  && echo "web app is being served from /web/" \
  || echo "WARNING: /web/ is not serving the web app (still the admin page?)"
echo; echo "Done."
