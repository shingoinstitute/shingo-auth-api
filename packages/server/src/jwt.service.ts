import { Service, Inject } from 'typedi'
import { InjectRepository } from 'typeorm-typedi-extensions'
import { User } from './database/mysql.service'
import { Repository } from 'typeorm'
import * as jwt from 'jsonwebtoken'
import { JWT_SECRET, LOGGER, AUDIT_LOGGER, JWT_ISSUER } from './constants'
import { LoggerInstance } from 'winston'
import { JWTPayload } from '@shingo/auth-api-shared'

@Service()
export class JWTService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(JWT_SECRET) private jwtSecret: string,
    @Inject(JWT_ISSUER) private issuer: string,
    @Inject(LOGGER) private log: LoggerInstance,
    @Inject(AUDIT_LOGGER) private auditLog: LoggerInstance,
  ) {}

  private getUser(payload: JWTPayload) {
    return this.userRepository.findOne(payload, { loadEagerRelations: false })
  }

  async issue(payload: JWTPayload) {
    return new Promise<string>((res, rej) =>
      jwt.sign(
        payload,
        this.jwtSecret,
        { issuer: this.issuer, expiresIn: '2 days' },
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
  isValid(token: string): Promise<false | JWTPayload> {
    return new Promise<JWTPayload | string>((res, rej) => {
      if (token === '' || typeof token === 'undefined') {
        throw new Error('INVALID_TOKEN')
      }

      jwt.verify(token, this.jwtSecret, { issuer: this.issuer }, (err, tok) => {
        if (err) rej(err)
        res(tok as JWTPayload | string)
      })
    })
      .then(async decoded => {
        if (typeof decoded === 'string') {
          this.auditLog.warn(
            '[INVALID_TOKEN] isValid returned false: Invalid payload ' + token,
          )
          return false
        }

        const user = await this.getUser(decoded)

        if (!user) {
          this.auditLog.warn(
            '[INVALID_TOKEN] isValid returned false: User not found ' + token,
          )
          return false
        }

        this.auditLog.info(
          `User ${decoded.email}${
            decoded.extId ? ':' + decoded.extId : ''
          } authenticated`,
        )

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
