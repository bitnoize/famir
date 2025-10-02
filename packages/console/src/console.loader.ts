import { DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnector,
  RedisLureRepository,
  RedisMessageRepository,
  RedisProxyRepository,
  RedisRedirectorRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import { NetReplServer, NetReplServerContext } from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, BullPersistLogQueue, BullWorkflowConnector } from '@famir/workflow'
import { ConsoleApp } from './console.app.js'
import { configConsoleSchema } from './console.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject(container, configConsoleSchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisProxyRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisRedirectorRepository.inject(container)
  RedisLureRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  BullWorkflowConnector.inject(container)

  BullPersistLogQueue.inject(container)
  BullAnalyzeLogQueue.inject(container)

  NetReplServerContext.inject(container)

  NetReplServer.inject(container)

  composer(container)

  const app = ConsoleApp.inject(container)

  await app.start()
}
