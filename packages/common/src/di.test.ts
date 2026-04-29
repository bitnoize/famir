import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DIContainer } from './di.js'

test('DIContainer', async (t) => {
  await t.test('should be a singleton', () => {
    const container1 = DIContainer.getInstance()
    const container2 = DIContainer.getInstance()

    assert.strictEqual(container1, container2)
  })

  await t.test('should register transient dependencies', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const token = 'service'
    const factory = () => ({ id: 1 })

    container.registerTransient(token, factory)

    const instance1 = container.resolve(token)
    const instance2 = container.resolve(token)

    assert.notStrictEqual(instance1, instance2)
    assert.deepEqual(instance1, { id: 1 })
  })

  await t.test('should register singleton dependencies', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const token = 'service'
    const factory = () => ({ id: 1 })

    container.registerSingleton(token, factory)

    const instance1 = container.resolve(token)
    const instance2 = container.resolve(token)

    assert.strictEqual(instance1, instance2)
  })

  await t.test('should throw when registering duplicate token', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const token = 'service'

    container.registerSingleton(token, () => ({}))

    assert.throws(() => {
      container.registerSingleton(token, () => ({}))
    }, /already registered/)
  })

  await t.test('should throw when resolving non-existent dependency', () => {
    const container = DIContainer.getInstance()
    container.reset()

    assert.throws(() => {
      container.resolve('non-existent')
    }, /not registered/)
  })

  await t.test('should throw when detect circular dependencies', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const tokenA = 'serviceA'
    const tokenB = 'serviceB'

    container.registerSingleton(tokenA, (c) => ({ dep: c.resolve(tokenB) }))
    container.registerSingleton(tokenB, (c) => ({ dep: c.resolve(tokenA) }))

    assert.throws(() => {
      container.resolve(tokenA)
    }, /Circular dependency detected/)
  })

  await t.test('should resolve optional dependencies', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const result = container.resolveOptional('non-existent')

    assert.equal(result, null)
  })

  await t.test('should check if dependency exists', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const token = 'service'

    assert.ok(!container.exists(token))

    container.registerSingleton(token, () => ({}))

    assert.ok(container.exists(token))
  })

  await t.test('should return registered tokens', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const tokenA = 'serviceA'
    const tokenB = 'serviceB'

    container.registerSingleton(tokenA, () => ({}))
    container.registerSingleton(tokenB, () => ({}))

    const tokens = container.getTokens()

    assert.ok(tokens.includes(tokenA))
    assert.ok(tokens.includes(tokenB))
  })

  await t.test('should resolve nested dependencies', () => {
    const container = DIContainer.getInstance()
    container.reset()

    type ServiceA = { value: number }
    type ServiceB = { a: ServiceA }

    const tokenA = 'serviceA'
    const tokenB = 'serviceB'

    container.registerSingleton<ServiceA>(tokenA, () => ({ value: 42 }))
    container.registerSingleton<ServiceB>(tokenB, (c) => ({ a: c.resolve(tokenA) }))

    const b = container.resolve<ServiceB>(tokenB)
    assert.strictEqual(b.a.value, 42)
  })

  await t.test('should support symbol tokens', () => {
    const container = DIContainer.getInstance()
    container.reset()

    const token = Symbol('service')

    container.registerSingleton(token, () => ({ id: 1 }))

    const instance = container.resolve(token)

    assert.deepEqual(instance, { id: 1 })
  })

  await t.test('should reset container', () => {
    const container = DIContainer.getInstance()

    container.registerSingleton('service', () => ({}))
    assert.ok(container.exists('service'))

    container.reset()
    assert.ok(!container.exists('service'))
  })
})
