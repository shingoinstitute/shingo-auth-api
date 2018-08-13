import { createConnection, Connection, ConnectionOptions, useContainer } from 'typeorm'
import { Permission, Role, User, Level } from './entities'
import { loggerFactory } from '../../shared/logger.service'
import { Container as TypeDiContainer } from 'typedi'

export { Permission, Role, User, Level }

export interface MySQLEnvironment {
  MYSQL_AUTH_USER: string
  MYSQL_AUTH_PASS: string
  MYSQL_PORT?: string | number
  MYSQL_URL?: string
  MYSQL_AUTH_DB?: string
}

export const jwtSecret = (process.env.JWT_SECRET || 'ilikecatz')

export const mysqlConnection = (env: MySQLEnvironment, log = loggerFactory()) => {
  const port = env.MYSQL_PORT && parseInt(env.MYSQL_PORT.toString(), 10) || 3306
  const options: ConnectionOptions = {
    type: 'mysql',
    host: process.env.MYSQL_URL || 'localhost',
    port,
    username: env.MYSQL_AUTH_USER,
    password: env.MYSQL_AUTH_PASS,
    database: env.MYSQL_AUTH_DB || 'shingoauth',
    entities: [
      Permission,
      Role,
      User,
    ],
    synchronize: process.env.NODE_ENV !== 'production',
  }

  useContainer(TypeDiContainer)

  return createConnection(options).catch(err => {
    log.error('Error in MySQLService.init(): %j', err)
    throw err
  })
}
