import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpMethodWrap } from './method.js'

describe('HttpMethodWrap', () => {
  describe('fromScratch', () => {
    it('should create wrapper from scratch', () => {
      const method = HttpMethodWrap.fromScratch()
      assert.strictEqual(method.get(), 'GET')
    })
  })

  describe('fromReq', () => {
    it('should create wrapper from request object', () => {
      const req = { method: 'PosT' }
      const method = HttpMethodWrap.fromReq(req)
      assert.strictEqual(method.get(), 'POST')
    })

    it('should throw if request method is not defined', () => {
      const req = { method: undefined }
      assert.throws(() => HttpMethodWrap.fromReq(req), /not defined/)
    })
  })

  describe('fromString', () => {
    it('should create wrapper from string', () => {
      const method = HttpMethodWrap.fromString('PuT')
      assert.strictEqual(method.get(), 'PUT')
    })

    it('should throw on unknown method', () => {
      assert.throws(() => HttpMethodWrap.fromString('INVALID'), /not known/)
    })
  })

  describe('clone', () => {
    it('should clone wrapper', () => {
      const original = new HttpMethodWrap('POST')
      const cloned = original.clone()
      assert.deepStrictEqual(cloned, original)
      assert.notStrictEqual(cloned, original)
    })

    it('should clone has independent state', () => {
      const original = new HttpMethodWrap('HEAD')
      const cloned = original.clone()
      assert.strictEqual(cloned.get(), 'HEAD')
      cloned.set('GET')
      assert.strictEqual(original.get(), 'HEAD')
      assert.strictEqual(cloned.get(), 'GET')
    })
  })

  describe('freeze', () => {
    it('should freeze and prevent modifications', () => {
      const method = HttpMethodWrap.fromScratch()
      method.freeze()
      assert.strictEqual(method.isFrozen, true)
      assert.throws(() => method.set('POST'), /frozen/)
    })

    it('should return this for chaining', () => {
      const method = HttpMethodWrap.fromScratch()
      const that = method.freeze()
      assert.strictEqual(that, method)
    })
  })

  describe('get/set', () => {
    it('should get method value', () => {
      const method = new HttpMethodWrap('PATCH')
      assert.strictEqual(method.get(), 'PATCH')
    })

    it('should set and get method value', () => {
      const method = HttpMethodWrap.fromScratch()
      method.set('DELETE')
      assert.strictEqual(method.get(), 'DELETE')
    })

    it('should return this for chaining', () => {
      const method = HttpMethodWrap.fromScratch()
      const that = method.set('OPTIONS')
      assert.strictEqual(that, method)
    })
  })

  describe('is check', () => {
    it('should check single method', () => {
      const method = new HttpMethodWrap('GET')
      assert.strictEqual(method.is('GET'), true)
      assert.strictEqual(method.is('POST'), false)
    })

    it('should check multiple methods', () => {
      const method = new HttpMethodWrap('HEAD')
      assert.strictEqual(method.is(['GET', 'HEAD']), true)
      assert.strictEqual(method.is(['PATCH', 'PUT']), false)
    })
  })
})
