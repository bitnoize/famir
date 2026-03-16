import { randomBytes } from 'crypto'
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

export const SHUTDOWN_SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT', 'SIGQUIT'] as const

export { serializeError } from 'serialize-error'

// https://oida.dev/typescript-array-includes/
export const arrayIncludes = <T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T => {
  return coll.includes(el as T)
}

export const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

export const randomName = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'

  const minLength = 2
  const maxLength = 8

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const safeBase64Encode = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export const safeBase64Decode = (value: string): string => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4) {
    base64 += '='
  }

  return base64
}
