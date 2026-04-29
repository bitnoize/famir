/**
 * Safe Base64 encode using URL-safe alphabet.
 *
 * Converts a buffer to Base64 string using URL-safe characters.
 *
 * @category none
 * @param data - The buffer to encode
 * @returns URL-safe Base64 encoded string without padding
 * @example
 * ```ts
 * const buffer = Buffer.from('Hello, World!')
 * const encoded = safeBase64Encode(buffer)
 * console.log(encoded) // SGVsbG8sIFdvcmxkIQ
 * ```
 */
export const safeBase64Encode = (data: Buffer): string => {
  const base64 = data.toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Safe Base64 decode from URL-safe alphabet.
 *
 * Converts a URL-safe Base64 string back to a buffer.
 *
 * @category none
 * @param value - URL-safe Base64 encoded string
 * @returns Decoded buffer
 * @throws Error if the input is not valid Base64
 * @example
 * ```ts
 * const encoded = 'SGVsbG8sIFdvcmxkIQ'
 * const decoded = safeBase64Decode(encoded)
 * console.log(decoded.toString()) // Hello, World!
 * ```
 */
export const safeBase64Decode = (value: string): Buffer => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4) {
    base64 += '='
  }

  return Buffer.from(base64, 'base64')
}
