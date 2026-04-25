/**
 * Safe Base64 encode
 * @category none
 */
export const safeBase64Encode = (base64: string): string => {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Safe Base64 decode
 * @category none
 */
export const safeBase64Decode = (value: string): string => {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/')

  while (base64.length % 4) {
    base64 += '='
  }

  return base64
}
