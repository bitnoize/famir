import { Logger } from '@famir/logger'
import { HeartbeatResult } from '@famir/task-queue'
import { HeartbeatManager } from '@famir/task-worker'
import { Validator, ValidatorAssertSchema } from '@famir/validator'
import { ScanSessionsUseCase, ScanMessagesUseCase } from '../../use-cases/index.js'

export class HeartbeatController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    manager: HeartbeatManager,
    protected readonly scanSessionsUseCase: ScanSessionsUseCase,
    protected readonly scanMessagesUseCase: ScanMessagesUseCase,
  ) {
    this.assertSchema = validator.assertSchema

    manager.setHandler('scan-sessions', this.scanSessionsHandler)
    manager.setHandler('scan-messages', this.scanMessagesHandler)
  }

  private readonly scanSessionsHandler = async (): Promise<HeartbeatResult> => {
    return this.scanSessionsUseCase.execute()
  }

  private readonly scanMessagesHandler = async (): Promise<HeartbeatResult> => {
    return this.scanMessagesUseCase.execute()
  }
}
