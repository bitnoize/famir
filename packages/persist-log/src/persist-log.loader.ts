import { DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnector,
  RedisMessageRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import {
  BullExecutorConnector,
  BullExecutorDispatcher,
  BullPersistLogWorker
} from '@famir/executor'
import { PinoLogger } from '@famir/logger'
import { MinioStorage } from '@famir/storage'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, BullWorkflowConnector } from '@famir/workflow'
import { PersistLogApp } from './persist-log.app.js'
import { configPersistLogSchema } from './persist-log.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject(container, configPersistLogSchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  MinioStorage.inject(container)

  BullWorkflowConnector.inject(container)

  BullAnalyzeLogQueue.inject(container)

  BullExecutorConnector.inject(container)

  BullExecutorDispatcher.inject(container)

  BullPersistLogWorker.inject(container)

  PersistLogApp.inject(container)

  composer(container)

  await PersistLogApp.resolve(container).start()
}
