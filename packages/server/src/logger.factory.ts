import { LoggerOptions, transports, createLogger } from 'winston'
import * as path from 'path'

export interface LoggerFactoryOptions {
  /** path to a log file */
  path?: string
  /** name of the log file */
  name?: string
  /** default log level */
  level?: 'silly' | 'debug' | 'verbose' | 'info' | 'warn' | 'error'
}

/**
 * Creates an instance of the winston logger that writes to stdout and a file
 * @param options A file to write to or an options object
 */
export const loggerFactory = (options?: string | LoggerFactoryOptions) => {
  const opts = typeof options === 'string' ? {} : options

  const logPath = (opts && opts.path) || process.env.LOG_PATH || ''
  const logName =
    typeof options === 'string'
      ? options
      : (opts && opts.name) || process.env.LOG_FILE || 'salesforce-api.log'

  const logLevel = (opts && opts.level) || process.env.LOG_LEVEL || 'info'

  const logTransports = [
    new transports.Console(),
    new transports.File({ filename: path.join(logPath, logName) }),
  ]

  const logOptions: LoggerOptions = {
    transports: logTransports,
    level: logLevel,
  }

  return createLogger(logOptions)
}
