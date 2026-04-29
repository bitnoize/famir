import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'
import { deflateSync, inflateSync, constants as zlibConst } from 'zlib'
import { safeBase64Decode, safeBase64Encode } from './base64.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12 // recommended for GCM
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16
const KEY_LENGTH = 32 // 256 bytes

/**
 * Encrypt a string with a secret using AES-256-GCM.
 *
 * The string is first compressed using deflate, then encrypted with a random IV and salt.
 * The result is encoded as URL-safe Base64.
 *
 * @category none
 * @param text - The plaintext to encrypt
 * @param secret - The secret key for encryption
 * @returns URL-safe Base64 encoded ciphertext (includes salt, IV, and auth tag)
 * @example
 * ```ts
 * const encrypted = encrypt('Secret message', 'mySecret123')
 * console.log(encrypted)
 * ```
 */
export function encrypt(text: string, secret: string): string {
  const compressed = deflateSync(text, {
    level: zlibConst.Z_BEST_COMPRESSION,
  })

  const salt = randomBytes(SALT_LENGTH)
  const iv = randomBytes(IV_LENGTH)

  const key = deriveKey(secret, salt)

  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()])

  const authTag = cipher.getAuthTag()

  const data = Buffer.concat([salt, iv, authTag, encrypted])

  return safeBase64Encode(data)
}

/**
 * Decrypt a string with a secret using AES-256-GCM.
 *
 * The input should be a URL-safe Base64 encoded string from {@link encrypt}.
 * Extracts the salt, IV, and auth tag, then decrypts and decompresses the data.
 *
 * @category none
 * @param value - URL-safe Base64 encoded ciphertext
 * @param secret - The secret key for decryption
 * @returns The decrypted plaintext
 * @throws Error if decryption fails or auth tag is invalid
 * @example
 * ```ts
 * const encrypted = encrypt('Secret message', 'mySecret123')
 * const decrypted = decrypt(encrypted, 'mySecret123')
 * console.log(decrypted) // Secret message
 * ```
 */
export function decrypt(value: string, secret: string): string {
  const data = safeBase64Decode(value)

  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

  const key = deriveKey(secret, salt)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  const decompressed = inflateSync(decrypted)

  return decompressed.toString()
}

function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH)
}
