import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { arrayIncludes } from './array-includes.js'

describe('arrayIncludes', () => {
  it('should return true if array includes value', () => {
    const arr = [1, 2, 3] as const
    const value = 2

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  it('should return false if array does not include value', () => {
    const arr = [1, 2, 3] as const
    const value = 5

    const result = arrayIncludes(arr, value)

    assert.ok(!result)
  })

  it('should work with strings', () => {
    const arr = ['a', 'b', 'c'] as const
    const value = 'b'

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  it('should work with objects', () => {
    const obj = { id: 1 }
    const arr = [obj] as const
    const value = obj

    const result = arrayIncludes(arr, value)

    assert.ok(result)
  })

  it('should be type-safe', () => {
    const arr = [1, 2, 3] as const
    const value: unknown = 2

    if (arrayIncludes(arr, value)) {
      // value is now narrowed to 1 | 2 | 3
      assert.ok(typeof value === 'number')
    }
  })

  it('should return false for empty array', () => {
    const arr: number[] = []
    const value = 1

    const result = arrayIncludes(arr, value)

    assert.ok(!result)
  })
})
