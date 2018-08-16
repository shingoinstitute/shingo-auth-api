import { LoggerInstance } from 'winston'
import { handleUnaryCall, ServiceError, Metadata, status as Status } from 'grpc'

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export class NotFoundError extends Error {
  name = 'NOT_FOUND'
}

export type Overwrite<A extends object, B extends object> = Pick<A, Exclude<keyof A, keyof B>> & B
export type RequireKeys<T extends object, K extends keyof T> = Overwrite<T, { [key in K]-?: T[key] }>

// tslint:disable-next-line:max-classes-per-file
export class SError extends Error implements ServiceError {
  code?: Status
  metadata?: Metadata

  constructor(error: Error, status?: Status) {
    super()
    this.message = error.message
    this.name = error.name || 'Error'
    this.metadata = new Metadata()
    this.metadata.add('error-bin',
      Buffer.from(error instanceof Error
        ? JSON.stringify(error, Object.getOwnPropertyNames(error))
        : JSON.stringify(error)
      )
    )
    this.code = status || Status.INTERNAL
  }
}

export const handleUnary =
  (logger: LoggerInstance) =>
  <Req, Res>(name: string, fn: (req: Req) => Promise<Res>): handleUnaryCall<Req, Res> =>
  (call, cb) => {
    fn(call.request)
      .then(record => cb(null, record))
      .catch(error => {
        logger.error(`Error in ${name}(): `, error)
        cb(new SError(error), null)
      })
  }

export const undefinedToNull = <T>(o: T | undefined): T | null => typeof o === 'undefined' ? null : o

/**
 * Binds all methods on an object using Proxy
 * from https://ponyfoo.com/articles/binding-methods-to-class-instance-objects
 * @param obj The object
 */
export const bindAll = <T extends object>(obj: T): T => {
  const cache = new WeakMap()
  const handler: ProxyHandler<T> = {
    get(target, key) {
      const value = Reflect.get(target, key)
      if (typeof value !== 'function') {
        return value
      }
      if (!cache.has(value)) {
        cache.set(value, value.bind(target))
      }
      return cache.get(value)
    },
  }
  return new Proxy(obj, handler)
}
