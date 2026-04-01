export type DIToken = string | symbol
export type DIFactory<T = unknown> = (container: DIContainer) => T

interface DIRegistration<T = unknown> {
  factory: DIFactory<T>
  isSingleton: boolean
  instance: T | null
}

/*
 * Dependency injection container
 */
export class DIContainer {
  private static instance: DIContainer | null = null
  protected readonly registry = new Map<DIToken, DIRegistration>()
  protected readonly resolutionStack = new Set<DIToken>()

  private constructor() {}

  /**
   * Get or create singleton instance
   */
  static getInstance(): DIContainer {
    DIContainer.instance ??= new DIContainer()

    return DIContainer.instance
  }

  /**
   * Reset instance
   */
  static resetInstance() {
    DIContainer.instance = null
  }

  protected register<T>(token: DIToken, factory: DIFactory<T>, isSingleton: boolean) {
    if (this.exists(token)) {
      throw new Error(`Dependency already registered: ${token.toString()}`)
    }

    this.registry.set(token, { factory, isSingleton, instance: null })
  }

  /**
   * Register transient dependency
   */
  registerTransient<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, false)
  }

  /**
   * Register singleton dependency
   */
  registerSingleton<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, true)
  }

  /**
   * Resolve dependency
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
   * Resolve optional dependency
   */
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolveOptional<T>(token: DIToken): T | null {
    if (!this.exists(token)) {
      return null
    }

    return this.resolve<T>(token)
  }

  /**
   * Check dependency exists
   */
  exists(token: DIToken): boolean {
    return this.registry.has(token)
  }

  /**
   * Get all registered tokens
   */
  getTokens(): Readonly<DIToken[]> {
    return Array.from(this.registry.keys())
  }

  /**
   * Cleanup container
   */
  reset() {
    this.registry.clear()
    this.resolutionStack.clear()
  }
}

export type DIComposer = (container: DIContainer) => void
