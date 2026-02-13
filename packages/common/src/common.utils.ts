import { randomBytes, randomInt } from 'crypto'
import util from 'util'

Object.assign(util.inspect.defaultOptions, {
  depth: 8,
  showHidden: false
})

process.on('unhandledRejection', (reason: string, p: Promise<unknown>) => {
  console.error(`Unhandled rejection`, { reason, p })

  process.exit(1)
})

process.on('uncaughtException', (error: unknown) => {
  console.error(`Uncaught exception`, { error })

  process.exit(1)
})

const nodeEnv = process.env['NODE_ENV'] || 'development'

export const isProduction = nodeEnv === 'production'
export const isDevelopment = nodeEnv === 'development'

export { serializeError } from 'serialize-error'

// https://oida.dev/typescript-array-includes/
export const arrayIncludes = <T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T => {
  return coll.includes(el as T)
}

export const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

export const randomLockCode = (): number => {
  return randomInt(100000, 999999)
}

export const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const
