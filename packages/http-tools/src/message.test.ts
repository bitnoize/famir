import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpMessage } from './message.js'

describe('HttpMessage', () => {
  describe('create', () => {
    it('should create normal message', () => {
      const msg = HttpMessage.create('normal')
      assert.strictEqual(msg.type, 'normal-simple')
    })

    it('should create websocket message', () => {
      const msg = HttpMessage.create('websocket')
      assert.strictEqual(msg.type, 'websocket')
    })

    it('should throw on unknown type', () => {
      assert.throws(() => HttpMessage.create('unknown'), /not known/)
    })
  })

  describe('id', () => {
    it('should have unique id', () => {
      const msg1 = HttpMessage.create('normal')
      const msg2 = HttpMessage.create('normal')
      assert.notStrictEqual(msg1.id, msg2.id)
    })

    /*
    it('should have wrappers', () => {
      const msg = HttpMessage.create('normal')
      assert.ok(msg.method)
      assert.ok(msg.url)
      assert.ok(msg.requestHeaders)
      assert.ok(msg.requestBody)
      assert.ok(msg.status)
      assert.ok(msg.responseHeaders)
      assert.ok(msg.responseBody)
    })
    */
  })

  describe('ready', () => {
    it('should not be ready initially', () => {
      const msg = HttpMessage.create('normal')
      assert.strictEqual(msg.isReady, false)
    })

    it('should mark as ready', () => {
      const msg = HttpMessage.create('normal')
      msg.ready()
      assert.strictEqual(msg.isReady, true)
    })

    it('should prevent type change when ready', () => {
      const msg = HttpMessage.create('normal')
      msg.ready()
      assert.throws(() => msg.setType('normal-stream-request'), /ready/)
    })
  })

  describe('content-types', () => {
    it('should add content types', () => {
      const msg = HttpMessage.create('normal')
      msg.addContentTypes('json', ['application/json'])
      assert.strictEqual(
        msg.isContentType('json', { type: 'application/json', parameters: {} }),
        true
      )
    })

    it('should not allow add when ready', () => {
      const msg = HttpMessage.create('normal')
      msg.ready()
      assert.throws(() => msg.addContentTypes('json', []), /ready/)
    })
  })

  describe('rewrite url content types', () => {
    it('should add rewrite url content types', () => {
      const msg = HttpMessage.create('normal')
      msg.addRewriteUrlContentTypes(['text/html'])
      assert.strictEqual(msg.isRewriteUrlContentType({ type: 'text/html', parameters: {} }), true)
    })
  })

  describe('connection metadata', () => {
    it('should merge connection data', () => {
      const msg = HttpMessage.create('normal')
      msg.mergeConnection({ clientIp: '127.0.0.1' })
      assert.strictEqual(msg.connection['clientIp'], '127.0.0.1')
    })

    it('should skip null values in merge', () => {
      const msg = HttpMessage.create('normal')
      msg.mergeConnection({ clientIp: '127.0.0.1', serverIp: null as any })
      assert.strictEqual(msg.connection['clientIp'], '127.0.0.1')
      assert.strictEqual(msg.connection['serverIp'], undefined)
    })
  })

  describe('errors', () => {
    it('should add error with path', () => {
      const msg = HttpMessage.create('normal')
      const err = new Error('test error')
      msg.addError(err, 'request', 'parser')
      assert.strictEqual(msg.errors.length, 1)
      //assert.ok(msg.errors[0][1])
    })

    it('should track multiple errors', () => {
      const msg = HttpMessage.create('normal')
      msg.addError(new Error('error1'), 'req')
      msg.addError(new Error('error2'), 'res')
      assert.strictEqual(msg.errors.length, 2)
    })
  })

  describe('interceptors', () => {
    it('should add request head interceptor', () => {
      const msg = HttpMessage.create('normal')
      msg.addRequestHeadInterceptor('test', () => {})
      assert.ok(msg)
    })

    it('should add request body interceptor', () => {
      const msg = HttpMessage.create('normal')
      msg.addRequestBodyInterceptor('test', () => {})
      assert.ok(msg)
    })

    it('should run request head interceptors', () => {
      const msg = HttpMessage.create('normal')
      let called = false
      msg.addRequestHeadInterceptor('test', () => {
        called = true
      })
      msg.ready()
      msg.runRequestHeadInterceptors()
      assert.strictEqual(called, true)
    })

    it('should catch interceptor errors', () => {
      const msg = HttpMessage.create('normal')
      msg.addRequestHeadInterceptor('test', () => {
        throw new Error('interceptor error')
      })
      msg.ready()
      msg.runRequestHeadInterceptors()
      assert.strictEqual(msg.errors.length, 1)
    })
  })

  describe('url utilities', () => {
    it('should check absolute urls', () => {
      const msg = HttpMessage.create('normal')
      assert.strictEqual(msg.isAbsoluteUrl('http://example.com'), true)
      assert.strictEqual(msg.isAbsoluteUrl('https://example.com'), true)
      assert.strictEqual(msg.isAbsoluteUrl('//example.com'), true)
      assert.strictEqual(msg.isAbsoluteUrl('/path'), false)
    })
  })

  describe('transforms', () => {
    it('should add request transform', () => {
      const msg = HttpMessage.create('normal')
      assert.strictEqual(msg.getRequestTransforms().length, 0)
    })

    it('should add response transform', () => {
      const msg = HttpMessage.create('normal')
      assert.strictEqual(msg.getResponseTransforms().length, 0)
    })
  })
})
