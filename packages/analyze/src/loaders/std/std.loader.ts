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
  const container = new DIContainer()

  container.registerSingleton(CONFIG_SCHEMA, () => configStdAnalyzeSchema)
  container.registerSingleton(CONSUME_SPECS, () => specs)
  container.registerSingleton(CONSUME_ASSETS, () => assets)

  AjvValidator.inject(container)

  EnvConfig.inject<StdAnalyzeConfig>(container)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  MinioStorage.inject(container)

  RedisProduceConnector.inject(container)

  RedisConsumeConnector.inject(container)

  ConsumeRouter.inject(container)

  BullAnalyzeWorker.inject(container)

  AnalyzeApp.inject(container)

  autoLoad(container)

  composer(container)

  await AnalyzeApp.resolve(container).start()
}
