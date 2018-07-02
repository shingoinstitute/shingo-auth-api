# we need a c compiler to build scrypt, so we use node 8.9
FROM node:8.9 as build
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

FROM node:8.9-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY --from=build /usr/src/node_modules /usr/src/app/node_modules
COPY . .
RUN npm run build
ENV PORT 80
ENV LOG_FILE shingo-auth-api.log
ENV LOG_LEVEL info
EXPOSE 80
CMD npm start
