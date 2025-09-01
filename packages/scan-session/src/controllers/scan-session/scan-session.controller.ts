import { Logger } from '@famir/logger'
import { ScanSessionManager } from '@famir/task-worker'
import { Validator } from '@famir/validator'

export class ScanSessionController {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    manager: ScanSessionManager
  ) {
    manager.setHandler('default', this.defaultHandler)
  }

  private readonly defaultHandler = async (dto: unknown): Promise<number> => {
    return 1
  }
}
