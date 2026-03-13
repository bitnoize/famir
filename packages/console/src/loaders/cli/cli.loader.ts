import { MinioStorage } from '@famir/storage'
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
import { BullAnalyzeQueue, RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../app.js'
import { autoLoad } from '../../main.js'
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

  MinioStorage.inject(container)

  RedisWorkflowConnector.inject(container)

  BullAnalyzeQueue.inject(container)

  ReplServerRouter.inject(container)

  CliReplServer.inject(container)

  App.inject(container)

  autoLoad(container)

  composer(container)

  await App.resolve(container).start()
}
