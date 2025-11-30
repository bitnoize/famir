import { DIContainer } from '@famir/common'
import { MESSAGE_REPOSITORY, MessageRepository } from '@famir/domain'
import { BaseService } from '../base/index.js'
//import { Data, Reply } from './complete.js'

export const COMPLETE_SERVICE = Symbol('CompleteService')

export class CompleteService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<CompleteService>(
      COMPLETE_SERVICE,
      (c) => new CompleteService(c.resolve<MessageRepository>(MESSAGE_REPOSITORY))
    )
  }

  constructor(protected readonly messageRepository: MessageRepository) {
    super()
  }

  //async execute(data: Data): Promise<Reply> {}
}
