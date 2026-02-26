import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  MESSAGE_REPOSITORY,
  MessageRepository,
  SESSION_REPOSITORY,
  SessionRepository
} from '@famir/database'
import { Storage, STORAGE } from '@famir/storage'
import { BaseService } from '../base/index.js'

export const DUMMY_SERVICE = Symbol('DummyService')

export class DummyService extends BaseService {
  static inject(container: DIContainer) {
    container.registerSingleton<DummyService>(
      DUMMY_SERVICE,
      (c) =>
        new DummyService(
          c.resolve<Storage>(STORAGE),
          c.resolve<CampaignRepository>(CAMPAIGN_REPOSITORY),
          c.resolve<SessionRepository>(SESSION_REPOSITORY),
          c.resolve<MessageRepository>(MESSAGE_REPOSITORY)
        )
    )
  }
}
