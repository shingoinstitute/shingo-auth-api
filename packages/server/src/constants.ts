import { Token } from 'typedi'

export const JWT_SECRET = new Token<string>('jwt-secret')
export const JWT_ISSUER = new Token<string>('jwt-issuer')
