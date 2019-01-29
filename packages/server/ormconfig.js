// @ts-check
// This file is for use by the typeorm cli
// keep it in sync with the mysql.service file
const { join } = require('path')

if (!process.env.MYSQL_AUTH_USER || !process.env.MYSQL_AUTH_PASS) {
  throw new Error('Environment Variables not specified')
}

const port =
  (process.env.MYSQL_PORT && parseInt(process.env.MYSQL_PORT.toString(), 10)) ||
  3306

/** @type {import('typeorm').ConnectionOptions}  */
const options = {
  type: 'mysql',
  host: process.env.MYSQL_URL || 'localhost',
  port,
  username: process.env.MYSQL_AUTH_USER,
  password: process.env.MYSQL_AUTH_PASS,
  database: process.env.MYSQL_AUTH_DB || 'shingoauth',
  entities: [join(__dirname, './build/database/entities/*.js')],
  logging: process.env.NODE_ENV !== 'production',
  logger: 'advanced-console',
  migrations: [join(__dirname, './build/database/migrations/*.js')],
  // leave this out because we don't want to overwrite before we run migrations
  // synchronize: process.env.NODE_ENV !== 'production',
}

module.exports = options
