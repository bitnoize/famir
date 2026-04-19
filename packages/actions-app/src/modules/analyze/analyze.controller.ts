import { DIContainer } from '@famir/common'
import { CONSUME_ROUTER, ConsumeRouter } from '@famir/consume'
import { Logger, LOGGER } from '@famir/logger'
import { ANALYZE_QUEUE_NAME, AnalyzeJobData } from '@famir/produce'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ANALYZE_CONTROLLER, ANALYZE_SERVICE } from './analyze.js'
import { analyzeSchemas } from './analyze.schemas.js'
import { type AnalyzeService } from './analyze.service.js'

/**
 * Represents an analyze service
 *
 * @category Analyze
 */
export class AnalyzeController extends BaseController {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<AnalyzeController>(
      ANALYZE_CONTROLLER,
      (c) =>
        new AnalyzeController(
          c.resolve(VALIDATOR),
          c.resolve(LOGGER),
          c.resolve(CONSUME_ROUTER),
          c.resolve(ANALYZE_SERVICE)
        )
    )
  }

  /**
   * Resolve dependency
   */
  static resolve(container: DIContainer): AnalyzeController {
    return container.resolve(ANALYZE_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ConsumeRouter,
    protected readonly analyzeService: AnalyzeService
  ) {
    super(validator, logger, router)

    this.validator.addSchemas(analyzeSchemas)

    this.logger.debug(`AnalyzeController initialized`)
  }

  use() {
    this.router.addProcessor(ANALYZE_QUEUE_NAME, 'default', async (data) => {
      this.validateData<AnalyzeJobData>('actions-analyze-job-data', data)

      const message = await this.analyzeService.readMessage(data)

      // ...

      await this.analyzeService.saveMessage(message)
    })
  }
}
