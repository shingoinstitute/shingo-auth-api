// from gcanti/fp-ts. All credit to them

export type Function1<A, B> = (a: A) => B
export type Function2<A, B, C> = (a: A, b: B) => C
export type Function3<A, B, C, D> = (a: A, b: B, c: C) => D
export type Function4<A, B, C, D, E> = (a: A, b: B, c: C, d: D) => E
export type Function5<A, B, C, D, E, F> = (a: A, b: B, c: C, d: D, e: E) => F
export type Function6<A, B, C, D, E, F, G> = (
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
) => G
export type Function7<A, B, C, D, E, F, G, H> = (
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
) => H
export type Function8<A, B, C, D, E, F, G, H, I> = (
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
) => I
export type Function9<A, B, C, D, E, F, G, H, I, J> = (
  a: A,
  b: B,
  c: C,
  d: D,
  e: E,
  f: F,
  g: G,
  h: H,
  i: I,
) => J

export function pipe<A, B, C>(ab: (a: A) => B, bc: (b: B) => C): (a: A) => C
export function pipe<A, B, C, D>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
): (a: A) => D
export function pipe<A, B, C, D, E>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): (a: A) => E
export function pipe<A, B, C, D, E, F>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): (a: A) => F
export function pipe<A, B, C, D, E, F, G>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
): (a: A) => G
export function pipe<A, B, C, D, E, F, G, H>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
): (a: A) => H
export function pipe<A, B, C, D, E, F, G, H, I>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
): (a: A) => I
export function pipe<A, B, C, D, E, F, G, H, I, J>(
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
  gh: (g: G) => H,
  hi: (h: H) => I,
  ij: (i: I) => J,
): (a: A) => J
/**
 * @function
 * @since 1.0.0
 */
// tslint:disable-next-line:ban-types
export function pipe(...fns: Function[]): Function {
  const len = fns.length - 1
  return function(this: any, x: any) {
    let y = x
    for (let i = 0; i <= len; i++) {
      y = fns[i].call(this, y)
    }
    return y
  }
}

export const tuple = <A, B>(a: A, b: B): [A, B] => [a, b]

/**
 * Apply a function to pairs of elements at the same index in two arrays, collecting the results in a new array. If one
 * input array is short, excess elements of the longer array are discarded.
 * @function
 * @since 1.0.0
 */
export const zipWith = <A, B, C>(
  fa: A[],
  fb: B[],
  f: (a: A, b: B) => C,
): C[] => {
  const fc = []
  const len = Math.min(fa.length, fb.length)
  for (let i = 0; i < len; i++) {
    fc[i] = f(fa[i], fb[i])
  }
  return fc
}

/**
 * Takes two arrays and returns an array of corresponding pairs. If one input array is short, excess elements of the
 * longer array are discarded
 * @function
 * @since 1.0.0
 */
export const zip = <A, B>(fa: A[], fb: B[]): Array<[A, B]> =>
  zipWith(fa, fb, tuple)

export const flatten = <A>(fa: A[][]): A[] =>
  fa.reduce((p, c) => [...p, ...c], [])
export const split = (sequence: string) => (s: string) => s.split(sequence)

// from isiahmeadows https://github.com/Microsoft/TypeScript/issues/26980#issue-358314615
export type Head<T extends any[]> = T extends [infer X, ...any[]]
  ? X
  : /* prettier-ignore */ T extends [(infer Y)?, ...any[]] ? Y | undefined : never

export type Tail<T extends any[]> = ((...x: T) => void) extends ((
  x: any,
  ...xs: infer XS
) => void)
  ? XS
  : never

export type Last<T extends any[]> = {
  0: never
  1: Head<T>
  2: Last<Tail<T>>
}[T extends [] ? 0 : T extends [any?] ? 1 : 2]
