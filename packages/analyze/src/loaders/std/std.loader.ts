import { DIComposer, DIContainer } from '@famir/common'
import { CONFIG_SCHEMA, EnvConfig } from '@famir/config'
import {
  BullAnalyzeWorker,
  CONSUME_ASSETS,
  CONSUME_SPECS,
  ConsumeAssets,
  ConsumeRouter,
  ConsumeSpecs,
  RedisConsumeConnector
} from '@famir/consume'
import {
  RedisCampaignRepository,
  RedisDatabaseConnector,
  RedisMessageRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import { RedisProduceConnector } from '@famir/produce'
import { MinioStorage } from '@famir/storage'
import { AjvValidator } from '@famir/validator'
import { AnalyzeApp } from '../../analyze-app.js'
import { autoLoad } from '../../main.js'
import { StdAnalyzeConfig } from './std.js'
import { configStdAnalyzeSchema } from './std.schemas.js'

export async function bootstrapStd(
  composer: DIComposer,
  specs: ConsumeSpecs,
  assets: ConsumeAssets
): Promise<void> {
  const container = DIContainer.getInstance()

  container.registerSingleton(CONFIG_SCHEMA, () => configStdAnalyzeSchema)
  container.registerSingleton(CONSUME_SPECS, () => specs)
  container.registerSingleton(CONSUME_ASSETS, () => assets)

  AjvValidator.register(container)

  EnvConfig.register<StdAnalyzeConfig>(container)

  PinoLogger.register(container)

  RedisDatabaseConnector.register(container)

  RedisCampaignRepository.register(container)
  RedisTargetRepository.register(container)
  RedisSessionRepository.register(container)
  RedisMessageRepository.register(container)

  MinioStorage.register(container)

  RedisProduceConnector.register(container)

  RedisConsumeConnector.register(container)

  ConsumeRouter.register(container)

  BullAnalyzeWorker.register(container)

  AnalyzeApp.register(container)

  autoLoad(container)

  composer(container)

  await AnalyzeApp.resolve(container).start()
}
