import { Service, Inject } from 'typedi'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET, JWT_ISSUER } from './constants'
import { JWTPayload, InvalidTokenError } from '@shingo/auth-api-shared'

// tslint:disable-next-line:max-classes-per-file
@Service()
export class JWTService {
  constructor(
    @Inject(JWT_SECRET) private jwtSecret: string,
    @Inject(JWT_ISSUER) private issuer: string,
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
  async isValid<T extends object = JWTPayload>(token: string): Promise<T> {
    try {
      const decoded = await new Promise<T | string>((res, rej) => {
        if (token === '' || typeof token === 'undefined') {
          throw new InvalidTokenError(token, 'Token was empty or undefined')
        }

        jwt.verify(
          token,
          this.jwtSecret,
          { issuer: this.issuer },
          (err, tok) => {
            if (err) rej(err)
            res(tok as T | string)
          },
        )
      })

      if (typeof decoded === 'string') {
        throw new InvalidTokenError(token, 'Invalid Payload: ' + decoded)
      }

      return decoded
    } catch (reason) {
      if (reason instanceof jwt.NotBeforeError) {
        console.warn(
          `[INVALID_TOKEN] isValid returned false: NotBefore ${
            reason.date
          } ${token}`,
        )

        throw new InvalidTokenError(token, reason)
      } else if (reason instanceof jwt.TokenExpiredError) {
        console.warn(
          `[INVALID_TOKEN] isValid returned false: Expired ${
            reason.expiredAt
          } ${token}`,
        )

        throw new InvalidTokenError(token, reason)
      } else if (reason instanceof jwt.JsonWebTokenError) {
        console.warn('[INVALID_TOKEN] isValid returned false ' + token)
        console.error('Unknown JWT Error ', reason)

        throw new InvalidTokenError(token, reason)
      } else {
        console.warn('[INVALID_TOKEN] isValid returned false ' + token)
        console.error('Unknown Error ', reason)
      }

      throw reason
    }
  }
}
