FROM node:8

WORKDIR /code

COPY package.json package.json

COPY package-lock.json package-lock.json

RUN npm install -g typescript nodemon alsatian tap-summary nyc

RUN npm install

RUN npm rebuild scrypt grpc

ENV PORT=80

EXPOSE 80

ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]