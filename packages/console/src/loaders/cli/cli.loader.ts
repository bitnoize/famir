import { DIComposer, DIContainer } from '@famir/common'
import { CONFIG_SCHEMA, EnvConfig } from '@famir/config'
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
import { BullAnalyzeQueue, RedisProduceConnector } from '@famir/produce'
import {
  CliReplServer,
  REPL_SERVER_ASSETS,
  ReplServerAssets,
  ReplServerRouter
} from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { ConsoleApp } from '../../console-app.js'
import { autoLoad } from '../../main.js'
import { CliConsoleConfig } from './cli.js'
import { configCliConsoleSchema } from './cli.schemas.js'

export async function bootstrapCli(composer: DIComposer, assets: ReplServerAssets): Promise<void> {
  const container = new DIContainer()

  container.registerSingleton(CONFIG_SCHEMA, () => configCliConsoleSchema)
  container.registerSingleton(REPL_SERVER_ASSETS, () => assets)

  AjvValidator.inject(container)

  EnvConfig.inject<CliConsoleConfig>(container)

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

  RedisProduceConnector.inject(container)

  BullAnalyzeQueue.inject(container)

  ReplServerRouter.inject(container)

  CliReplServer.inject(container)

  ConsoleApp.inject(container)

  autoLoad(container)

  composer(container)

  await ConsoleApp.resolve(container).start()
}
