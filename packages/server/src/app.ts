#!/usr/bin/env node
import 'reflect-metadata'
import { loggerFactory } from './logger.factory'
import { AuthMicroservice } from './microservices/auth.microservice'
import * as grpc from 'grpc'
import { mysqlConnection } from './database/mysql.service'
import { Container } from 'typedi'
import { JWT_SECRET, LOGGER, AUDIT_LOGGER, JWT_ISSUER } from './constants'

const secret =
  process.env.NODE_ENV !== 'production'
    ? process.env.JWT_SECRET || 'ilikecatz'
    : process.env.JWT_SECRET ||
      (() => {
        throw new Error('JWT_SECRET is not defined')
      })()

Container.set(JWT_SECRET, secret)
Container.set(LOGGER, loggerFactory())
Container.set(AUDIT_LOGGER, loggerFactory('auth-api.audit.log'))
Container.set(JWT_ISSUER, 'auth.shingo.org')

const globalLogger = Container.get(LOGGER)
mysqlConnection(process.env as any)
  .then(_conn => {
    const microservice = Container.get(AuthMicroservice)
    const port = process.env.PORT || 8888

    const server = new grpc.Server()

    server.addService(microservice.service, microservice)

    server.bind(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure())
    server.start()
    globalLogger.info(`AuthMicroservice is listening on port ${port}`)
  })
  .catch(err => {
    globalLogger.error('Error in initialization')
    globalLogger.error(err)
    process.exit(err.code || 1)
  })
