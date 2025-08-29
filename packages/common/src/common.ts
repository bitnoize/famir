import { randomBytes } from 'crypto'

export const isProduction = (): boolean => {
  return process.env['NODE_ENV'] === 'production'
}

// https://oida.dev/typescript-array-includes/
export const arrayIncludes = <T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T => {
  return coll.includes(el as T)
}

export const objectProperty = <T, K extends keyof T>(
  obj: T,
  key: K,
  defaultValue: NonNullable<T[K]>
): NonNullable<T[K]> => {
  return obj[key] ?? defaultValue
}

const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

export { serializeError } from 'serialize-error'
