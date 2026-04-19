/**
 * Safe Base64 encode
 * @category none
 */
export const safeBase64Encode = (data: Buffer): string => {
  const base64 = data.toString('base64')
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Safe Base64 decode
 * @category none
 */
export const safeBase64Decode = (value: string): Buffer => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4) {
    base64 += '='
  }

  return Buffer.from(base64, 'base64')
}
