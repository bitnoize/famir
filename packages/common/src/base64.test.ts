import assert from 'node:assert/strict'
import { test } from 'node:test'
import { safeBase64Decode, safeBase64Encode } from './base64.js'

test('safeBase64Encode and safeBase64Decode', async (t) => {
  await t.test('should encode and decode strings', () => {
    const original = Buffer.from('Hello, World!')
    const encoded = safeBase64Encode(original)
    const decoded = safeBase64Decode(encoded)

    assert.deepStrictEqual(decoded, original)
  })

  await t.test('should use URL-safe alphabet', () => {
    const data = Buffer.from('??\n??\n??\n')
    const encoded = safeBase64Encode(data)

    assert.doesNotMatch(encoded, /[+/=]/)
  })

  await t.test('should handle empty buffer', () => {
    const original = Buffer.from('')
    const encoded = safeBase64Encode(original)
    const decoded = safeBase64Decode(encoded)

    assert.deepStrictEqual(decoded, original)
  })

  await t.test('should handle large data', () => {
    const original = Buffer.alloc(10000, 'test')
    const encoded = safeBase64Encode(original)
    const decoded = safeBase64Decode(encoded)

    assert.deepStrictEqual(decoded, original)
  })

  await t.test('should not have padding', () => {
    const encoded = safeBase64Encode(Buffer.from('a'))
    assert.doesNotMatch(encoded, /=/)
  })

  await t.test('should handle buffer with special bytes', () => {
    const original = Buffer.from([0, 1, 2, 3, 255, 254, 253])
    const encoded = safeBase64Encode(original)
    const decoded = safeBase64Decode(encoded)

    assert.deepStrictEqual(decoded, original)
  })
})
