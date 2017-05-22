import { NestFactory, Transport } from 'nest.js';
import { ApplicationModule } from './app.module'
import { MicroservicesModule } from './microservices.module';
import * as express from 'express';
import * as bodyParser from 'body-parser';

const server = express()
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: false}))

let port = process.env.PORT || 3000


const app = NestFactory.create(ApplicationModule, server);
app.listen(port, () => console.log(`Salesforce API Application is listening on port ${port}`));

const transport = Transport.REDIS;
const url = process.env.REDIS_URL || 'redis://shingo-redis:6379'

const ms = NestFactory.createMicroservice(MicroservicesModule, { transport, url, port: port + 1 });
ms.listen(() => console.log(`Salesforce API Microservice is listening on port ${port + 1}`));