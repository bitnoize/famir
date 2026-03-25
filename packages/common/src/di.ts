export type DIToken = string | symbol
export type DIFactory<T = unknown> = (container: DIContainer) => T

interface DIRegistration<T = unknown> {
  factory: DIFactory<T>
  isSingleton: boolean
  instance: T | null
}

export class DIContainer {
  protected readonly registry = new Map<DIToken, DIRegistration>()

  protected register<T>(token: DIToken, factory: DIFactory<T>, isSingleton: boolean) {
    if (this.registry.has(token)) {
      throw new Error(`Dependency already registered: ${token.toString()}`)
    }

    this.registry.set(token, { factory, isSingleton, instance: null })
  }

  registerTransient<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, false)
  }

  registerSingleton<T>(token: DIToken, factory: DIFactory<T>) {
    this.register(token, factory, true)
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  resolve<T>(token: DIToken): T {
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

export type DIComposer = (container: DIContainer) => void
