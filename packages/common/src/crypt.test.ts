import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decrypt, encrypt } from './crypt.js'

test('encrypt and decrypt', async (t) => {
  await t.test('should encrypt and decrypt text', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  await t.test('should produce different ciphertexts for same input', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted1 = encrypt(text, secret)
    const encrypted2 = encrypt(text, secret)

    assert.notStrictEqual(encrypted1, encrypted2)
  })

  await t.test('should fail with wrong secret', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'
    const wrongSecret = 'wrong-secret'

    const encrypted = encrypt(text, secret)

    assert.throws(() => {
      decrypt(encrypted, wrongSecret)
    })
  })

  await t.test('should handle empty string', () => {
    const text = ''
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  await t.test('should handle long text', () => {
    const text = 'a'.repeat(10000)
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  await t.test('should handle special characters', () => {
    const text = 'Hello 🌍!\n\t\r\0'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  await t.test('should fail with tampered ciphertext', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const tampered = encrypted.slice(0, -1) + (encrypted.at(-1) === 'a' ? 'b' : 'a')

    assert.throws(() => {
      decrypt(tampered, secret)
    })
  })
})
