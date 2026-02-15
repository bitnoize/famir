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
import { CliReplServer, ReplServerRouter } from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../console.app.js'
import { AppCliConfig } from './cli.js'
import { configAppCliSchema } from './cli.schemas.js'

export async function bootstrapCli(composer: DIComposer): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AppCliConfig>(container, configAppCliSchema)

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

  BullAnalyzeLogQueue.inject(container)

  ReplServerRouter.inject(container)

  CliReplServer.inject(container)

  App.inject(container)

  composer(container)

  await App.resolve(container).start()
}
