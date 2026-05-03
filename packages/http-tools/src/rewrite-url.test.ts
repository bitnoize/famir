import assert from 'node:assert'
import { describe, it } from 'node:test'
import { rewriteUrl, RewriteUrlScheme, RewriteUrlTarget } from './rewrite-url.js'

describe('rewriteUrl', () => {
  describe('basic rewriting (forward)', () => {
    it('should rewrite with protocol and separator', () => {
      const text = 'Check http://donor.com/path and https://donor.com/secure'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('https://mirror.com/path'), true)
    })

    it.skip('should rewrite without protocol', () => {
      const text = 'Urls: //donor.com/path and //donor.com/other'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', false]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('//mirror.com/path'), true)
    })

    it('should preserve URLs not matching target', () => {
      const text = 'http://other.com/path and http://donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://other.com/path'), true)
      assert.strictEqual(result.includes('http://mirror.com/path'), true)
    })
  })

  describe('reverse rewriting', () => {
    it('should reverse rewrite mirror to donor', () => {
      const text = 'Response from https://mirror.com/api'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, true, [target], schemes)
      assert.strictEqual(result.includes('http://donor.com/api'), true)
    })

    it('should reverse with protocol changes', () => {
      const text = 'Content has https://mirror.example.org/resource'
      const target: RewriteUrlTarget = {
        donorSecure: true,
        donorHost: 'original.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.example.org',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, true, [target], schemes)
      assert.strictEqual(result.includes('https://original.com/resource'), true)
    })
  })

  describe('multiple schemes', () => {
    it('should rewrite with multiple separators', () => {
      const text = 'http://donor.com and //donor.com and data:url'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [
        ['://', true],
        ['//', false],
      ]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://mirror.com'), true)
      assert.strictEqual(result.includes('//mirror.com'), true)
    })

    it('should handle encoded separators', () => {
      const text = 'Data: %3A%2F%2Fdonor.com and %2F%2Fdonor.com'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [
        ['%3A%2F%2F', true],
        ['%2F%2F', false],
      ]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('%3A%2F%2Fmirror.com'), true)
      assert.strictEqual(result.includes('%2F%2Fmirror.com'), true)
    })

    it.skip('should handle unicode escaped separators', () => {
      const text = 'Escaped: \\u003A\\u002F\\u002Fdonor.com'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['\\u003A\\u002F\\u002F', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('\\u003A\\u002F\\u002Fmirror.com'), true)
    })
  })

  describe('multiple targets', () => {
    it('should rewrite multiple targets sequentially', () => {
      const text = 'http://donor1.com/path1 and http://donor2.com/path2'
      const targets: RewriteUrlTarget[] = [
        {
          donorSecure: false,
          donorHost: 'donor1.com',
          mirrorSecure: false,
          mirrorHost: 'mirror1.com',
        },
        {
          donorSecure: false,
          donorHost: 'donor2.com',
          mirrorSecure: false,
          mirrorHost: 'mirror2.com',
        },
      ]
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, targets, schemes)
      assert.strictEqual(result.includes('http://mirror1.com/path1'), true)
      assert.strictEqual(result.includes('http://mirror2.com/path2'), true)
    })

    it('should handle overlapping targets independently', () => {
      const text = 'http://sub.donor.com/api'
      const targets: RewriteUrlTarget[] = [
        {
          donorSecure: false,
          donorHost: 'donor.com',
          mirrorSecure: false,
          mirrorHost: 'mirror.com',
        },
        {
          donorSecure: false,
          donorHost: 'sub.donor.com',
          mirrorSecure: false,
          mirrorHost: 'sub.mirror.com',
        },
      ]
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, targets, schemes)
      // Most specific should be rewritten
      assert.strictEqual(result.includes('mirror'), true)
    })
  })

  describe('protocol switching', () => {
    it('should switch from http to https', () => {
      const text = 'http://donor.com/secure'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('https://mirror.com/secure'), true)
      //assert.strictEqual(result.includes('http'), false)
    })

    it('should switch from https to http', () => {
      const text = 'https://donor.com/public'
      const target: RewriteUrlTarget = {
        donorSecure: true,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://mirror.com/public'), true)
    })

    it('should maintain same protocol when both secure', () => {
      const text = 'https://donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: true,
        donorHost: 'donor.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('https://mirror.com/path'), true)
    })

    it('should maintain same protocol when both insecure', () => {
      const text = 'http://donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://mirror.com/path'), true)
    })
  })

  describe('edge cases', () => {
    it('should handle empty text', () => {
      const result = rewriteUrl('', false, [], [])
      assert.strictEqual(result, '')
    })

    it('should handle empty targets', () => {
      const text = 'http://donor.com/path'
      const result = rewriteUrl(text, false, [], [['://', true]])
      assert.strictEqual(result, text)
    })

    it('should handle empty schemes', () => {
      const text = 'http://donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const result = rewriteUrl(text, false, [target], [])
      assert.strictEqual(result, text)
    })

    it('should handle subdomains', () => {
      const text = 'https://api.donor.com/v1 and https://donor.com'
      const target: RewriteUrlTarget = {
        donorSecure: true,
        donorHost: 'donor.com',
        mirrorSecure: true,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      // Only exact host match should be rewritten
      assert.strictEqual(result.includes('api.donor.com'), true)
      assert.strictEqual(result.includes('https://mirror.com'), true)
    })

    it('should handle ports in URLs', () => {
      const text = 'http://donor.com:8080/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      // Port is not in the host, so replacement happens
      assert.strictEqual(result.includes('http://mirror.com:8080'), true)
    })

    it('should handle case-sensitive matching', () => {
      const text = 'http://Donor.com and http://donor.com'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      // Only exact case match
      assert.strictEqual(result.includes('Donor.com'), true)
      assert.strictEqual(result.includes('http://mirror.com'), true)
    })

    it('should handle multiple occurrences of same URL', () => {
      const text = 'Link1: http://donor.com/a, Link2: http://donor.com/b, Link3: http://donor.com/c'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      const count = (result.match(/mirror\.com/g) || []).length
      assert.strictEqual(count, 3)
    })

    it('should preserve query strings and fragments', () => {
      const text = 'http://donor.com/path?key=value#section'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://mirror.com/path?key=value#section'), true)
    })
  })

  describe('protocol flag in schemes', () => {
    it('should include protocol when withProto is true', () => {
      const text = 'http://donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', true]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('http://mirror.com'), true)
    })

    it.skip('should exclude protocol when withProto is false', () => {
      const text = '//donor.com/path'
      const target: RewriteUrlTarget = {
        donorSecure: false,
        donorHost: 'donor.com',
        mirrorSecure: false,
        mirrorHost: 'mirror.com',
      }
      const schemes: RewriteUrlScheme[] = [['://', false]]

      const result = rewriteUrl(text, false, [target], schemes)
      assert.strictEqual(result.includes('//mirror.com'), true)
      assert.strictEqual(result.includes('http://'), false)
    })
  })
})
