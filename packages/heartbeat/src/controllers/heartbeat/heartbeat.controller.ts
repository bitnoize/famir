import { Logger } from '@famir/logger'
import { HeartbeatDispatcher } from '@famir/task-worker'
import { Validator } from '@famir/validator'

export class HeartbeatController {
  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    dispatcher: HeartbeatDispatcher
  ) {
    dispatcher.setHandler('scan-sessions', this.scanSessionsHandler)
    dispatcher.setHandler('scan-messages', this.scanMessagesHandler)
  }

  private readonly scanSessionsHandler = async (dto: unknown): Promise<number> => {
    return 1
  }

  private readonly scanMessagesHandler = async (dto: unknown): Promise<number> => {
    return 1
  }
}
