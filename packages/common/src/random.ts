import { randomBytes } from 'crypto'

/**
 * Generate random identifier
 * @category none
 */
export const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

/**
 * Generate random name
 * @category none
 */
export const randomName = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'

  const minLength = 2
  const maxLength = 8

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
