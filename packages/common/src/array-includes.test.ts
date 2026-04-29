import assert from 'node:assert/strict'
import { test } from 'node:test'
import { arrayIncludes } from './array-includes.js'

test('arrayIncludes', async (t) => {
  await t.test('should return true if array includes value', () => {
    const arr = [1, 2, 3] as const
    const value = 2

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  await t.test('should return false if array does not include value', () => {
    const arr = [1, 2, 3] as const
    const value = 5

    const result = arrayIncludes(arr, value)

    assert.ok(!result)
  })

  await t.test('should work with strings', () => {
    const arr = ['a', 'b', 'c'] as const
    const value = 'b'

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  await t.test('should work with objects', () => {
    const obj = { id: 1 }
    const arr = [obj] as const
    const value = obj

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  await t.test('should be type-safe', () => {
    const arr = [1, 2, 3] as const
    const value: unknown = 2

    if (arrayIncludes(arr, value)) {
      // value is now narrowed to 1 | 2 | 3
      assert.ok(typeof value === 'number')
    }
  })

  await t.test('should return false for empty array', () => {
    const arr: number[] = []
    const value = 1

    const result = arrayIncludes(arr, value)

    assert.ok(!result)
  })
})
