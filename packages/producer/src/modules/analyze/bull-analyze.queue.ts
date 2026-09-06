import { DIContainer } from '@famir/common'
import {
  ANALYZE_QUEUE,
  ANALYZE_QUEUE_NAME,
  AnalyzeJobData,
  AnalyzeQueue,
  Config,
  CONFIG,
  Logger,
  LOGGER,
  PRODUCER_CONNECTOR,
  ProducerConnector,
  ProducerError,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { BullBaseQueue } from '../base/index.js'

/**
 * Bull-based analyze queue implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link ProducerConnector} via {@link PRODUCER_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { BullAnalyzeQueue } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * BullAnalyzeQueue.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { ANALYZE_QUEUE, AnalyzeQueue } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve dependency from container
 * const analyzeQueue = container.resolve<AnalyzeQueue>(ANALYZE_QUEUE)
 *
 * // TODO more examples
 * ```
 *
 * @category Analyze
 */
export class BullAnalyzeQueue extends BullBaseQueue implements AnalyzeQueue {
  /**
   * Registers the analyze queue as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeQueue>(
      ANALYZE_QUEUE,
      (c) =>
        new BullAnalyzeQueue(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ProducerConnector>(PRODUCER_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new analyze queue instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: ProducerConnector) {
    super(validator, config, logger, connector, ANALYZE_QUEUE_NAME)
  }

  async addJob(name: string, data: AnalyzeJobData): Promise<void> {
    try {
      const jobId = [data.campaignId, data.messageId].join('-')

      await this.queue.add(name, data, {
        jobId,
      })
    } catch (error) {
      throw ProducerError.wrap(error, {
        queue: this.queueName,
        method: 'addJob',
        data,
      })
    }
  }
}
