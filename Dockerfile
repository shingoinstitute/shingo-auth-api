# we need a c compiler to build scrypt, so we use node 8.9 not alpine
### STEP 1: Build ###
FROM node:8 as build
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --silent
COPY . .
RUN npm run build

## STEP 2: Run Production ##
FROM node:8 as prod
COPY --from=build /build/ build
COPY --from=build /package.json package.json
RUN npm install --production --silent
EXPOSE 80
ENV PORT 80
ENV LOG_PATH ./
ENV LOG_FILE shingo-auth-api.log
ENV NODE_ENV production
ENV LOG_LEVEL info
CMD npm start

FROM prod as debug
COPY --from=build /node_modules/ /node_modules
ENV NODE_ENV development
CMD npm run debug

# End with prod layer so it is default
FROM prod