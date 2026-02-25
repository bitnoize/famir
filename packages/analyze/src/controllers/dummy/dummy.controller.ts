import { DIContainer } from '@famir/common'
import { EXECUTOR_ROUTER, ExecutorRouter } from '@famir/executor'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { ANALYZE_QUEUE_NAME } from '@famir/workflow'
import { BaseController } from '../base/index.js'
import { DUMMY_SERVICE, type DummyService } from './dummy.service.js'

export const DUMMY_CONTROLLER = Symbol('DummyController')

export class DummyController extends BaseController {
  static inject(container: DIContainer) {
    container.registerSingleton(
      DUMMY_CONTROLLER,
      (c) =>
        new DummyController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ExecutorRouter>(EXECUTOR_ROUTER),
          c.resolve<DummyService>(DUMMY_SERVICE)
        )
    )
  }

  static resolve(container: DIContainer): DummyController {
    return container.resolve(DUMMY_CONTROLLER)
  }

  constructor(
    validator: Validator,
    logger: Logger,
    router: ExecutorRouter,
    protected readonly dummyService: DummyService
  ) {
    super(validator, logger, router)

    this.logger.debug(`DummyController initialized`)
  }

  use() {
    this.router.register(ANALYZE_QUEUE_NAME, 'dummy', async (data) => {
      this.validateAnalyzeJobData(data)

      const [campaign, session, message] = await this.dummyService.readMessage(data)

      await this.dummyService.saveMessage(message)
    })
  }
}
