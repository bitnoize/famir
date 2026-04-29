/**
 * A token used to identify dependencies in the DI container.
 * Can be a string or symbol for unique identification.
 *
 * @category none
 */
export type DIToken = string | symbol

/**
 * A factory function that creates instances of a dependency.
 *
 * @category none
 * @template T - The type of the dependency
 * @param container - The DI container for resolving nested dependencies
 * @returns The created instance
 */
export type DIFactory<T = unknown> = (container: DIContainer) => T

interface DIRegistration<T = unknown> {
  factory: DIFactory<T>
  isSingleton: boolean
  instance: T | null
}

/**
 * A lightweight Dependency Injection container.
 *
 * Supports registering and resolving dependencies as singletons or transients,
 * with built-in circular dependency detection.
 *
 * @category none
 * @example
 * ```ts
 * const container = DIContainer.getInstance()
 *
 * // Register a singleton
 * container.registerSingleton('config', () => ({ port: 3000 }))
 *
 * // Register a transient
 * container.registerTransient('logger', (c) => new Logger())
 *
 * // Resolve dependencies
 * const config = container.resolve('config')
 * const logger = container.resolve('logger')
 * ```
 */
export class DIContainer {
  private static instance: DIContainer | null = null

  private readonly registry: Map<DIToken, DIRegistration> = new Map()
  private readonly resolutionStack: Set<DIToken> = new Set()

  private constructor() {}

  /**
   * Get or create the singleton container instance.
   *
   * @returns The global DIContainer instance
   */
  static getInstance(): DIContainer {
    DIContainer.instance ??= new DIContainer()

    return DIContainer.instance
  }

  private register<T>(token: DIToken, factory: DIFactory<T>, isSingleton: boolean) {
    if (this.exists(token)) {
      throw new Error(`Dependency already registered: ${token.toString()}`)
    }

    this.registry.set(token, { factory, isSingleton, instance: null })
  }

  /**
   * Register a transient dependency (new instance each time).
   *
   * @template T - The type of the dependency
   * @param token - Unique identifier for the dependency
   * @param factory - Function to create instances
   * @throws Error if the token is already registered
   */
  registerTransient<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, false)
  }

  /**
   * Register a singleton dependency (same instance always).
   *
   * @template T - The type of the dependency
   * @param token - Unique identifier for the dependency
   * @param factory - Function to create the instance
   * @throws Error if the token is already registered
   */
  registerSingleton<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, true)
  }

  /**
   * Resolve a registered dependency.
   *
   * @template T - The type of the dependency
   * @param token - The dependency token
   * @returns The resolved instance
   * @throws Error if the token is not registered or circular dependency is detected
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
   * Resolve an optional dependency (returns null if not registered).
   *
   * @template T - The type of the dependency
   * @param token - The dependency token
   * @returns The resolved instance or null if not found
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolveOptional<T>(token: DIToken): T | null {
    if (!this.exists(token)) {
      return null
    }

    return this.resolve<T>(token)
  }

  /**
   * Check if a dependency is registered.
   *
   * @param token - The dependency token
   * @returns True if the token is registered
   */
  exists(token: DIToken): boolean {
    return this.registry.has(token)
  }

  /**
   * Get all registered dependency tokens.
   *
   * @returns Array of registered tokens
   */
  getTokens(): DIToken[] {
    return Array.from(this.registry.keys())
  }

  /**
   * Clear all registered dependencies and resolution state (for testing purposes).
   */
  reset() {
    this.registry.clear()
    this.resolutionStack.clear()
  }
}

/**
 * A composer function for setting up the DI container.
 * Used to register multiple dependencies in a single call.
 *
 * @category none
 */
export type DIComposer = (container: DIContainer) => void
