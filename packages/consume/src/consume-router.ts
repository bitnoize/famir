import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  CONSUME_ASSETS,
  CONSUME_ROUTER,
  CONSUME_SPECS,
  ConsumeAssets,
  ConsumeProcessor,
  ConsumeSpec,
  ConsumeSpecs,
} from './consume.js'

type ConsumeQueuesMap = Map<string, Map<string, ConsumeProcessor>>

/**
 * Represents a consume router
 *
 * @category none
 */
export class ConsumeRouter {
  /**
   * Register dependency
   */
  static register(container: DIContainer, specs: ConsumeSpecs, assets: ConsumeAssets) {
    container.registerSingleton<ConsumeSpecs>(CONSUME_SPECS, () => specs)

    container.registerSingleton<ConsumeAssets>(CONSUME_ASSETS, () => assets)

    container.registerSingleton<ConsumeRouter>(
      CONSUME_ROUTER,
      (c) =>
        new ConsumeRouter(c.resolve(LOGGER), c.resolve(CONSUME_SPECS), c.resolve(CONSUME_ASSETS))
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): ConsumeRouter {
    return container.resolve(CONSUME_ROUTER)
  }

  protected readonly queues: ConsumeQueuesMap = new Map()

  constructor(
    protected readonly logger: Logger,
    protected readonly specs: ConsumeSpecs,
    protected readonly assets: ConsumeAssets
  ) {
    for (const queueName of specs.keys()) {
      this.queues.set(queueName, new Map())
    }

    this.logger.debug(`ConsumeRouter initialized`)
  }

  #isActive: boolean = false

  /**
   * Check if router is active
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activate router
   */
  activate() {
    this.#isActive = true
  }

  /**
   * Get spec by queueName
   */
  getSpec(queueName: string): ConsumeSpec {
    const spec = this.specs.get(queueName)

    if (!spec) {
      throw new Error(`Consume spec not known: ${queueName}`)
    }

    return spec
  }

  /**
   * Get asset by name
   */
  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
  }

  /**
   * Add processor
   */
  addProcessor(queueName: string, jobName: string, processor: ConsumeProcessor) {
    if (this.isActive) {
      throw new Error(`Router is active`)
    }

    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    if (queue.has(jobName)) {
      throw new Error(`Processor already exists: ${queueName} => ${jobName}`)
    }

    queue.set(jobName, processor)

    this.logger.debug(`ConsumeRouter add processor: ${queueName} => ${jobName}`)
  }

  /**
   * Get processor by name
   */
  getProcessor(queueName: string, jobName: string): ConsumeProcessor {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    const queue = this.queues.get(queueName)
    if (!queue) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    const processor = queue.get(jobName)
    if (!processor) {
      throw new Error(`Processor not exists: ${queueName} => ${jobName}`)
    }

    return processor
  }
}
