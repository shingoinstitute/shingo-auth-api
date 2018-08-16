#!/usr/bin/env node
import 'reflect-metadata'
import { loggerFactory } from '../shared/logger.service'
import { AuthMicroservice } from './microservices/auth.microservice'
import * as grpc from 'grpc'
import { mysqlConnection } from './database/mysql.service'
import { Container } from 'typedi'

const globalLogger = loggerFactory()
mysqlConnection(process.env as any).then(_conn => {

  const microservice = Container.get(AuthMicroservice)
  const port = process.env.PORT || 8888

  const server = new grpc.Server()

  server.addService(microservice.service, microservice)

  server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
  server.start()
  globalLogger.info(`AuthMicroservice is listening on port ${port}`)
}).catch(err => {
  globalLogger.error('Error in initialization')
  globalLogger.error(err)
  process.exit(err.code || 1)
})
