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
