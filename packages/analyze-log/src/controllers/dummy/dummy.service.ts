import { DIContainer } from '@famir/common'
import {
  CAMPAIGN_REPOSITORY,
  CampaignRepository,
  FullCampaignModel,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository
} from '@famir/database'
import { ExecutorError } from '@famir/executor'
import { Storage, STORAGE } from '@famir/storage'
import { AnalyzeLogJobData } from '@famir/workflow'

export const DUMMY_SERVICE = Symbol('DummyService')

export class DummyService {
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

  constructor(
    protected readonly storage: Storage,
    protected readonly campaignRepository: CampaignRepository,
    protected readonly sessionRepository: SessionRepository,
    protected readonly messageRepository: MessageRepository
  ) {}

  async readMessage(
    data: AnalyzeLogJobData
  ): Promise<[FullCampaignModel, SessionModel, MessageModel]> {
    const message = await this.messageRepository.read(data.campaignId, data.messageId)

    if (!message) {
      throw new ExecutorError(`Message not found`, {
        code: 'INTERNAL_ERROR'
      })
    }

    const campaign = await this.campaignRepository.read(message.campaignId)

    if (!campaign) {
      throw new ExecutorError(`Campaign not found`, {
        code: 'INTERNAL_ERROR'
      })
    }

    const session = await this.sessionRepository.read(message.campaignId, message.sessionId)

    if (!session) {
      throw new ExecutorError(`Session not found`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return [campaign, session, message]
  }

  async saveMessage(message: MessageModel): Promise<void> {
    const data = Buffer.from(JSON.stringify({
      ...message,
      requestBody: undefined,
      responseBody: undefined,
    }))

    await this.storage.put(
      `sessions/${message.sessionId}/${message.messageId}/message.json`,
      data,
      {
        'Content-Type': 'application/json'
      }
    )
  }

}
