import { Token } from 'typedi'
import { Logger } from 'winston'

export const JWT_SECRET = new Token<string>('jwt-secret')
export const LOGGER = new Token<Logger>('logger')
export const AUDIT_LOGGER = new Token<Logger>('auth-api.audit.log')
export const JWT_ISSUER = new Token<string>('jwt-issuer')
