import assert from 'node:assert'
import { describe, it } from 'node:test'
import { formatCookies, formatSetCookies, parseCookies, parseSetCookies } from './cookies.js'

describe('parseCookies', () => {
  describe('basic parsing', () => {
    it('should parse single cookie', () => {
      const parsed = parseCookies(['session=abc123'])
      assert.strictEqual(parsed['session'], 'abc123')
    })

    it('should parse multiple cookies from single string', () => {
      const parsed = parseCookies(['session=abc123; user=john'])
      assert.strictEqual(parsed['session'], 'abc123')
      assert.strictEqual(parsed['user'], 'john')
    })

    it('should parse multiple cookie from array of strings', () => {
      const parsed = parseCookies(['session=abc123', 'user=john'])
      assert.strictEqual(parsed['session'], 'abc123')
      assert.strictEqual(parsed['user'], 'john')
    })

    it('should handle whitespace around cookies', () => {
      const parsed = parseCookies(['  session=abc123  ;  user=john  '])
      assert.strictEqual(parsed['session'], 'abc123')
      assert.strictEqual(parsed['user'], 'john')
    })
  })

  describe('cookie values', () => {
    it('should parse cookie with empty value', () => {
      const parsed = parseCookies(['empty='])
      assert.strictEqual(parsed['empty'], '')
    })

    it('should parse cookie with special characters', () => {
      const parsed = parseCookies(['data=abc%20def%3D123'])
      assert.strictEqual(parsed['data'], 'abc%20def%3D123')
    })

    it('should handle multiple equals signs in value', () => {
      const parsed = parseCookies(['token=abc=def=ghi'])
      assert.strictEqual(parsed['token'], 'abc=def=ghi')
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const parsed = parseCookies([])
      assert.deepStrictEqual(parsed, {})
    })

    it('should ignore invalid cookies', () => {
      const parsed = parseCookies(['valid=value', 'invalid'])
      assert.strictEqual(parsed['valid'], 'value')
      assert.strictEqual(parsed['invalid'], undefined)
    })

    it('should skip empty strings', () => {
      const parsed = parseCookies(['session=abc', '', 'user=john'])
      assert.strictEqual(parsed['session'], 'abc')
      assert.strictEqual(parsed['user'], 'john')
    })

    it('should handle semicolon-only strings', () => {
      const parsed = parseCookies([';;;'])
      assert.deepStrictEqual(parsed, {})
    })

    it('should handle duplicate cookie names', () => {
      const parsed = parseCookies(['name=value1; name=value2'])
      assert.strictEqual(parsed['name'], 'value2')
    })
  })
})

describe('formatCookies', () => {
  describe('basic formatting', () => {
    it('should format single cookie', () => {
      const formatted = formatCookies({ session: 'abc123' })
      assert.match(formatted, /session=abc123/)
    })

    it('should format multiple cookies', () => {
      const formatted = formatCookies({ session: 'abc123', user: 'john' })
      assert.match(formatted, /session=abc123/)
      assert.match(formatted, /user=john/)
      assert.strictEqual(formatted.includes(';'), true)
    })

    it('should skip null values', () => {
      const formatted = formatCookies({ session: 'abc123', empty: null as any })
      assert.match(formatted, /session=abc123/)
    })

    it('should skip undefined values', () => {
      const formatted = formatCookies({ session: 'abc123', empty: undefined as any })
      assert.match(formatted, /session=abc123/)
    })
  })

  describe('special values', () => {
    it('should format cookie with empty value', () => {
      const formatted = formatCookies({ empty: '' })
      assert.match(formatted, /empty=/)
    })

    it('should handle special characters', () => {
      const formatted = formatCookies({ token: 'abc=def;ghi' })
      assert.match(formatted, /token=abc=def;ghi/)
    })
  })

  describe('roundtrip', () => {
    it('should parse and format correctly', () => {
      const original = { session: 'test123', userId: 'user1' }
      const formatted = formatCookies(original)
      const parsed = parseCookies([formatted])
      assert.strictEqual(parsed['session'], original['session'])
      assert.strictEqual(parsed['userId'], original['userId'])
    })
  })
})

describe('parseSetCookies', () => {
  describe('basic parsing', () => {
    it('should parse set-cookie with value only', () => {
      const parsed = parseSetCookies(['session=abc123'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, 'abc123')
    })

    it('should parse set-cookie with path', () => {
      const parsed = parseSetCookies(['session=abc123; Path=/api'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, 'abc123')
      assert.strictEqual(parsed['session'].path, '/api')
    })

    it('should parse set-cookie with domain', () => {
      const parsed = parseSetCookies(['session=abc123; Domain=.example.com'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, 'abc123')
      assert.strictEqual(parsed['session'].domain, 'example.com')
    })

    it('should parse multiple set-cookies', () => {
      const parsed = parseSetCookies(['a=1; Path=/', 'b=2; Domain=.example.com'])
      assert.ok(parsed['a'])
      assert.ok(parsed['b'])
      // ...
    })
  })

  describe('cookie flags', () => {
    it('should parse secure flag', () => {
      const parsed = parseSetCookies(['session=abc; Secure'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].secure, true)
    })

    it('should parse httpOnly flag', () => {
      const parsed = parseSetCookies(['session=abc; HttpOnly'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].httpOnly, true)
    })

    it('should parse sameSite flag', () => {
      const parsed = parseSetCookies(['session=abc; SameSite=Strict'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].sameSite, 'strict')
    })

    it('should parse multiple flags', () => {
      const parsed = parseSetCookies(['session=abc; Secure; HttpOnly; SameSite=Lax'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].secure, true)
      assert.strictEqual(parsed['session'].httpOnly, true)
      assert.strictEqual(parsed['session'].sameSite, 'lax')
    })
  })

  describe('expiration', () => {
    it('should parse expires date', () => {
      const parsed = parseSetCookies(['session=abc; Expires=Wed, 09 Jun 2021 10:18:14 GMT'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].expires, 1623233894000)
    })

    it('should parse max-age', () => {
      const parsed = parseSetCookies(['session=abc; Max-Age=3600'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].maxAge, 3600)
    })

    it('should handle both expires and max-age', () => {
      const parsed = parseSetCookies([
        'session=abc; Expires=Wed, 09 Jun 2021 10:18:14 GMT; Max-Age=3600',
      ])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].expires, 1623233894000)
      assert.strictEqual(parsed['session'].maxAge, 3600)
    })
  })

  describe('edge cases', () => {
    it('should handle empty array', () => {
      const parsed = parseSetCookies([])
      assert.deepStrictEqual(parsed, {})
    })

    it('should ignore invalid set-cookies', () => {
      const parsed = parseSetCookies(['invalid', 'valid=value'])
      assert.strictEqual(parsed['invalid'], undefined)
      assert.ok(parsed['valid'])
      assert.strictEqual(parsed['valid'].value, 'value')
    })

    it('should handle case insensitive attributes', () => {
      const parsed = parseSetCookies(['session=abc; PATH=/; DOMAIN=.example.com'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, 'abc')
      assert.strictEqual(parsed['session'].path, '/')
      assert.strictEqual(parsed['session'].domain, 'example.com')
    })

    it('should handle duplicate attributes', () => {
      const parsed = parseSetCookies(['session=abc; Path=/api; Path=/'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].path, '/')
    })

    it('should handle whitespace in attributes', () => {
      const parsed = parseSetCookies(['session = abc ; Path = / ; Secure'])
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, 'abc')
      assert.strictEqual(parsed['session'].path, '/')
      assert.strictEqual(parsed['session'].secure, true)
    })
  })
})

describe('formatSetCookies', () => {
  describe('basic formatting', () => {
    it('should format set-cookie with value only', () => {
      const formatted = formatSetCookies({ session: { value: 'abc123' } })
      assert.match(formatted.join('\n'), /session=abc123/)
    })

    it('should format with path', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', path: '/api' },
      })
      assert.match(formatted.join('\n'), /session=abc; Path=\/api/)
    })

    it('should format with domain', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', domain: 'example.com' },
      })
      assert.match(formatted.join('\n'), /session=abc; Domain=example\.com/)
    })

    it('should format multiple cookies', () => {
      const formatted = formatSetCookies({
        a: { value: '1' },
        b: { value: '2' },
      })
      assert.match(formatted.join('\n'), /a=1/)
      assert.match(formatted.join('\n'), /b=2/)
      assert.strictEqual(formatted.length, 2)
    })
  })

  describe('flags formatting', () => {
    it('should format secure flag', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', secure: true },
      })
      assert.match(formatted.join('\n'), /session=abc; Secure/)
    })

    it('should format httpOnly flag', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', httpOnly: true },
      })
      assert.match(formatted.join('\n'), /session=abc; HttpOnly/)
    })

    it('should format sameSite attribute', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', sameSite: 'Strict' },
      })
      assert.match(formatted.join('\n'), /session=abc; SameSite=Strict/)
    })

    it('should format multiple flags', () => {
      const formatted = formatSetCookies({
        session: {
          value: 'abc',
          secure: true,
          httpOnly: true,
          sameSite: 'Lax',
        },
      })
      assert.match(formatted.join('\n'), /Secure/)
      assert.match(formatted.join('\n'), /HttpOnly/)
      assert.match(formatted.join('\n'), /SameSite=Lax/)
    })
  })

  describe('expiration formatting', () => {
    it('should format expires timestamp', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', expires: 1623233894000 },
      })
      assert.match(formatted.join('\n'), /session=abc; Expires=Wed, 09 Jun 2021 10:18:14 GMT/)
    })

    it('should format max-age', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', maxAge: 3600 },
      })
      assert.match(formatted.join('\n'), /session=abc; Max-Age=3600/)
    })

    it('should skip null expires', () => {
      const formatted = formatSetCookies({
        session: { value: 'abc', expires: null as any },
      })
      assert.match(formatted.join('\n'), /session=abc/)
    })
  })

  describe('null/undefined handling', () => {
    it('should skip null cookies', () => {
      const formatted = formatSetCookies({
        session: null as any,
      })
      assert.strictEqual(formatted.length, 0)
    })

    it('should skip undefined cookies', () => {
      const formatted = formatSetCookies({
        session: undefined as any,
      })
      assert.strictEqual(formatted.length, 0)
    })

    it('should skip null attributes', () => {
      const formatted = formatSetCookies({
        session: {
          value: 'abc',
          path: null as any,
          domain: null as any,
        },
      })
      const str = formatted.join('\n')
      assert.strictEqual(str.includes('Path=null'), false)
    })
  })

  describe('roundtrip', () => {
    it('should parse and format set-cookies correctly', () => {
      const original = 'session=abc123; Path=/; Secure; HttpOnly'
      const parsed = parseSetCookies([original])
      const formatted = formatSetCookies(parsed)
      assert.match(formatted.join('\n'), /session=abc123/)
      assert.match(formatted.join('\n'), /Path=\//)
      assert.match(formatted.join('\n'), /Secure/)
      assert.match(formatted.join('\n'), /HttpOnly/)
    })

    it('should preserve values through roundtrip', () => {
      const original = {
        session: {
          value: 'xyz789',
          path: '/api',
          domain: 'example.com',
          secure: true,
          httpOnly: true,
          sameSite: 'strict',
        },
      }
      const formatted = formatSetCookies(original)
      const parsed = parseSetCookies(formatted)
      assert.ok(parsed['session'])
      assert.strictEqual(parsed['session'].value, original['session'].value)
      assert.strictEqual(parsed['session'].path, original['session'].path)
      assert.strictEqual(parsed['session'].domain, original['session'].domain)
      assert.strictEqual(parsed['session'].secure, original['session'].secure)
      assert.strictEqual(parsed['session'].httpOnly, original['session'].httpOnly)
      assert.strictEqual(parsed['session'].sameSite, original['session'].sameSite)
    })
  })

  describe('edge cases', () => {
    it('should handle empty cookies object', () => {
      const formatted = formatSetCookies({})
      assert.strictEqual(formatted.length, 0)
    })

    it('should handle special characters in value', () => {
      const formatted = formatSetCookies({
        token: { value: 'abc=def;ghi[jkl]' },
      })
      assert.strictEqual(formatted.length, 1)
    })

    it('should handle very long values', () => {
      const longValue = 'x'.repeat(4096)
      const formatted = formatSetCookies({
        data: { value: longValue },
      })
      assert.match(formatted.join('\n'), new RegExp(`data=${longValue}`))
    })
  })
})
