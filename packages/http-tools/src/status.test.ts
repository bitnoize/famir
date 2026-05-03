import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpStatusWrap } from './status.js'

describe('HttpStatusWrap', () => {
  describe('fromScratch', () => {
    it('should create wrapper from scratch', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.get(), 0)
    })
  })

  describe('clone', () => {
    it('should clone wrapper', () => {
      const original = new HttpStatusWrap(200)
      const cloned = original.clone()
      assert.deepStrictEqual(cloned, original)
      assert.notStrictEqual(cloned, original)
    })

    it('should clone has independent state', () => {
      const original = new HttpStatusWrap(400)
      const cloned = original.clone()
      assert.strictEqual(cloned.get(), 400)
      cloned.set(500)
      assert.strictEqual(original.get(), 400)
      assert.strictEqual(cloned.get(), 500)
    })
  })

  describe('freeze', () => {
    it('should freeze and prevent modifications', () => {
      const status = HttpStatusWrap.fromScratch()
      status.freeze()
      assert.strictEqual(status.isFrozen, true)
      assert.throws(() => status.set(200), /frozen/)
    })

    it('should return this for chaining', () => {
      const status = HttpStatusWrap.fromScratch()
      const that = status.freeze()
      assert.strictEqual(that, status)
    })
  })

  describe('get/set', () => {
    it('should get status value', () => {
      const status = new HttpStatusWrap(200)
      assert.strictEqual(status.get(), 200)
    })

    it('should set and get status value', () => {
      const status = HttpStatusWrap.fromScratch()
      status.set(500)
      assert.strictEqual(status.get(), 500)
    })

    it('should return this for chaining', () => {
      const status = HttpStatusWrap.fromScratch()
      const that = status.set(301)
      assert.strictEqual(that, status)
    })
  })

  describe('status checks', () => {
    it('should check information status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(100).isInformation(), true)
      assert.strictEqual(status.set(199).isInformation(), true)
      assert.strictEqual(status.set(200).isInformation(), false)
    })

    it('should check success status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(200).isSuccess(), true)
      assert.strictEqual(status.set(299).isSuccess(), true)
      assert.strictEqual(status.set(300).isSuccess(), false)
    })

    it('should check redirect status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(300).isRedirect(), true)
      assert.strictEqual(status.set(399).isRedirect(), true)
      assert.strictEqual(status.set(400).isRedirect(), false)
    })

    it('should check client error status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(400).isClientError(), true)
      assert.strictEqual(status.set(499).isClientError(), true)
      assert.strictEqual(status.set(500).isClientError(), false)
    })

    it('should check server error status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(500).isServerError(), true)
      assert.strictEqual(status.set(599).isServerError(), true)
      assert.strictEqual(status.set(600).isServerError(), false)
    })

    it('should check unknown status', () => {
      const status = HttpStatusWrap.fromScratch()
      assert.strictEqual(status.set(999).isUnknown(), true)
      assert.strictEqual(status.set(200).isUnknown(), false)
    })
  })

  describe('reset', () => {
    it('should reset to default value', () => {
      const status = new HttpStatusWrap(404)
      status.reset()
      assert.strictEqual(status.get(), 0)
    })

    it('should return this for chaining', () => {
      const status = HttpStatusWrap.fromScratch()
      const that = status.reset()
      assert.strictEqual(that, status)
    })
  })
})
