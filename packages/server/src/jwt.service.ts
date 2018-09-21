import { Service, Inject } from 'typedi'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET, LOGGER, AUDIT_LOGGER, JWT_ISSUER } from './constants'
import { Logger } from 'winston'
import { JWTPayload } from '@shingo/auth-api-shared'

@Service()
export class JWTService {
  constructor(
    @Inject(JWT_SECRET) private jwtSecret: string,
    @Inject(JWT_ISSUER) private issuer: string,
    @Inject(LOGGER) private log: Logger,
    @Inject(AUDIT_LOGGER) private auditLog: Logger,
  ) {}

  async issue<T extends object = JWTPayload>(payload: T, expiresIn = '2 days') {
    return new Promise<string>((res, rej) =>
      jwt.sign(
        payload,
        this.jwtSecret,
        { issuer: this.issuer, expiresIn },
        (err, token) => {
          if (err) rej(err)
          res(token)
        },
      ),
    )
  }

  /**
   * Verifies that a jwt token is valid
   * @param token a jwt token
   */
  isValid<T extends object = JWTPayload>(token: string): Promise<false | T> {
    return new Promise<T | string>((res, rej) => {
      if (token === '' || typeof token === 'undefined') {
        throw new Error('INVALID_TOKEN')
      }

      jwt.verify(token, this.jwtSecret, { issuer: this.issuer }, (err, tok) => {
        if (err) rej(err)
        res(tok as T | string)
      })
    })
      .then(async decoded => {
        if (typeof decoded === 'string') {
          this.auditLog.warn(
            '[INVALID_TOKEN] isValid returned false: Invalid payload ' + token,
          )
          return false
        }
        return decoded
      })
      .catch<false>((reason: jwt.VerifyErrors | Error) => {
        if (reason instanceof jwt.NotBeforeError) {
          this.auditLog.warn(
            `[INVALID_TOKEN] isValid returned false: NotBefore ${
              reason.date
            } ${token}`,
          )
        } else if (reason instanceof jwt.TokenExpiredError) {
          this.auditLog.warn(
            `[INVALID_TOKEN] isValid returned false: Expired ${
              reason.expiredAt
            } ${token}`,
          )
        } else if (reason instanceof jwt.JsonWebTokenError) {
          this.auditLog.warn('[INVALID_TOKEN] isValid returned false ' + token)
          this.log.error('Unknown JWT Error ', reason)
        } else {
          this.auditLog.warn('[INVALID_TOKEN] isValid returned false ' + token)
          this.log.error('Unknown Error ', reason)
        }

        return false
      })
  }
}
