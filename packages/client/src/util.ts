import { PromisifyAll } from './promisify-fix'
import { promisify } from 'util'
import { ServiceError } from 'grpc'
import { toClass } from '@shingo/auth-api-shared'

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

export const promisifyAll = <T extends object>(obj: T): PromisifyAll<T> => {
  const cache = new WeakMap()
  const handler: ProxyHandler<T> = {
    get(target, key) {
      const value = Reflect.get(target, key)
      if (typeof value !== 'function') {
        return value
      }
      if (!cache.has(value)) {
        cache.set(value, promisify(value))
      }
      return cache.get(value)
    },
  }

  return new Proxy(obj, handler) as any
}

export const parseEmpty = <T>(x: T): T | undefined =>
  (x as any).__tag_empty ? undefined : x

export const parseError = (err: ServiceError) => {
  const errorMeta = err.metadata && err.metadata.get('error-bin')
  const parsedErrorMeta =
    errorMeta && errorMeta.map(e => JSON.parse(e.toString()))

  if (parsedErrorMeta && parsedErrorMeta.length > 0) {
    const errorBase = parsedErrorMeta[0]
    const errorCls = toClass(Error)(errorBase)
    // toClass should do this, but for some reason properties like message are missing
    errorCls.message = errorCls.message || errorBase.message
    errorCls.name = errorCls.name || errorBase.name
    errorCls.stack = errorCls.stack || errorBase.stack
    throw errorCls
  }

  throw err
}
