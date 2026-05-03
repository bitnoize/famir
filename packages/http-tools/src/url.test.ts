import assert from 'node:assert'
import { describe, it } from 'node:test'
import { HttpUrlWrap } from './url.js'

describe('HttpUrlWrap', () => {
  describe('fromScratch', () => {
    it('should create wrapper from scratch', () => {
      const url = HttpUrlWrap.fromScratch()
      assert.strictEqual(url.toRelative(), '/')
    })
  })

  describe('fromReq', () => {
    it('should create wrapper from request object', () => {
      const req = { url: '/path?key=value#section' }
      const url = HttpUrlWrap.fromReq(req)
      assert.strictEqual(url.toRelative(), '/path?key=value#section')
    })

    it('should throw if request url is not defined', () => {
      const req = { url: undefined }
      assert.throws(() => HttpUrlWrap.fromReq(req), /not defined/)
    })
  })

  describe('fromRelative', () => {
    it('should create wrapper from relative url', () => {
      const url = HttpUrlWrap.fromRelative('/path?key=value#section')
      assert.strictEqual(url.toRelative(), '/path?key=value#section')
    })

    it.skip('should throw if relative url is not valid', () => {
      assert.throws(() => HttpUrlWrap.fromRelative('*'), /parse error/)
    })
  })

  describe('fromAbsolute', () => {
    it('should create wrapper from absolute url', () => {
      const url = HttpUrlWrap.fromAbsolute('https://example.com:8443/path?key=value#section')
      assert.strictEqual(url.toAbsolute(), 'https://example.com:8443/path?key=value#section')
    })

    it('should throw if absolute url is not valid', () => {
      assert.throws(() => HttpUrlWrap.fromAbsolute('INVALID'), /parse error/)
    })
  })

  describe('clone', () => {
    it('should clone wrapper', () => {
      const original = HttpUrlWrap.fromRelative('/path')
      const cloned = original.clone()
      assert.deepStrictEqual(cloned, original)
      assert.notStrictEqual(cloned, original)
    })

    it('should original and cloned objects are identicals', () => {
      const original = HttpUrlWrap.fromRelative('/path')
      const cloned = original.clone()
      assert.deepStrictEqual(cloned.toObject(), original.toObject())
      assert.notStrictEqual(cloned.toObject(), original.toObject())
    })

    it('should clone has independent state', () => {
      const original = HttpUrlWrap.fromRelative('/path')
      const cloned = original.clone()
      assert.strictEqual(cloned.toRelative(), '/path')
      cloned.set('pathname', '/other')
      assert.strictEqual(original.toRelative(), '/path')
      assert.strictEqual(cloned.toRelative(), '/other')
    })
  })

  describe('freeze', () => {
    it('should freeze and prevent modifications', () => {
      const url = HttpUrlWrap.fromScratch()
      url.freeze()
      assert.strictEqual(url.isFrozen, true)
      assert.throws(() => url.set('pathname', '/new'), /frozen/)
    })

    it('should return this for chaining', () => {
      const url = HttpUrlWrap.fromScratch()
      const that = url.freeze()
      assert.strictEqual(that, url)
    })
  })

  describe('get/set', () => {
    it('should get url parts', () => {
      const url = HttpUrlWrap.fromRelative('/path?key=value#section')
      assert.strictEqual(url.get('pathname'), '/path')
      assert.strictEqual(url.get('search'), '?key=value')
      assert.strictEqual(url.get('hash'), '#section')
    })

    it('should set and get url parts', () => {
      const url = HttpUrlWrap.fromScratch()
      url.set('protocol', 'https:')
      url.set('hostname', 'example.com')
      url.set('port', '8443')
      url.set('pathname', '/path')
      url.set('search', '?key=value')
      url.set('hash', '#section')
      assert.strictEqual(url.get('protocol'), 'https:')
      assert.strictEqual(url.get('hostname'), 'example.com')
      assert.strictEqual(url.get('port'), '8443')
      assert.strictEqual(url.get('pathname'), '/path')
      assert.strictEqual(url.get('search'), '?key=value')
      assert.strictEqual(url.get('hash'), '#section')
    })

    it('should return this for chaining', () => {
      const url = HttpUrlWrap.fromScratch()
      const that = url.set('pathname', '/path')
      assert.strictEqual(that, url)
    })
  })

  describe('merge', () => {
    it('should merge partial url', () => {
      const url = HttpUrlWrap.fromRelative('/path')
      url.merge({ search: '?key=value', hash: '#section' })
      assert.strictEqual(url.toRelative(), '/path?key=value#section')
    })

    it('should return this for chaining', () => {
      const url = HttpUrlWrap.fromScratch()
      const that = url.merge({})
      assert.strictEqual(that, url)
    })
  })

  describe('host', () => {
    it('should return hostname for default ports', () => {
      const url = HttpUrlWrap.fromAbsolute('http://example.com:80/path')
      assert.strictEqual(url.getHost(), 'example.com')
    })

    it('should return hostname:port for custom ports', () => {
      const url = HttpUrlWrap.fromAbsolute('http://example.com:8080/path')
      assert.strictEqual(url.getHost(), 'example.com:8080')
    })
  })

  describe('query-string', () => {
    it('should get parsed query-string', () => {
      const url = HttpUrlWrap.fromRelative('/path?a=1&b=2&c=3')
      const queryString = { a: '1', b: '2', c: '3' }
      assert.deepStrictEqual(url.getQueryString(), queryString)
    })

    it('should set query-string from object', () => {
      const url = HttpUrlWrap.fromScratch()
      const queryString = { x: '7', y: '8', z: '9' }
      url.setQueryString(queryString)
      assert.deepStrictEqual(url.get('search'), '?x=7&y=8&z=9')
    })

    it('should set and get query-string object', () => {
      const url = HttpUrlWrap.fromScratch()
      const queryString = { f: '5', g: '6', h: '7' }
      url.setQueryString(queryString)
      assert.deepStrictEqual(url.getQueryString(), queryString)
    })

    it('should cache query-string object', () => {
      const url = HttpUrlWrap.fromRelative('/path?one=1&two=2&tree=3')
      const queryString_1 = url.getQueryString()
      const queryString_2 = url.getQueryString()
      assert.strictEqual(queryString_1, queryString_2)
    })

    it('should return this for chaining', () => {
      const url = HttpUrlWrap.fromScratch()
      const that = url.setQueryString({})
      assert.strictEqual(that, url)
    })
  })

  describe('path matching', () => {
    it('should match string path', () => {
      const url = HttpUrlWrap.fromRelative('/api/users')
      assert.strictEqual(url.isPath('/api/users'), true)
      assert.strictEqual(url.isPath('/other'), false)
    })

    it('should match regex path', () => {
      const url = HttpUrlWrap.fromRelative('/api/users/123')
      assert.strictEqual(url.isPath(/^\/api\/users\/\d+$/), true)
      assert.strictEqual(url.isPath(/^\/other/), false)
    })
  })

  describe('url formatting', () => {
    it('should format relative url', () => {
      const url = HttpUrlWrap.fromRelative('/path?key=value#section')
      assert.strictEqual(url.toRelative(), '/path?key=value#section')
    })

    it('should format absolute url', () => {
      const url = HttpUrlWrap.fromAbsolute('https://example.com:8443/path?key=value#section')
      assert.strictEqual(url.toAbsolute(), 'https://example.com:8443/path?key=value#section')
    })

    it('should format as object', () => {
      const url = HttpUrlWrap.fromAbsolute('http://example.com:8080/path?key=value#section')
      assert.deepStrictEqual(url.toObject(), {
        protocol: 'http:',
        hostname: 'example.com',
        port: '8080',
        pathname: '/path',
        search: '?key=value',
        hash: '#section',
      })
    })
  })

  describe('reset', () => {
    it('should reset to default value', () => {
      const url = HttpUrlWrap.fromRelative('/other')
      url.reset()
      assert.strictEqual(url.toRelative(), '/')
    })

    it('should return this for chaining', () => {
      const url = HttpUrlWrap.fromScratch()
      const that = url.reset()
      assert.strictEqual(that, url)
    })
  })
})
