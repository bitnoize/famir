import { Logger, ScanMessageManager, Validator } from '@famir/domain'
import { BaseController } from '../base/index.js'

export class ScanMessageController extends BaseController {
  constructor(
    validator: Validator,
    logger: Logger,
    manager: ScanMessageManager
  ) {
    super(validator, logger, context, 'campaign')

    manager.setHandler('default', this.defaultHandler)
  }

  private readonly defaultHandler = async (dto: unknown): Promise<number> => {
    return 1
  }
}
