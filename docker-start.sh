#!/bin/bash

TAG=$1
PORT=$2

if [ -z "$1" ]; then
    TAG="local"
fi
if [ -z "$2" ]; then
    PORT=3001;
fi

if [ -z "$SF_CLIENT" ]; then
    echo "Need the SF_CLIENT env variable to be defined..."
    exit 1
fi

if [ -z "$SF_SECRET" ]; then
    echo "Need the SF_PASS env variable to be defined..."
    exit 1
fi

if [ -z "$SF_CALLBACK" ]; then
    echo "Need the SF_CALLBACK env variable to be defined..."
    exit 1
fi

docker build --tag shingo-auth-api:${TAG} .

docker network create shingo-dev-net

# docker kill shingo-redis
# docker rm shingo-redis

# docker run -itd                                             \
#     --name shingo-redis                                     \
#     --volume $(pwd)/build/redis:/data                       \
#     --network shingo-dev-net                                \
#     redis redis-server

docker kill shingo-auth-api
docker rm shingo-auth-api

docker run -itd                 \
    -e SF_USER=${SF_CLIENT}     \
    -e SF_PASS=${SF_SECRET}     \
    -e SF_ENV=${SF_CALLBACK}    \
    -e MYSQL_AUTH_USER=${MYSQL_AUTH_USER} \
    -e MYSQL_AUTH_PASS=${MYSQL_AUTH_PASS} \
    -e MYSQL_AUTH_DB=${MYSQL_AUTH_DB} \
    -e MYSQL_URL=${MYSQL_URL} \
    --name shingo-auth-api      \
    --network shingo-dev-net    \
    --volume $(pwd):/code       \
    shingo-auth-api:${TAG}