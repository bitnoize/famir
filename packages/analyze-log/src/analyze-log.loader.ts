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
  BullAnalyzeLogWorker,
  BullExecutorConnector,
  BullExecutorRegistry
} from '@famir/executor'
import { PinoLogger } from '@famir/logger'
import { MinioStorage } from '@famir/storage'
import { AjvValidator } from '@famir/validator'
import { BullWorkflowConnector } from '@famir/workflow'
import { AnalyzeLogApp } from './analyze-log.app.js'
import { AnalyzeLogConfig } from './analyze-log.js'
import { configAnalyzeLogSchema } from './analyze-log.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AnalyzeLogConfig>(container, configAnalyzeLogSchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  MinioStorage.inject(container)

  BullWorkflowConnector.inject(container)

  BullExecutorConnector.inject(container)

  BullExecutorRegistry.inject(container)

  BullAnalyzeLogWorker.inject(container)

  AnalyzeLogApp.inject(container)

  composer(container)

  await AnalyzeLogApp.resolve(container).start()
}
