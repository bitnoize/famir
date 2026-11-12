import { DIContainer } from '@famir/common'
import {
  ANALYZE_QUEUE_NAME,
  ConsumerError,
  Logger,
  LOGGER,
  Validator,
  VALIDATOR,
  WEBHOOK_QUEUE_NAME,
} from '@famir/domain'
import {
  ConsumerProcessor,
  ConsumerProcessorAction,
  ConsumerProcessorSpec,
} from './consumer-processor.js'
import { ConsumerQueueNames } from './consumer.js'

/**
 * DI token for the consumer router.
 *
 * @category none
 */
export const CONSUMER_ROUTER = Symbol('ConsumerRouter')

type ConsumerRouterQueues = Record<ConsumerQueueNames, Map<string, ConsumerProcessor<unknown>>>

/**
 * Represents the consumer router.
 *
 * The router acts as root of a consumer and handles the routing jobs
 * to their respective processors.
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
      (c) => new this(c.resolve<Validator>(VALIDATOR), c.resolve<Logger>(LOGGER))
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
  protected readonly queues: ConsumerRouterQueues = {
    [ANALYZE_QUEUE_NAME]: new Map<string, ConsumerProcessor<unknown>>(),
    [WEBHOOK_QUEUE_NAME]: new Map<string, ConsumerProcessor<unknown>>(),
  }

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
   * Checks if the router is active.
   *
   * @returns `true` if the router is active, `false` otherwise.
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activates the router.
   *
   * Once activated, processors can be retrieved but not added.
   *
   * @returns This router for method chaining.
   */
  activate(): this {
    if (!this.#isActive) {
      this.#isActive = true
    }

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
   * @throws Error If a processor for this job already exists.
   */
  add<T>(spec: ConsumerProcessorSpec, action: ConsumerProcessorAction<T>): this {
    this.sureNotActive()

    const queue = this.queues[spec.queueName]

    if (queue.has(spec.jobName)) {
      throw new Error(`Processor already exists: ${spec.queueName}->${spec.jobName}`)
    }

    const processor = new ConsumerProcessor<T>(this.validator, spec, action)

    queue.set(spec.jobName, processor as ConsumerProcessor<unknown>)

    this.logger.debug(`ConsumerRouter add processor: ${spec.queueName}->${spec.jobName}`)

    return this
  }

  /**
   * Retrieves a processor for a specific queue and job.
   *
   * Processors can only be retrieved after the router is activated.
   *
   * @param queueName - The name of the queue.
   * @param jobName - The name of the job.
   * @returns The processor function.
   * @throws Error If the router is not active.
   * @throws ConsumerError If the processor is not found.
   */
  find(queueName: ConsumerQueueNames, jobName: string): ConsumerProcessor<unknown> {
    this.sureIsActive()

    const queue = this.queues[queueName]

    const processor = queue.get(jobName)

    if (!processor) {
      throw ConsumerError.internalError(`Processor not found`, {
        queueName,
        jobName,
      })
    }

    return processor
  }

  protected sureNotActive() {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }
  }

  protected sureIsActive() {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }
  }
}
