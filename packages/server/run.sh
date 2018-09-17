#!/bin/bash

TAG="${TAG:-latest}"
NETWORK="${NETWORK:-shingo-net}"
IMG_NAME="shingo-auth-api"
CONT_NAME="shingo-auth-api"
MYSQL_AUTH_USER=${MYSQL_AUTH_USER:?"Must set MYSQL_AUTH_USER"}
MYSQL_AUTH_PASS=${MYSQL_AUTH_PASS:?"Must set MYSQL_AUTH_PASS"}
MYSQL_AUTH_DB=${MYSQL_AUTH_DB:?"Must set MYSQL_AUTH_DB"}
MYSQL_URL=${MYSQL_URL:-shingo-mysql}
PORT=${PORT:-80}

if [[ "$TAG" = "test" ]]; then
  CONT_NAME+="-test"
fi

NAME="${NAME:-$CONT_NAME}"

docker run -itd                           \
    --name "$NAME"                        \
    --network "$NETWORK"                  \
    --publish "$PORT":80                  \
    -e MYSQL_URL="$MYSQL_URL"             \
    -e MYSQL_AUTH_DB="$MYSQL_AUTH_DB"     \
    -e MYSQL_AUTH_PASS="$MYSQL_AUTH_PASS" \
    -e MYSQL_AUTH_USER="$MYSQL_AUTH_USER" \
    docker.shingo.org/"$IMG_NAME":"$TAG"
