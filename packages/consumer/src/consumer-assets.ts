import { DIContainer } from '@famir/common'

/**
 * DI token for the consumer assets.
 *
 * @category none
 */
export const CONSUMER_ASSETS = Symbol('ConsumerAssets')

/**
 * Represents the consumer assets.
 *
 * The assets is a collection of static text files that are added during the
 * application build process.
 *
 * @category none
 */
export class ConsumerAssets extends Map<string, string> {
  /**
   * Registers the assets as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   * @param assets - The list of key-value pairs.
   */
  static register(container: DIContainer, assets: [string, string][]) {
    container.registerSingleton<ConsumerAssets>(CONSUMER_ASSETS, () => new ConsumerAssets(assets))
  }

  /**
   * Resolves the assets from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The assets instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ConsumerAssets>(CONSUMER_ASSETS)
  }
}
