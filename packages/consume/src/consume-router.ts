import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import {
  CONSUME_ASSETS,
  CONSUME_ROUTER,
  CONSUME_SPECS,
  ConsumeAssets,
  ConsumeProcessor,
  ConsumeSpec,
  ConsumeSpecs
} from './consume.js'

export class ConsumeRouter {
  static inject(container: DIContainer) {
    container.registerSingleton<ConsumeRouter>(
      CONSUME_ROUTER,
      (c) =>
        new ConsumeRouter(
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumeSpecs>(CONSUME_SPECS),
          c.resolve<ConsumeAssets>(CONSUME_ASSETS)
        )
    )
  }

  static resolve(container: DIContainer): ConsumeRouter {
    return container.resolve(CONSUME_ROUTER)
  }

  protected readonly specs = new Map<string, ConsumeSpec>()
  protected readonly assets = new Map<string, string>()
  protected readonly queues: Record<string, Map<string, ConsumeProcessor>> = {}

  constructor(
    protected readonly logger: Logger,
    specs: ConsumeSpecs,
    assets: ConsumeAssets
  ) {
    specs.forEach(([queueName, spec]) => {
      if (this.specs.has(queueName)) {
        throw new Error(`Duplicate spec: ${queueName}`)
      }

      this.specs.set(queueName, spec)

      this.queues[queueName] = new Map<string, ConsumeProcessor>()
    })

    assets.forEach(([assetName, asset]) => {
      if (this.assets.has(assetName)) {
        throw new Error(`Duplicate asset: ${assetName}`)
      }

      this.assets.set(assetName, asset)
    })

    this.logger.debug(`ConsumeRouter initialized`)
  }

  #isActive: boolean = false

  get isActive(): boolean {
    return this.#isActive
  }

  activate() {
    this.#isActive = true
  }

  addProcessor(queueName: string, jobName: string, processor: ConsumeProcessor) {
    if (this.isActive) {
      throw new Error(`Router is active`)
    }

    if (!this.queues[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    if (this.queues[queueName].has(jobName)) {
      throw new Error(`Processor already exists: ${queueName} => ${jobName}`)
    }

    this.queues[queueName].set(jobName, processor)

    this.logger.debug(`ConsumeRouter add processor: ${queueName} => ${jobName}`)
  }

  getProcessor(queueName: string, jobName: string): ConsumeProcessor {
    if (!this.isActive) {
      throw new Error(`Router not active`)
    }

    if (!this.queues[queueName]) {
      throw new Error(`Queue not exists: ${queueName}`)
    }

    const processor = this.queues[queueName].get(jobName)

    if (!processor) {
      throw new Error(`Processor not exists: ${queueName} => ${jobName}`)
    }

    return processor
  }

  getSpec(queueName: string): ConsumeSpec {
    const spec = this.specs.get(queueName)

    if (!spec) {
      throw new Error(`Spec not exists: ${queueName}`)
    }

    return spec
  }

  getAsset(assetName: string): string | undefined {
    return this.assets.get(assetName)
  }
}
