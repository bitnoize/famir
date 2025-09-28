import { Logger, ScanMessageManager, Validator } from '@famir/domain'

export class ScanMessageController {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    manager: ScanMessageManager
  ) {
    manager.setHandler('default', this.defaultHandler)
  }

  private readonly defaultHandler = async (dto: unknown): Promise<number> => {
    return 1
  }
}
