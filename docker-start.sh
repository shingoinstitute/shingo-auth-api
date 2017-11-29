#!/bin/bash

TAG=$1
PORT=$2

if [ -z "$1" ]; then
    TAG="local"
fi
if [ -z "$2" ]; then
    PORT=3001;
fi

# if [ -z "$SF_CLIENT" ]; then
#     echo "Need the SF_CLIENT env variable to be defined..."
#     exit 1
# fi

# if [ -z "$SF_SECRET" ]; then
#     echo "Need the SF_PASS env variable to be defined..."
#     exit 1
# fi

# if [ -z "$SF_CALLBACK" ]; then
#     echo "Need the SF_CALLBACK env variable to be defined..."
#     exit 1
# fi

docker build --tag shingo-auth-api:${TAG} .

docker network create shingo-dev-net

docker kill shingo-mysql-local
docker rm shingo-mysql-local

docker run -itd                                 \
    --name shingo-mysql-local                   \
    -e MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASS}   \
    --volume ${MYSQL_VOL_PREFIX}/var/lib/mysql:/var/lib/mysql:rw   \
    --network shingo-dev-net                    \
    mysql:5.7

docker kill shingo-auth-api
docker rm shingo-auth-api

docker run -itd                             \
    -e MYSQL_AUTH_USER=${MYSQL_AUTH_USER}   \
    -e MYSQL_AUTH_PASS=${MYSQL_AUTH_PASS}   \
    -e MYSQL_AUTH_DB=${MYSQL_AUTH_DB}       \
    -e MYSQL_URL=${MYSQL_URL}               \
    --name shingo-auth-api                  \
    --network shingo-dev-net                \
    --volume $(pwd)/src:/code/src           \
    --volume $(pwd)/specs:/code/specs       \
    shingo-auth-api:${TAG}