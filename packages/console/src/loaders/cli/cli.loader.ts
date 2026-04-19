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
  RedisTargetRepository,
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import { BullAnalyzeQueue, RedisProduceConnector } from '@famir/produce'
import {
  CliReplServer,
  REPL_SERVER_ASSETS,
  ReplServerAssets,
  ReplServerRouter,
} from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { ConsoleApp } from '../../console-app.js'
import { autoLoad } from '../../main.js'
import { CliConsoleConfig } from './cli.js'
import { configCliConsoleSchema } from './cli.schemas.js'

/**
 * Composition root
 * @category Loaders
 */
export async function bootstrapCli(composer: DIComposer, assets: ReplServerAssets): Promise<void> {
  const container = DIContainer.getInstance()

  container.registerSingleton(CONFIG_SCHEMA, () => configCliConsoleSchema)
  container.registerSingleton(REPL_SERVER_ASSETS, () => assets)

  AjvValidator.register(container)

  EnvConfig.register<CliConsoleConfig>(container)

  PinoLogger.register(container)

  RedisDatabaseConnector.register(container)
  RedisDatabaseManager.register(container)

  RedisCampaignRepository.register(container)
  RedisProxyRepository.register(container)
  RedisTargetRepository.register(container)
  RedisRedirectorRepository.register(container)
  RedisLureRepository.register(container)
  RedisSessionRepository.register(container)
  RedisMessageRepository.register(container)

  RedisProduceConnector.register(container)

  BullAnalyzeQueue.register(container)

  ReplServerRouter.register(container)

  CliReplServer.register(container)

  ConsoleApp.register(container)

  autoLoad(container)

  composer(container)

  await ConsoleApp.resolve(container).start()
}
