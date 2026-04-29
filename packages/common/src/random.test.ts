import assert from 'node:assert/strict'
import { test } from 'node:test'
import { randomIdent, randomName } from './random.js'

test('randomIdent', async (t) => {
  await t.test('should generate a 32-character hex string', () => {
    const ident = randomIdent()

    assert.match(ident, /^[a-f0-9]{32}$/)
  })

  await t.test('should generate different identifiers', () => {
    const ident1 = randomIdent()
    const ident2 = randomIdent()

    assert.notEqual(ident1, ident2)
  })

  await t.test('should be unique over multiple calls', () => {
    const idents = new Set()

    for (let i = 0; i < 100; i++) {
      idents.add(randomIdent())
    }

    assert.equal(idents.size, 100)
  })
})

test('randomName', async (t) => {
  await t.test('should generate names match pattern', () => {
    const name = randomName()

    assert.match(name, /^[a-z]{2,8}$/)
  })

  await t.test('should generate different names', () => {
    const name1 = randomName()
    const name2 = randomName()

    assert.notEqual(name1, name2)
  })
})
