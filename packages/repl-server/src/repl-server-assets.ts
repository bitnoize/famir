import { DIContainer } from '@famir/common'

/**
 * DI token for the repl-server assets.
 */
export const REPL_SERVER_ASSETS = Symbol('ReplServerAssets')

/**
 * Represents the repl-server assets.
 *
 * The assets is a collection of static text files that are added during the
 * application build process.
 */
export class ReplServerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<ReplServerAssets>(
      REPL_SERVER_ASSETS,
      () => new ReplServerAssets(assets)
    )
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ReplServerAssets>(REPL_SERVER_ASSETS)
  }

  constructor(assets: [string, string][]) {
    super(assets)

    Object.entries(this.defaults).forEach(([name, value]) => {
      if (!this.has(name)) {
        this.set(name, value)
      }
    })
  }

  /**
   * Map default values.
   */
  protected defaults: Record<string, string> = {
    'banner-greet.txt': `Welcome to Fake-Mirrors!\n`,
    'banner-leave.txt': `So long!\n`,
  }

  getOrThrow(assetName: string): string {
    const asset = this.get(assetName)
    if (asset == null) {
      throw new Error(`Asset '${assetName}' not exists`)
    }

    return asset
  }

  get bannerGreet(): string {
    return this.getOrThrow('banner-greet.txt')
  }

  get bannerLeave(): string {
    return this.getOrThrow('banner-leave.txt')
  }
}
