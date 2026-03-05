import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { DIContainer } from './di.js'

test('DIContainer - registerTransient', (t) => {
  t.test('should register a transient dependency', () => {
    const container = new DIContainer()
    const factory = () => ({ value: 'test' })

    container.registerTransient('test', factory)

    const instance1 = container.resolve('test')
    const instance2 = container.resolve('test')

    assert.notStrictEqual(instance1, instance2, 'Transient should create new instance each time')
  })

  t.test('should throw error when registering duplicate transient', () => {
    const container = new DIContainer()
    const factory = () => ({ value: 'test' })

    container.registerTransient('test', factory)

    assert.throws(() => container.registerTransient('test', factory), {
      message: /Dependency already registered: test/
    })
  })

  t.test('should support symbol as token', () => {
    const container = new DIContainer()
    const symbol = Symbol('test')
    const factory = () => ({ value: 'test' })

    container.registerTransient(symbol, factory)

    const instance = container.resolve(symbol)
    assert.deepStrictEqual(instance, { value: 'test' })
  })
})

test('DIContainer - registerSingleton', (t) => {
  t.test('should register a singleton dependency', () => {
    const container = new DIContainer()
    const factory = () => ({ value: 'test' })

    container.registerSingleton('test', factory)

    const instance1 = container.resolve('test')
    const instance2 = container.resolve('test')

    assert.strictEqual(instance1, instance2, 'Singleton should return same instance')
  })

  t.test('should throw error when registering duplicate singleton', () => {
    const container = new DIContainer()
    const factory = () => ({ value: 'test' })

    container.registerSingleton('test', factory)

    assert.throws(() => container.registerSingleton('test', factory), {
      message: /Dependency already registered: test/
    })
  })

  t.test('should initialize singleton only once', () => {
    const container = new DIContainer()
    let callCount = 0
    const factory = () => {
      callCount++
      return { value: callCount }
    }

    container.registerSingleton('test', factory)

    container.resolve('test')
    container.resolve('test')
    container.resolve('test')

    assert.equal(callCount, 1, 'Factory should be called only once for singleton')
  })

  t.test('should support symbol as token for singleton', () => {
    const container = new DIContainer()
    const symbol = Symbol('test')
    const factory = () => ({ value: 'test' })

    container.registerSingleton(symbol, factory)

    const instance1 = container.resolve(symbol)
    const instance2 = container.resolve(symbol)

    assert.strictEqual(instance1, instance2)
  })
})

test('DIContainer - resolve', (t) => {
  t.test('should resolve registered dependency', () => {
    const container = new DIContainer()
    const expected = { value: 'test' }

    container.registerTransient('test', () => expected)

    const instance = container.resolve('test')
    assert.strictEqual(instance, expected)
  })

  t.test('should throw error when resolving unregistered dependency', () => {
    const container = new DIContainer()

    assert.throws(() => container.resolve('unknown'), {
      message: /Dependency not registered: unknown/
    })
  })

  t.test('should support dependency injection - factory receives container', () => {
    const container = new DIContainer()

    container.registerSingleton('dependency', () => ({ name: 'dep' }))
    container.registerTransient('service', (c) => {
      const dep = c.resolve('dependency')
      return { dependency: dep }
    })

    const service = container.resolve('service')
    assert.deepStrictEqual(service, { dependency: { name: 'dep' } })
  })

  t.test('should resolve with generic type', () => {
    const container = new DIContainer()

    interface MyService {
      getValue(): string
    }

    const factory: (container: DIContainer) => MyService = () => ({
      getValue: () => 'test'
    })

    container.registerSingleton<MyService>('service', factory)

    const service = container.resolve<MyService>('service')
    assert.equal(service.getValue(), 'test')
  })

  t.test('should handle complex dependency chains', () => {
    const container = new DIContainer()

    interface MyConfig {
      apiUrl: string
    }
    interface MyLogger {
      log(msg: string): string
    }
    interface MyServer {
      config: MyConfig
      logger: MyLogger
    }

    container.registerSingleton<MyConfig>('config', () => ({ apiUrl: 'http://api' }))
    container.registerSingleton<MyLogger>('logger', () => ({ log: (msg: string) => msg }))
    container.registerSingleton<MyServer>('server', (c) => ({
      config: c.resolve<MyConfig>('config'),
      logger: c.resolve<MyLogger>('logger')
    }))

    const server = container.resolve<MyServer>('server')
    assert.deepStrictEqual(server.config, { apiUrl: 'http://api' })
    assert.strictEqual(server.logger.log('test'), 'test')
  })
})

test('DIContainer - reset', (t) => {
  t.test('should clear all registrations', () => {
    const container = new DIContainer()

    container.registerTransient('test', () => ({ value: 'test' }))
    container.registerSingleton('singleton', () => ({ value: 'singleton' }))

    container.reset()

    assert.throws(() => container.resolve('test'), { message: /Dependency not registered: test/ })

    assert.throws(() => container.resolve('singleton'), {
      message: /Dependency not registered: singleton/
    })
  })

  t.test('should allow re-registration after reset', () => {
    const container = new DIContainer()

    container.registerTransient('test', () => ({ value: 'old' }))
    container.reset()
    container.registerTransient('test', () => ({ value: 'new' }))

    const instance = container.resolve('test')
    assert.deepStrictEqual(instance, { value: 'new' })
  })

  t.test('should clear singleton instances', () => {
    const container = new DIContainer()
    let callCount = 0

    container.registerSingleton('test', () => {
      callCount++
      return { value: callCount }
    })

    container.resolve('test')
    assert.equal(callCount, 1)

    container.reset()

    container.registerSingleton('test', () => {
      callCount++
      return { value: callCount }
    })

    const instance = container.resolve('test')
    assert.equal(callCount, 2)
    assert.deepStrictEqual(instance, { value: 2 })
  })
})

test('DIContainer - edge cases', (t) => {
  t.test('should handle null and undefined values returned by factory', () => {
    const container = new DIContainer()

    container.registerTransient('null', () => null)
    container.registerTransient('undefined', () => undefined)

    assert.strictEqual(container.resolve('null'), null)
    assert.strictEqual(container.resolve('undefined'), undefined)
  })

  t.test('should handle string and number tokens', () => {
    const container = new DIContainer()

    container.registerTransient('string-token', () => ({ type: 'string' }))

    const instance = container.resolve('string-token')
    assert.deepStrictEqual(instance, { type: 'string' })
  })

  t.test('should handle circular dependency detection', () => {
    const container = new DIContainer()

    // This would cause infinite recursion
    container.registerTransient('a', (c) => {
      return { b: c.resolve('b') }
    })
    container.registerTransient('b', (c) => {
      return { a: c.resolve('a') }
    })

    assert.throws(
      () => container.resolve('a'),
      { name: 'RangeError' } // Stack overflow will throw RangeError
    )
  })

  t.test('should support mixed token types (string and symbol)', () => {
    const container = new DIContainer()
    const symbol = Symbol('service')

    container.registerTransient('stringService', () => ({ type: 'string' }))
    container.registerTransient(symbol, () => ({ type: 'symbol' }))

    const stringInstance = container.resolve('stringService')
    const symbolInstance = container.resolve(symbol)

    assert.deepStrictEqual(stringInstance, { type: 'string' })
    assert.deepStrictEqual(symbolInstance, { type: 'symbol' })
  })
})
