/**
 * A token that uniquely identifies a dependency within the container.
 *
 * Can be either a string or a symbol to prevent naming collisions.
 */
export type DIToken = string | symbol

/**
 * A factory function that creates an instance of a dependency.
 *
 * @typeParam T - The type of the dependency.
 * @param container - The container used to resolve other dependencies.
 * @returns The created instance of the dependency.
 */
export type DIFactory<T = unknown> = (container: DIContainer) => T

/**
 * Internal record for a registered dependency.
 *
 * @typeParam T - The type of the dependency.
 */
interface DIRegistration<T = unknown> {
  factory: DIFactory<T>
  isSingleton: boolean
  instance: T | null
}

/**
 * A lightweight Dependency Injection container.
 *
 * Supports registering dependencies as singletons or transients and includes
 * built-in detection for circular dependencies.
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 *
 * // Get the global container instance.
 * const container = DIContainer.getInstance()
 *
 * // Register a singleton dependency.
 * container.registerSingleton('config', () => ({ level: 'warn' }))
 *
 * // Register a transient dependency.
 * container.registerTransient('logger', (c) => new Logger(c.resolve('config')))
 *
 * // Resolve dependencies.
 * const config = container.resolve('config')
 * const logger = container.resolve('logger')
 * ```
 */
export class DIContainer {
  /**
   * The global singleton instance of the container.
   */
  private static instance: DIContainer | null = null

  /**
   * The registry mapping tokens to their registration records.
   */
  private readonly registry: Map<DIToken, DIRegistration> = new Map()

  /**
   * A set tracking tokens currently being resolved to detect circular dependencies.
   */
  private readonly resolutionStack: Set<DIToken> = new Set()

  /**
   * Private constructor to enforce the singleton pattern.
   *
   * Use {@link getInstance} to obtain the container instance.
   */
  private constructor() {}

  /**
   * Retrieves the global singleton instance of the container.
   *
   * Creates a new instance if none exists.
   *
   * @returns The global `DIContainer` instance.
   */
  static getInstance(): DIContainer {
    DIContainer.instance ??= new DIContainer()

    return DIContainer.instance
  }

  /**
   * Internal method to register a dependency.
   *
   * @typeParam T - The type of the dependency.
   * @param token - The unique identifier for the dependency.
   * @param factory - The function to create the dependency instance.
   * @param isSingleton - Determines whether the dependency is a singleton.
   * @throws Error If the token is already registered.
   */
  private register<T>(token: DIToken, factory: DIFactory<T>, isSingleton: boolean) {
    if (this.exists(token)) {
      throw new Error(`Dependency already registered: ${token.toString()}`)
    }

    this.registry.set(token, { factory, isSingleton, instance: null })
  }

  /**
   * Registers a transient dependency.
   *
   * A new instance is created each time the dependency is resolved.
   *
   * @typeParam T - The type of the dependency.
   * @param token - The unique identifier for the dependency.
   * @param factory - The function to create the dependency instance.
   * @throws Error If the token is already registered.
   */
  registerTransient<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, false)
  }

  /**
   * Registers a singleton dependency.
   *
   * The same instance is returned on every resolution.
   *
   * @typeParam T - The type of the dependency.
   * @param token - The unique identifier for the dependency.
   * @param factory - The function to create the dependency instance.
   * @throws Error If the token is already registered.
   */
  registerSingleton<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, true)
  }

  /**
   * Resolves a registered dependency.
   *
   * @typeParam T - The type of the dependency.
   * @param token - The unique identifier for the dependency.
   * @returns The resolved dependency instance.
   * @throws Error If the token is not registered or a circular dependency is detected.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolve<T>(token: DIToken): T {
    if (this.resolutionStack.has(token)) {
      throw new Error(`Circular dependency detected: ${token.toString()}`)
    }

    const registration = this.registry.get(token)

    if (!registration) {
      throw new Error(`Dependency not registered: ${token.toString()}`)
    }

    this.resolutionStack.add(token)

    try {
      if (registration.isSingleton) {
        registration.instance ??= registration.factory(this)

        return registration.instance as T
      } else {
        return registration.factory(this) as T
      }
    } finally {
      this.resolutionStack.delete(token)
    }
  }

  /**
   * Resolves a dependency, returning `null` if it is not registered.
   *
   * @typeParam T - The type of the dependency.
   * @param token - The unique identifier for the dependency.
   * @returns The resolved dependency instance, or `null` if the token is not found.
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolveOptional<T>(token: DIToken): T | null {
    if (!this.exists(token)) {
      return null
    }

    return this.resolve<T>(token)
  }

  /**
   * Checks if a dependency token is registered in the container.
   *
   * @param token - The unique identifier for the dependency.
   * @returns `true` if the token is registered, `false` otherwise.
   */
  exists(token: DIToken): boolean {
    return this.registry.has(token)
  }

  /**
   * Retrieves a list of all registered dependency tokens.
   *
   * @returns An array of all registered tokens.
   */
  getTokens(): DIToken[] {
    return Array.from(this.registry.keys())
  }

  /**
   * Clears all registered dependencies and resets the resolution stack.
   */
  reset() {
    this.registry.clear()
    this.resolutionStack.clear()
  }
}

/**
 * A function that composes multiple dependency registrations.
 *
 * Designed to be used as a callback to set up the container with a group of dependencies.
 *
 * @param container - The DI container for registering dependencies.
 */
export type DIComposer = (container: DIContainer) => void
