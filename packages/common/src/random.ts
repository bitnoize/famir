import { randomBytes, randomInt } from 'node:crypto'

/**
 * Generates a cryptographically secure random identifier.
 *
 * Returns a 32-character hexadecimal string (16 random bytes).
 * Suitable for unique IDs, session tokens, and other security-sensitive contexts.
 *
 * @returns A 32-character hex string.
 */
export function randomIdent(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Generates a random, human-readable name.
 *
 * Creates a random string of 2 to 8 lowercase letters.
 * Useful for generating temporary names or human-readable identifiers.
 *
 * @returns A random string of 2-8 lowercase letters.
 */
export function randomName(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  const length = randomInt(2, 8 + 1)

  return Array.from({ length }, () => chars[randomInt(0, chars.length)]).join('')
}
