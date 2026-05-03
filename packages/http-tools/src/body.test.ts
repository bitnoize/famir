import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpBodyWrap } from './body.js'

describe('HttpBodyWrap', () => {
  describe('fromScratch', () => {
    it('should create wrapper with default value', () => {
      const body = HttpBodyWrap.fromScratch()
      assert.strictEqual(body.length, 0)
      assert.deepStrictEqual(body.get(), Buffer.alloc(0))
    })
  })

  describe('clone', () => {
    it('should clone wrapper', () => {
      const original = new HttpBodyWrap(Buffer.from('test'))
      const cloned = original.clone()
      assert.deepStrictEqual(cloned, original)
      assert.notStrictEqual(cloned, original)
    })

    it('should original and cloned buffers are identicals', () => {
      const original = new HttpBodyWrap(Buffer.from('hello'))
      const cloned = original.clone()
      assert.deepStrictEqual(cloned.get(), original.get())
      assert.notStrictEqual(cloned.get(), original.get())
    })

    it('should clone has independent state', () => {
      const original = new HttpBodyWrap(Buffer.from('test'))
      const cloned = original.clone()
      cloned.set(Buffer.from('hello'))
      assert.deepStrictEqual(original.get(), Buffer.from('test'))
      assert.deepStrictEqual(cloned.get(), Buffer.from('hello'))
    })
  })

  describe('freeze', () => {
    it('should freeze and prevent modifications', () => {
      const body = HttpBodyWrap.fromScratch()
      body.freeze()
      assert.strictEqual(body.isFrozen, true)
      assert.throws(() => body.set(Buffer.from('test')), /frozen/)
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.freeze()
      assert.strictEqual(that, body)
    })
  })

  describe('length', () => {
    it('should return buffer length', () => {
      const body = new HttpBodyWrap(Buffer.from('hello'))
      assert.strictEqual(body.length, 5)
      body.set(Buffer.from('hello world'))
      assert.strictEqual(body.length, 11)
    })
  })

  describe('get/set', () => {
    it('should get body data', () => {
      const body = new HttpBodyWrap(Buffer.from('test'))
      assert.deepStrictEqual(body.get(), Buffer.from('test'))
    })

    it('should set and get body data', () => {
      const body = HttpBodyWrap.fromScratch()
      body.set(Buffer.from('test'))
      assert.deepStrictEqual(body.get(), Buffer.from('test'))
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.set(Buffer.from('test'))
      assert.strictEqual(that, body)
    })
  })

  describe('base64', () => {
    it('should get base64 encoded', () => {
      const body = new HttpBodyWrap(Buffer.from('test'))
      assert.strictEqual(body.getBase64(), 'dGVzdA==')
    })

    it('should set and get base64 encoded', () => {
      const body = HttpBodyWrap.fromScratch()
      body.setBase64('dGVzdA==')
      assert.deepStrictEqual(body.get(), Buffer.from('test'))
    })

    it('should cache base64 result', () => {
      const body = new HttpBodyWrap(Buffer.from('test'))
      const base64_1 = body.getBase64()
      const base64_2 = body.getBase64()
      assert.strictEqual(base64_1, base64_2)
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.setBase64('dGVzdA==')
      assert.strictEqual(that, body)
    })
  })

  describe('text', () => {
    it('should get text encoded', () => {
      const body = new HttpBodyWrap(Buffer.from('hello'))
      assert.strictEqual(body.getText(), 'hello')
    })

    it('should set and get text encoded', () => {
      const body = HttpBodyWrap.fromScratch()
      body.setText('hello')
      assert.deepStrictEqual(body.get(), Buffer.from('hello'))
    })

    it('should cache text result', () => {
      const body = new HttpBodyWrap(Buffer.from('test'))
      const text1 = body.getText()
      const text2 = body.getText()
      assert.strictEqual(text1, text2)
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.setText('test')
      assert.strictEqual(that, body)
    })
  })

  describe('json', () => {
    it('should get parsed json body', () => {
      const body = new HttpBodyWrap(Buffer.from('{"key":"value"}'))
      const json = body.getJson()
      assert.deepStrictEqual(json, { key: 'value' })
    })

    it('should set and get json body', () => {
      const body = HttpBodyWrap.fromScratch()
      const obj = { name: 'test', count: 42 }
      body.setJson(obj)
      assert.deepStrictEqual(body.getJson(), obj)
    })

    it('should throw on invalid json', () => {
      const body = new HttpBodyWrap(Buffer.from('invalid json'))
      assert.throws(() => body.getJson(), /SyntaxError/)
    })

    it('should cache json result', () => {
      const body = new HttpBodyWrap(Buffer.from('{"a":1}'))
      const json1 = body.getJson()
      const json2 = body.getJson()
      assert.strictEqual(json1, json2)
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.setJson({ a: 1 })
      assert.strictEqual(that, body)
    })
  })

  describe('query-string', () => {
    it('should get query-string body', () => {
      const body = new HttpBodyWrap(Buffer.from('key=value&name=test'))
      const queryString = body.getQueryString()
      assert.deepStrictEqual(queryString, { key: 'value', name: 'test' })
    })

    it('should get and set query-string body', () => {
      const body = HttpBodyWrap.fromScratch()
      const queryString = { name: 'test', count: 42 }
      body.setQueryString(queryString)
      assert.deepStrictEqual(body.getQueryString(), queryString)
    })

    it('should cache query string result', () => {
      const body = new HttpBodyWrap(Buffer.from('a=1&b=2'))
      const queryString_1 = body.getQueryString()
      const queryString_2 = body.getQueryString()
      assert.strictEqual(queryString_1, queryString_2)
    })
  })

  describe('reset', () => {
    it('should reset to default body', () => {
      const body = new HttpBodyWrap(Buffer.from('test'))
      assert.strictEqual(body.length, 4)
      body.reset()
      assert.strictEqual(body.length, 0)
    })

    it('should return this for chaining', () => {
      const body = HttpBodyWrap.fromScratch()
      const that = body.reset()
      assert.strictEqual(that, body)
    })
  })
})
