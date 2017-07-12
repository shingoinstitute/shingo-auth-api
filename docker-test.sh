docker kill shingo-auth-api-test
docker rm shingo-auth-api-test

docker build --tag shingo-auth-api:test .

docker run                                  \
    -e MYSQL_AUTH_USER=${MYSQL_AUTH_USER}   \
    -e MYSQL_AUTH_PASS=${MYSQL_AUTH_PASS}   \
    -e MYSQL_AUTH_DB=${MYSQL_AUTH_DB}       \
    -e MYSQL_URL=${MYSQL_URL}               \
    --name shingo-auth-api-test             \
    --network shingo-dev-net                \
    --volume $(pwd):/code                   \
    shingo-auth-api:test ${1}

docker rm shingo-auth-api-test