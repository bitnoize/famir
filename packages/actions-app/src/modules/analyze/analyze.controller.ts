import { DIContainer } from '@famir/common'
import { analyzeJobDataSchema, CONSUMER_ROUTER, ConsumerRouter } from '@famir/consumer'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE_NAME, AnalyzeJobData } from '@famir/producer'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { type AnalyzeService, ANALYZE_SERVICE } from './analyze.service.js'

/**
 * DI token for the analyze controller.
 *
 * @category Analyze
 */
export const ANALYZE_CONTROLLER = Symbol('AnalyzeController')

/**
 * Represents the analyze controller.
 *
 * @category Analyze
 */
export class AnalyzeController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeController>(
      ANALYZE_CONTROLLER,
      (c) =>
        new AnalyzeController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ConsumerRouter>(CONSUMER_ROUTER),
          c.resolve<AnalyzeService>(ANALYZE_SERVICE)
        )
    )
  }

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<AnalyzeController>(ANALYZE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The consumer router instance.
   * @param analyzeService - The analyze service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ConsumerRouter,
    protected readonly analyzeService: AnalyzeService
  ) {
    super(validator, logger, router)

    this.validator.addSchema('actions-analyze-job-data', analyzeJobDataSchema)
  }

  /**
   * Registers used processors in the router.
   */
  use() {
    this.router.addQueue(ANALYZE_QUEUE_NAME).addProcessor<AnalyzeJobData>(
      {
        queueName: ANALYZE_QUEUE_NAME,
        jobName: 'default',
        schemaName: 'actions-analyze-job-data',
      },
      async (spec, data) => {
        const message = await this.analyzeService.readMessage({
          campaignId: data.campaignId,
          messageId: data.messageId,
        })

        // ...

        await this.analyzeService.saveMessage(message)
      }
    )
  }
}
