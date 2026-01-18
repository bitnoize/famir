import { DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnector,
  RedisMessageRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import { BullAnalyzeLogWorker, ImplExecutorRouter, RedisExecutorConnector } from '@famir/executor'
import { PinoLogger } from '@famir/logger'
import { MinioStorage } from '@famir/storage'
import { AjvValidator } from '@famir/validator'
import { RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../app.js'
import { AppDefaultConfig } from './default.js'
import { configAppDefaultSchema } from './default.schemas.js'

export async function bootstrapDefault(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AppDefaultConfig>(container, configAppDefaultSchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  MinioStorage.inject(container)

  RedisWorkflowConnector.inject(container)

  RedisExecutorConnector.inject(container)

  ImplExecutorRouter.inject(container, ['analyze-log'])

  BullAnalyzeLogWorker.inject(container)

  App.inject(container)

  composer(container)

  await App.resolve(container).start()
}
