import { plainToClass, classToPlain, classToClass } from 'class-transformer'
import { validate, ValidationError as VError } from 'class-validator'

// tslint:disable:max-classes-per-file

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type Overwrite<A extends object, B extends object> = Pick<
  A,
  Exclude<keyof A, keyof B>
> &
  B

export type RequireKeys<T extends object, K extends keyof T> = Overwrite<
  T,
  { [key in K]-?: T[key] }
>

export type OptionalKeys<T extends object, K extends keyof T> = Overwrite<
  T,
  { [key in K]+?: T[key] }
>

export interface ClassType<T> {
  new (...args: any[]): T
}

export const toClass = <T>(cls: ClassType<T>) => (plain: object) =>
  plainToClass(cls, plain)

export { classToPlain, classToClass, plainToClass }

export const validateInput = <T>(
  cls: ClassType<T>,
  options: { partial?: boolean; groups?: string[] } = {},
) => <U extends object>(plain: U) => {
  const instance =
    plain instanceof cls ? ((plain as any) as T) : plainToClass(cls, plain)
  return validate(instance, {
    validationError: { target: process.env.NODE_ENV !== 'production' },
    skipMissingProperties: !!options.partial,
    groups: options.groups || [],
  }).then(errs => {
    if (errs.length === 0) return instance
    throw new ValidationError(errs)
  })
}

export class ValidationError extends Error {
  message = 'Error, Invalid input'
  name = 'ValidationError'
  errors: VError[]

  constructor(errors: VError[], message?: string) {
    super()
    this.message = message || this.message
    this.errors = errors
  }
}

export class InvalidTokenError extends Error {
  // Error.name gets wiped by plainToClass, so we also need to include another discriminator
  kind: 'INVALID_TOKEN' = 'INVALID_TOKEN'
  name = 'INVALID_TOKEN'
  subError?: Error
  constructor(readonly token: string, data?: string | Error) {
    super(typeof data === 'string' ? data : undefined)
    if (typeof data !== 'string') {
      this.subError = data
    }
  }
}
