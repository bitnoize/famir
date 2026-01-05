import { DIContainer } from '@famir/common'
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
import { SimpleReplServerRouter, NodeReplServer } from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, BullWorkflowConnector } from '@famir/workflow'
import { ConsoleApp } from './console.app.js'
import { ConsoleConfig } from './console.js'
import { configConsoleSchema } from './console.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<ConsoleConfig>(container, configConsoleSchema)

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

  BullWorkflowConnector.inject(container)

  BullAnalyzeLogQueue.inject(container)

  SimpleReplServerRouter.inject(container)

  NodeReplServer.inject(container)

  ConsoleApp.inject(container)

  composer(container)

  await ConsoleApp.resolve(container).start()
}
