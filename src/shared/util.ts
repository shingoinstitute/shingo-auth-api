import { LoggerInstance } from 'winston'
import { handleUnaryCall, ServiceError, Metadata, status as Status } from 'grpc'

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
    this.metadata.add('error-bin', Buffer.from(JSON.stringify(error)))
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
        logger.error(`Error in ${name}(): %j`, error)
        cb(new SError(error), null)
      })
  }
