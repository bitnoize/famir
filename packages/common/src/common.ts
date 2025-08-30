import { randomBytes } from 'crypto'
import util from 'util'

Object.assign(util.inspect.defaultOptions, {
  depth: 8,
  colors: true,
  showHidden: false
})

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
  console.error(`Unhandled Rejection`, { reason, p })

  process.exit(1)
})

process.on('uncaughtException', (error: unknown) => {
  console.error(`Uncaught exception`, { error })

  process.exit(1)
})

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

export const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

export { serializeError } from 'serialize-error'

export const filterSecrets = (data: object, fields: string[]): Record<string, unknown> => {
  const result: Record<string, unknown> = {}

  Object.entries(data).forEach(([name, value]) => {
    const isSecret = fields.some((field) => field === name)
    result[name] = isSecret ? '<SECRET>' : value
  })

  return result
}

export const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const
