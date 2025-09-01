import { Logger } from '@famir/logger'
import { HeartbeatManager } from '@famir/task-worker'
import { Validator } from '@famir/validator'

export class HeartbeatController {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    manager: HeartbeatManager
  ) {
    manager.setHandler('scan-sessions', this.scanSessionsHandler)
    manager.setHandler('scan-messages', this.scanMessagesHandler)
  }

  private readonly scanSessionsHandler = async (dto: unknown): Promise<number> => {
    return 1
  }

  private readonly scanMessagesHandler = async (dto: unknown): Promise<number> => {
    return 1
  }
}
