type Token = string | symbol
type Factory<T = unknown> = (container: DIContainer) => T

interface Registration<T = unknown> {
  factory: Factory<T>
  isSingleton: boolean
  instance: T | null
}

export class DIContainer {
  private readonly registry = new Map<Token, Registration>()

  private register<T>(token: Token, factory: Factory<T>, isSingleton: boolean) {
    if (this.registry.has(token)) {
      throw new Error(`Dependency already registered: ${token.toString()}`)
    }

    this.registry.set(token, { factory, isSingleton, instance: null })
  }

  registerTransient<T>(token: Token, factory: Factory<T>) {
    this.register(token, factory, false)
  }

  registerSingleton<T>(token: Token, factory: Factory<T>) {
    this.register(token, factory, true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolve<T>(token: Token): T {
    const registration = this.registry.get(token)

    if (!registration) {
      throw new Error(`Dependency not registered: ${token.toString()}`)
    }

    if (registration.isSingleton) {
      registration.instance ??= registration.factory(this)
    } else {
      registration.instance = registration.factory(this)
    }

    return registration.instance as T
  }

  reset() {
    this.registry.clear()
  }
}
