export interface ScryptParams {
  N: number;
  r: number;
  p: number;
}

export function params(maxtime: number, maxmem?: number, maxmemfrac?: number): Promise<ScryptParams>
export function params(maxtime: number, cb: (err: Error | null, obj: ScryptParams) => void): void
export function params(maxtime: number, maxmem: number, cb: (err: Error | null, obj: ScryptParams) => void): void
export function params(maxtime: number, maxmem: number, maxmemfrac: number, cb: (err: Error | null, obj: ScryptParams) => void): void
export function paramsSync(maxtime: number, maxmem?: number, maxmemfrac?: number): ScryptParams

export function kdf(key: string | Buffer, paramsObject: ScryptParams): Promise<Buffer>
export function kdf(key: string | Buffer, paramsObject: ScryptParams, cb: (err: Error | null, obj: Buffer) => void): void
export function kdfSync(key: string | Buffer, paramsObject: ScryptParams): Buffer

export function verifyKdf(kdf: Buffer, key: string | Buffer): Promise<boolean>
export function verifyKdf(kdf: Buffer, key: string | Buffer, cb: (err: Error | null, obj: boolean) => void): void
export function verifyKdfSync(kdf: Buffer, key: string | Buffer): boolean

export function hash(key: string | Buffer, params: ScryptParams, outputLength: number, salt: string | Buffer): Promise<Buffer>
export function hash(key: string | Buffer, params: ScryptParams, outputLength: number, salt: string | Buffer, cb: (err: Error | null, obj: Buffer) => void): void
export function hashSync(key: string | Buffer, params: ScryptParams, outputLength: number, salt: string | Buffer): Buffer
