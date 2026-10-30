#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${GOTRUE_JWT_SECRET:?GOTRUE_JWT_SECRET is required}"
if [ -z "${API_EXTERNAL_URL:-}" ]; then
  : "${API_PUBLIC_URL:?API_PUBLIC_URL is required}"
  export API_EXTERNAL_URL="${API_PUBLIC_URL%/}/auth/v1"
fi
export GOTRUE_DB_DRIVER=postgres
case "$DATABASE_URL" in
  *\?*) export GOTRUE_DB_DATABASE_URL="${DATABASE_URL}&options=-csearch_path%3Dauth%2Cpublic" ;;
  *) export GOTRUE_DB_DATABASE_URL="${DATABASE_URL}?options=-csearch_path%3Dauth%2Cpublic" ;;
esac
export GOTRUE_DB_NAMESPACE=auth
export GOTRUE_API_HOST=0.0.0.0
export PORT="${PORT:-9999}"
export GOTRUE_API_PORT="$PORT"
export GOTRUE_JWT_AUD=authenticated
export GOTRUE_JWT_ADMIN_ROLES=service_role
export GOTRUE_JWT_EXP=3600
export GOTRUE_SITE_URL="${GOTRUE_SITE_URL:-https://everybodypolls.com}"
export GOTRUE_URI_ALLOW_LIST="${GOTRUE_URI_ALLOW_LIST:-com.everybody.polls://**,everybody-polls://**,https://everybodypolls.com/**,https://www.everybodypolls.com/**}"
# Enable signup after SMTP or an auth send-email hook is configured.
export GOTRUE_DISABLE_SIGNUP="${GOTRUE_DISABLE_SIGNUP:-true}"
export GOTRUE_MAILER_AUTOCONFIRM="${GOTRUE_MAILER_AUTOCONFIRM:-false}"
export GOTRUE_EXTERNAL_EMAIL_ENABLED=true
export GOTRUE_PASSWORD_MIN_LENGTH=10
export GOTRUE_EXTERNAL_GOOGLE_ENABLED="${GOTRUE_EXTERNAL_GOOGLE_ENABLED:-false}"
export GOTRUE_EXTERNAL_APPLE_ENABLED="${GOTRUE_EXTERNAL_APPLE_ENABLED:-false}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c 'CREATE SCHEMA IF NOT EXISTS auth;'
exec /usr/local/bin/auth
