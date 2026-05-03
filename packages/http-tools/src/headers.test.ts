import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpHeadersWrap } from './headers.js'

describe('HttpHeadersWrap', () => {
  describe('fromScratch', () => {
    it('should create wrapper from scratch', () => {
      const headers = HttpHeadersWrap.fromScratch()
      assert.strictEqual(headers.length, 0)
      assert.deepStrictEqual(headers.toObject(), {})
    })
  })

  describe('fromReq', () => {
    it('should create wrapper from request object', () => {
      const req = { headers: { HOST: 'example.com' } }
      const headers = HttpHeadersWrap.fromReq(req)
      assert.strictEqual(headers.get('host'), 'example.com')
      assert.strictEqual(headers.get('Host'), 'example.com')
    })
  })

  describe('clone', () => {
    it('should clone wrapper', () => {
      const original = new HttpHeadersWrap({ 'X-Test': 'value' })
      const cloned = original.clone()
      assert.deepStrictEqual(cloned, original)
      assert.notStrictEqual(cloned, original)
    })

    it('should original and cloned objects are identicals', () => {
      const original = new HttpHeadersWrap({ 'X-Test': 'value' })
      const cloned = original.clone()
      assert.deepStrictEqual(cloned.toObject(), original.toObject())
      assert.notStrictEqual(cloned.toObject(), original.toObject())
    })

    it('should clone has independent state', () => {
      const original = new HttpHeadersWrap({ 'X-TEST': 'value' })
      const cloned = original.clone()
      assert.strictEqual(original.getString('X-Test'), 'value')
      cloned.set('X-Test', 'new-value')
      assert.strictEqual(original.getString('X-Test'), 'value')
      assert.strictEqual(cloned.getString('X-Test'), 'new-value')
    })
  })

  describe('freeze', () => {
    it('should freeze and prevent modifications', () => {
      const headers = HttpHeadersWrap.fromScratch()
      headers.freeze()
      assert.strictEqual(headers.isFrozen, true)
      assert.throws(() => headers.set('X-Test', 'value'), /frozen/)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.freeze()
      assert.strictEqual(that, headers)
    })
  })

  describe('length', () => {
    it('should return headers length', () => {
      const headers = new HttpHeadersWrap({ 'X-One': 'value1' })
      assert.strictEqual(headers.length, 1)
      headers.set('X-Two', 'value2')
      assert.strictEqual(headers.length, 2)
      headers.set('X-Three', 'value3')
      headers.set('X-Four', 'value4')
      headers.set('X-Five', 'value5')
      assert.strictEqual(headers.length, 5)
    })
  })

  describe('get/set', () => {
    it('should get header value', () => {
      const headers = new HttpHeadersWrap({ 'X-TEST': 'value' })
      assert.strictEqual(headers.get('x-test'), 'value')
      assert.strictEqual(headers.get('X-Test'), 'value')
    })

    it('should set and get header value', () => {
      const headers = HttpHeadersWrap.fromScratch()
      headers.set('X-Test', 'value')
      assert.strictEqual(headers.get('x-test'), 'value')
      assert.strictEqual(headers.get('X-Test'), 'value')
    })

    it('should get string value', () => {
      const headers = new HttpHeadersWrap({ 'ConTenT-TypE': 'text/html' })
      assert.strictEqual(headers.getString('content-type'), 'text/html')
      assert.strictEqual(headers.getString('Content-Type'), 'text/html')
    })

    it('should get first string of array values', () => {
      const headers = new HttpHeadersWrap({ AccepT: ['text/html', 'text/css'] })
      assert.strictEqual(headers.getString('accept'), 'text/html')
      assert.strictEqual(headers.getString('Accept'), 'text/html')
    })

    it('should get header array of values', () => {
      const headers = new HttpHeadersWrap({ AccepT: ['text/html', 'text/plain'] })
      assert.deepStrictEqual(headers.getArray('accept'), ['text/html', 'text/plain'])
      assert.deepStrictEqual(headers.getArray('Accept'), ['text/html', 'text/plain'])
    })

    it('should get undefined on non-existent header', () => {
      const headers = HttpHeadersWrap.fromScratch()
      assert.strictEqual(headers.get('X-Missing'), undefined)
      assert.strictEqual(headers.getString('X-Missing'), undefined)
      assert.strictEqual(headers.getArray('X-Missing'), undefined)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.set('X-Test', 'value')
      assert.strictEqual(that, headers)
    })
  })

  describe('add value', () => {
    it('should add value to non-existing header', () => {
      const headers = HttpHeadersWrap.fromScratch()
      headers.add('X-Test', 'value')
      assert.deepStrictEqual(headers.get('X-Test'), 'value')
    })

    it('should add value to existing header string', () => {
      const headers = new HttpHeadersWrap({ 'X-TEST': 'value1' })
      headers.add('X-Test', 'value2')
      assert.deepStrictEqual(headers.getArray('X-Test'), ['value1', 'value2'])
    })

    it('should add value to existing header array', () => {
      const headers = new HttpHeadersWrap({ 'X-TEST': ['value1'] })
      headers.add('X-Test', 'value2')
      assert.deepStrictEqual(headers.getArray('X-Test'), ['value1', 'value2'])
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.add('X-Test', 'value')
      assert.strictEqual(that, headers)
    })
  })

  describe('has', () => {
    it('should check if header exists', () => {
      const headers = new HttpHeadersWrap({ 'X-TEST': 'value' })
      assert.strictEqual(headers.has('x-test'), true)
      assert.strictEqual(headers.has('X-Test'), true)
      assert.strictEqual(headers.has('X-Missing'), false)
    })
  })

  describe('delete', () => {
    it('should delete single header', () => {
      const headers = new HttpHeadersWrap({ 'X-TEST': 'value' })
      headers.delete('X-Test')
      assert.strictEqual(headers.get('X-Test'), undefined)
      assert.strictEqual(headers.has('X-Test'), false)
    })

    it('should delete multiple headers', () => {
      const headers = new HttpHeadersWrap({ 'X-ONE': 'value1', 'X-TWO': 'value2' })
      headers.delete(['X-One', 'X-Two'])
      assert.strictEqual(headers.get('X-One'), undefined)
      assert.strictEqual(headers.has('X-One'), false)
      assert.strictEqual(headers.get('X-Two'), undefined)
      assert.strictEqual(headers.has('X-Two'), false)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.delete('X-Test')
      assert.strictEqual(that, headers)
    })
  })

  describe('merge', () => {
    it('should merge headers', () => {
      const headers = HttpHeadersWrap.fromScratch()
      headers.merge({ 'X-One': 'value1', 'X-Two': 'value2' })
      assert.strictEqual(headers.get('X-One'), 'value1')
      assert.strictEqual(headers.get('X-Two'), 'value2')
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.merge({})
      assert.strictEqual(that, headers)
    })
  })

  describe('content-type', () => {
    it('should get null if content-type header not exists', () => {
      const headers = HttpHeadersWrap.fromScratch()
      assert.deepStrictEqual(headers.getContentType(), null)
    })

    it('should get parsed content-type', () => {
      const headers = new HttpHeadersWrap({ 'CONTENT-TYPE': 'text/plain; charset=utf-8' })
      const contentType = { type: 'text/plain', parameters: { charset: 'utf-8' } }
      assert.deepEqual(headers.getContentType(), contentType)
    })

    it('should set content-type from object', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const contentType = { type: 'text/html', parameters: { charset: 'utf-8' } }
      headers.setContentType(contentType)
      assert.strictEqual(headers.get('Content-Type'), 'text/html; charset=utf-8')
    })

    it('should set and get content-type object', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const contentType = { type: 'text/plain', parameters: { charset: 'utf-8' } }
      headers.setContentType(contentType)
      assert.deepEqual(headers.getContentType(), contentType)
    })

    it('should cache content-type object', () => {
      const headers = new HttpHeadersWrap({ 'CONTENT-TYPE': 'text/html' })
      const contentType_1 = headers.getContentType()
      const contentType_2 = headers.getContentType()
      assert.strictEqual(contentType_1, contentType_2)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.setContentType({ type: 'text/plain', parameters: {} })
      assert.strictEqual(that, headers)
    })
  })

  describe('cookie', () => {
    it('should get null if cookies not exists', () => {
      const headers = HttpHeadersWrap.fromScratch()
      assert.deepStrictEqual(headers.getCookies(), null)
    })

    it('should get parsed cookies', () => {
      const headers = new HttpHeadersWrap({
        COOKIE: 'session=abc123; user=john',
      })
      const cookies = { session: 'abc123', user: 'john' }
      assert.deepStrictEqual(headers.getCookies(), cookies)
    })

    it('should set and get cookies object', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const cookies = { session: 'xyz789', user: 'jane' }
      headers.setCookies(cookies)
      assert.deepStrictEqual(headers.getCookies(), cookies)
    })

    it('should cache cookie object', () => {
      const headers = new HttpHeadersWrap({ COOKIE: ['key=value'] })
      const cookies_1 = headers.getCookies()
      const cookies_2 = headers.getCookies()
      assert.strictEqual(cookies_1, cookies_2)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.setCookies({})
      assert.strictEqual(that, headers)
    })
  })

  describe('set-cookie', () => {
    it('should get null if set-cookies not exists', () => {
      const headers = HttpHeadersWrap.fromScratch()
      assert.deepStrictEqual(headers.getSetCookies(), null)
    })

    it('should get parsed set-cookies', () => {
      const headers = new HttpHeadersWrap({
        'SET-COOKIE': ['session=abc123; Path=/'],
      })
      const setCookies = {
        session: {
          value: 'abc123',
          path: '/',
          secure: false,
          httpOnly: false,
        },
      }
      assert.deepStrictEqual(headers.getSetCookies(), setCookies)
    })

    it('should set and get set-cookies object', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const setCookies = {
        session: {
          value: 'xyz789',
          path: '/',
          //secure: false,
          //httpOnly: false,
        },
      }
      headers.setSetCookies(setCookies)
      assert.deepStrictEqual(headers.getSetCookies(), setCookies)
    })

    it('should cache set-cookie object', () => {
      const headers = new HttpHeadersWrap({
        'SET-COOKIE': ['key=value'],
      })
      const setCookies_1 = headers.getSetCookies()
      const setCookies_2 = headers.getSetCookies()
      assert.strictEqual(setCookies_1, setCookies_2)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.setSetCookies({})
      assert.strictEqual(that, headers)
    })
  })

  describe('object conversion', () => {
    it('should convert to object', () => {
      const headers = new HttpHeadersWrap({ 'X-ONE': 'value1', 'X-TWO': 'value2' })
      assert.deepStrictEqual(headers.toObject(), { 'x-one': 'value1', 'x-two': 'value2' })
    })

    it('should get entries', () => {
      const headers = new HttpHeadersWrap({ 'X-ONE': 'value1', 'X-TWO': 'value2' })
      const accum: Record<string, unknown> = {}
      headers.entries().forEach(([name, value]) => {
        accum[name] = value
      })
      assert.deepStrictEqual(accum, { 'x-one': 'value1', 'x-two': 'value2' })
    })

    it('should iterate with forEach', () => {
      const headers = new HttpHeadersWrap({ 'X-ONE': 'value1', 'X-TWO': 'value2' })
      const accum: Record<string, unknown> = {}
      headers.forEach((name, value) => {
        accum[name] = value
      })
      assert.deepStrictEqual(accum, { 'x-one': 'value1', 'x-two': 'value2' })
    })
  })

  describe('reset', () => {
    it('should reset to default headers', () => {
      const headers = new HttpHeadersWrap({ 'X-Test': 'value' })
      assert.strictEqual(headers.length, 1)
      headers.reset()
      assert.strictEqual(headers.length, 0)
    })

    it('should return this for chaining', () => {
      const headers = HttpHeadersWrap.fromScratch()
      const that = headers.reset()
      assert.strictEqual(that, headers)
    })
  })
})
