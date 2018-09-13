import { Token } from 'typedi'
import { LoggerInstance } from 'winston'

export const JWT_SECRET = new Token<string>('jwt-secret')
export const LOGGER = new Token<LoggerInstance>('logger')
export const AUDIT_LOGGER = new Token<LoggerInstance>('auth-api.audit.log')
export const JWT_ISSUER = new Token<string>('jwt-issuer')
