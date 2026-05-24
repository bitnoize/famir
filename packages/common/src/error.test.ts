import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CommonError } from './error.js'

class TestError extends CommonError {}

describe('CommonError', () => {
  it('should create error with message', () => {
    const message = 'Test error'
    const error = new TestError(message, {})

    assert.equal(error.message, message)
  })

  it('should set context', () => {
    const context = { userId: 123, action: 'test' }
    const error = new TestError('Test error', { context })

    assert.deepEqual(error.context, context)
  })

  it('should support cause option', () => {
    const cause = new Error('Root cause')
    const error = new TestError('Test error', { cause })

    assert.strictEqual(error.cause, cause)
  })

  it('should be an instance of Error', () => {
    const error = new TestError('Test error', {})

    assert.ok(error instanceof Error)
    assert.ok(error instanceof TestError)
  })
})
