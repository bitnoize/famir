import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'
import { deflateSync, inflateSync, constants as zlibConst } from 'node:zlib'
import { safeBase64Decode, safeBase64Encode } from './base64.js'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 16
const KEY_LENGTH = 32

/**
 * Derives a 32-byte encryption key using scrypt.
 *
 * @param secret - The secret passphrase.
 * @param salt - A cryptographically random salt.
 * @returns A 32-byte Buffer suitable for use as an AES-256 key.
 */
function deriveKey(secret: string, salt: Buffer): Buffer {
  return scryptSync(secret, salt, KEY_LENGTH)
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 *
 * The process is as follows:
 * 1. The plaintext is compressed using deflate for efficiency.
 * 2. A random salt and IV are generated.
 * 3. A key is derived from the `secret` and `salt` using scrypt.
 * 4. The compressed data is encrypted with the derived key and IV.
 * 5. The salt, IV, authentication tag, and ciphertext are concatenated.
 * 6. The final binary data is encoded into a URL-safe Base64 string.
 *
 * @param text - The plaintext to encrypt. Must be a non-empty string.
 * @param secret - The secret passphrase for encryption. Must be a non-empty string.
 * @returns The URL-safe Base64 encoded ciphertext, which includes the salt, IV, and auth tag.
 * @throws Error If `text` or `secret` is empty.
 * @throws Error If the encryption or compression process fails.
 */
export function encrypt(text: string, secret: string): string {
  if (!text || !secret) {
    throw new Error(`Encryption requires non-empty text and secret`)
  }

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
 * Decrypts a URL-safe Base64 encoded ciphertext using AES-256-GCM.
 *
 * The process is as follows:
 * 1. The input is decoded from Base64 to binary data.
 * 2. The salt, IV, authentication tag, and ciphertext are extracted.
 * 3. The key is re-derived from the `secret` and extracted salt.
 * 4. The ciphertext is decrypted and verified using the auth tag.
 * 5. The decrypted data is decompressed using inflate.
 * 6. The final plaintext is returned as a string.
 *
 * @param input - The URL-safe Base64 encoded ciphertext. Must be a non-empty string.
 * @param secret - The secret passphrase used for encryption. Must be a non-empty string.
 * @returns The decrypted and decompressed plaintext string.
 * @throws Error If `input` or `secret` is empty.
 * @throws Error If the decryption or decompression process fails.
 */
export function decrypt(input: string, secret: string): string {
  if (!input || !secret) {
    throw new Error(`Decryption requires non-empty input and secret`)
  }

  const data = safeBase64Decode(input)

  if (data.length < SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH) {
    throw new Error(`Invalid encrypted data: too short`)
  }

  const salt = data.subarray(0, SALT_LENGTH)
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

  if (encrypted.length === 0) {
    throw new Error(`Invalid encrypted data: missing ciphertext`)
  }

  const key = deriveKey(secret, salt)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])

  const decompressed = inflateSync(decrypted)

  return decompressed.toString()
}
