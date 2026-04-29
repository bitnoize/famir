import { randomBytes } from 'crypto'

/**
 * Generate a cryptographically secure random identifier.
 *
 * Returns a 32-character hexadecimal string (16 random bytes).
 * Suitable for unique IDs, session tokens, and security-sensitive applications.
 *
 * @category none
 * @returns A random 32-character hex string
 * @example
 * ```ts
 * const id = randomIdent()
 * console.log(id) // e.g. "a3f2b8c9d4e1f6a2b3c4d5e6f7a8b9c0"
 * ```
 */
export const randomIdent = (): string => {
  return randomBytes(16).toString('hex')
}

/**
 * Generate a random readable name.
 *
 * Creates a random string of 2-8 lowercase letters.
 * Useful for generating temporary names, usernames, or human-readable identifiers.
 *
 * @category none
 * @returns A random string of 2-8 lowercase letters
 * @example
 * ```ts
 * const name = randomName()
 * console.log(name) // e.g. "quickfox" or "ab"
 * ```
 */
export const randomName = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'

  const minLength = 2
  const maxLength = 8

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength

  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}
