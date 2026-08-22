import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  ConsumerProcessor,
  ConsumerProcessorAction,
  ConsumerProcessorSpec,
} from './consumer-processor.js'

/**
 * DI token for the consumer router.
 *
 * @category none
 */
export const CONSUMER_ROUTER = Symbol('ConsumerRouter')

/**
 * Represents the consumer router.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { CONSUMER_ROUTER, ConsumerRouter } from '@famir/consumer'
 * import { ANALYZE_QUEUE_NAME } from '@famir/producer'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * ConsumerRouter.register(container)
 *
 * // Resolve from DI container
 * const router = container.resolve<ConsumerRouter>(CONSUMER_ROUTER)
 *
 * // Add queue
 * router.addQueue()
 *
 * // Add custom processor
 * router.addProcessor(ANALYZE_QUEUE_NAME, async (data) => {
 *   // Worker logic here..
 *   console.log(data)
 *
 *   return true
 * })
 *
 * // Activate router
 * router.activate()
 * ```
 *
 * @category none
 */
export class ConsumerRouter {
  /**
   * Registers the router as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ConsumerRouter>(
      CONSUMER_ROUTER,
      (c) => new ConsumerRouter(c.resolve<Validator>(VALIDATOR), c.resolve<Logger>(LOGGER))
    )
  }

  /**
   * Resolves the router from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The router instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ConsumerRouter>(CONSUMER_ROUTER)
  }

  /** Mapping of queue names to job processors. */
  protected readonly queues: Map<string, Map<string, ConsumerProcessor<unknown>>> = new Map()

  /**
   * Creates a new router instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger
  ) {}

  #isActive: boolean = false

  /**
   * Activates the router.
   *
   * Once activated, processors can be retrieved but not added.
   */
  activate() {
    if (!this.#isActive) {
      this.#isActive = true
    }
  }

  /**
   * Adds a queue in the router.
   *
   * Queues can only be added before the router is activated.
   *
   * @param queueName - The name of the queue.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If the queue is already exist.
   */
  addQueue(queueName: string): this {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }

    if (this.queues.has(queueName)) {
      throw new Error(`Queue already exists: ${queueName}`)
    }

    this.queues.set(queueName, new Map())

    this.logger.debug(`ConsumerRouter add queue`, { queueName })

    return this
  }

  /**
   * Adds a processor for a specific queue and job.
   *
   * Processors can only be added before the router is activated.
   *
   * @param spec - The processor spec object.
   * @param action - The processor action function.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If the queue does not exist.
   * @throws Error If a processor for this job already exists.
   */
  addProcessor<T>(spec: ConsumerProcessorSpec, action: ConsumerProcessorAction<T>) {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }

    const queue = this.queues.get(spec.queueName)

    if (!queue) {
      throw new Error(`Queue not exists: ${spec.queueName}`)
    }

    if (queue.has(spec.jobName)) {
      throw new Error(`Processor already exists: ${spec.queueName} => ${spec.jobName}`)
    }

    const processor = new ConsumerProcessor<T>(this.validator, spec, action)

    queue.set(spec.jobName, processor as ConsumerProcessor<unknown>)

    this.logger.debug(`ConsumerRouter add processor`, {
      queueName: spec.queueName,
      jobName: spec.jobName,
    })

    return this
  }

  /**
   * Retrieves a processor for a specific queue and job.
   *
   * Processors can only be retrieved after the router is activated.
   *
   * @param queueName - The name of the queue.
   * @param jobName - The name of the job.
   * @returns The processor function, or `undefined` if not found.
   * @throws Error If the router is not active.
   */
  getProcessor(queueName: string, jobName: string): ConsumerProcessor<unknown> | undefined {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }

    const queue = this.queues.get(queueName)

    if (!queue) {
      return undefined
    }

    return queue.get(jobName)
  }
}
