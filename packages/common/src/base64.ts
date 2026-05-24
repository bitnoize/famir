/**
 * Encodes a Buffer into a URL-safe Base64 string.
 *
 * This function uses a standard Base64 encoding and then replaces
 * '+' with '-', '/' with '_', and removes trailing '=' padding
 * to make the result safe for use in URLs and file names.
 *
 * @param data - The Buffer to encode.
 * @returns The URL-safe Base64 string.
 * @throws Error If Base64 encoding fails.
 */
export function safeBase64Encode(data: Buffer): string {
  const base64 = data.toString('base64')

  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decodes a URL-safe Base64 string back into a Buffer.
 *
 * This function reverses the transformation applied by `safeBase64Encode`.
 * It restores the standard Base64 characters and padding before decoding.
 *
 * @param value - The URL-safe Base64 string to decode.
 * @returns The decoded Buffer.
 * @throws Error If Base64 decoding fails.
 */
export function safeBase64Decode(value: string): Buffer {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4) {
    base64 += '='
  }

  return Buffer.from(base64, 'base64')
}
