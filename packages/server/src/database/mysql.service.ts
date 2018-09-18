import { createConnection, ConnectionOptions, useContainer } from 'typeorm'
import { Permission, Role, User } from './entities'
import { loggerFactory } from '../logger.factory'
import { Container as TypeDiContainer } from 'typedi'
import { join } from 'path'

export { Permission, Role, User }

export interface MySQLEnvironment {
  MYSQL_AUTH_USER: string
  MYSQL_AUTH_PASS: string
  MYSQL_PORT?: string | number
  MYSQL_URL?: string
  MYSQL_AUTH_DB?: string
}

export const mysqlConnection = (
  env: MySQLEnvironment,
  log = loggerFactory(),
) => {
  const port =
    (env.MYSQL_PORT && parseInt(env.MYSQL_PORT.toString(), 10)) || 3306
  const options: ConnectionOptions = {
    type: 'mysql',
    host: env.MYSQL_URL || 'localhost',
    port,
    username: env.MYSQL_AUTH_USER,
    password: env.MYSQL_AUTH_PASS,
    database: env.MYSQL_AUTH_DB || 'shingoauth',
    entities: [Permission, Role, User],
    logging: process.env.NODE_ENV !== 'production',
    logger: 'advanced-console',
    migrations: [join(__dirname, './migrations')],
    synchronize: process.env.NODE_ENV !== 'production',
  }

  useContainer(TypeDiContainer)

  return createConnection(options)
}
