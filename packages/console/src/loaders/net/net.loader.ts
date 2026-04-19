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
  NetReplServer,
  REPL_SERVER_ASSETS,
  ReplServerAssets,
  ReplServerRouter,
} from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import { ConsoleApp } from '../../console-app.js'
import { autoLoad } from '../../main.js'
import { NetConsoleConfig } from './net.js'
import { configNetConsoleSchema } from './net.schemas.js'

/**
 * Composition root
 * @category Loaders
 */
export async function bootstrapNet(composer: DIComposer, assets: ReplServerAssets): Promise<void> {
  const container = DIContainer.getInstance()

  container.registerSingleton(CONFIG_SCHEMA, () => configNetConsoleSchema)
  container.registerSingleton(REPL_SERVER_ASSETS, () => assets)

  AjvValidator.register(container)

  EnvConfig.register<NetConsoleConfig>(container)

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

  NetReplServer.register(container)

  ConsoleApp.register(container)

  autoLoad(container)

  composer(container)

  await ConsoleApp.resolve(container).start()
}
