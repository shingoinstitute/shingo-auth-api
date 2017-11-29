FROM node:8

WORKDIR /code

COPY .dockerignore .dockerignore

COPY package.json package.json

COPY package-lock.json package-lock.json

COPY tsconfig.json tsconfig.json

RUN npm install -g typescript nodemon alsatian tap-summary nyc

RUN npm install

RUN tsc

ENV PORT=80

EXPOSE 80

ENTRYPOINT ["npm", "run"]

CMD ["start"]