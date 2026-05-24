import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { decrypt, encrypt } from './crypt.js'

describe('encrypt and decrypt', () => {
  it('should encrypt and decrypt text', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  it('should produce different ciphertexts for same input', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted1 = encrypt(text, secret)
    const encrypted2 = encrypt(text, secret)

    assert.notStrictEqual(encrypted1, encrypted2)
  })

  it('should fail with wrong secret', () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'
    const wrongSecret = 'wrong-secret'

    const encrypted = encrypt(text, secret)

    assert.throws(() => {
      decrypt(encrypted, wrongSecret)
    })
  })

  it('should handle long text', () => {
    const text = 'a'.repeat(10000)
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  it('should handle special characters', () => {
    const text = 'Hello 🌍!\n\t\r\0'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const decrypted = decrypt(encrypted, secret)

    assert.strictEqual(decrypted, text)
  })

  it('should fail with tampered ciphertext', { skip: true }, () => {
    const text = 'Hello, World!'
    const secret = 'my-secret-key'

    const encrypted = encrypt(text, secret)
    const tampered = encrypted.slice(0, -1) + (encrypted.at(-1) === 'a' ? 'b' : 'a')

    assert.throws(() => {
      decrypt(tampered, secret)
    })
  })
})
