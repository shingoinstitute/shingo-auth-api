FROM node

WORKDIR /code

RUN npm install -g typescript nodemon

ENV PORT=80

EXPOSE 80

ENTRYPOINT npm install && npm rebuild scrypt && npm start