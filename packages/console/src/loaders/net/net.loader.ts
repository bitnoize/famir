import { DIComposer, DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnector,
  RedisDatabaseManager,
  RedisLureRepository,
  RedisMessageRepository,
  RedisProxyRepository,
  RedisRedirectorRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import { NetReplServer, ReplServerRouter } from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeQueue, RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../console.app.js'
import { AppNetConfig } from './net.js'
import { configAppNetSchema } from './net.schemas.js'

export async function bootstrapNet(composer: DIComposer): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AppNetConfig>(container, configAppNetSchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)
  RedisDatabaseManager.inject(container)

  RedisCampaignRepository.inject(container)
  RedisProxyRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisRedirectorRepository.inject(container)
  RedisLureRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  RedisWorkflowConnector.inject(container)

  BullAnalyzeQueue.inject(container)

  ReplServerRouter.inject(container)

  NetReplServer.inject(container)

  App.inject(container)

  composer(container)

  await App.resolve(container).start()
}
