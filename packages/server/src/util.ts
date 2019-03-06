import { handleUnaryCall, ServiceError, Metadata, status as Status } from 'grpc'

// tslint:disable:max-classes-per-file

export class NotFoundError extends Error {
  name = 'NOT_FOUND'
}

export class SError extends Error implements ServiceError {
  code?: Status
  metadata?: Metadata

  constructor(error: Error | object, status?: Status) {
    super()
    this.message = (error as Error).message
    this.name = (error as Error).name || 'Error'
    this.metadata = new Metadata()
    const stringErr = JSON.stringify(error, (_, value) => {
      if (value instanceof Error) {
        const err: any = {}
        Object.getOwnPropertyNames(error).forEach(k => {
          err[k] = (value as any)[k]
        })

        return err
      }

      return value
    })
    this.metadata.add('error-bin', Buffer.from(stringErr))
    this.code = status || Status.INTERNAL
  }
}

export const handleUnary = <Req, Res>(
  name: string,
  fn: (req: Req) => Promise<Res>,
): handleUnaryCall<Req, Res> => (call, cb) => {
  fn(call.request)
    .then(record => cb(null, record))
    .catch(error => {
      console.error(`Error in ${name}(): `, error)
      cb(new SError(error), null)
    })
}

export const undefinedToEmpty = <T>(o: T | undefined): T =>
  typeof o === 'undefined' ? (({ __tag_empty: true } as any) as T) : o

export const resolve = <Res>(
  res: (value?: Res) => void,
  rej: (reason?: any) => void,
) => (err: Error | null, data: Res) => {
  if (err) rej(err)
  else res(data)
}

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
