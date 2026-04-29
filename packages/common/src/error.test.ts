import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CommonError } from './error.js'

class TestError extends CommonError {}

test('CommonError', async (t) => {
  await t.test('should create error with message', () => {
    const message = 'Test error'
    const error = new TestError(message, {})

    assert.equal(error.message, message)
  })

  await t.test('should set context', () => {
    const context = { userId: 123, action: 'test' }
    const error = new TestError('Test error', { context })

    assert.deepEqual(error.context, context)
  })

  await t.test('should support cause option', () => {
    const cause = new Error('Root cause')
    const error = new TestError('Test error', { cause })

    assert.strictEqual(error.cause, cause)
  })

  await t.test('should be an instance of Error', () => {
    const error = new TestError('Test error', {})

    assert.ok(error instanceof Error)
    assert.ok(error instanceof TestError)
  })

  await t.test('should have undefined stack', () => {
    const error = new TestError('Test error', {})

    assert.equal(error.stack, undefined)
  })
})
