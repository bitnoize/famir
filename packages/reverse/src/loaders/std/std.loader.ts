import { DIComposer, DIContainer } from '@famir/common'
import { CONFIG_SCHEMA, EnvConfig } from '@famir/config'
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
import { CurlHttpClient } from '@famir/http-client'
import {
  HTTP_SERVER_ASSETS,
  HttpServerAssets,
  HttpServerRouter,
  NativeHttpServer
} from '@famir/http-server'
import { PinoLogger } from '@famir/logger'
import { BullAnalyzeQueue, RedisProduceConnector } from '@famir/produce'
import { EtaTemplater } from '@famir/templater'
import { AjvValidator } from '@famir/validator'
import { autoLoad } from '../../main.js'
import { ReverseApp } from '../../reverse-app.js'
import { StdReverseConfig } from './std.js'
import { configStdReverseSchema } from './std.schemas.js'

export async function bootstrapStd(composer: DIComposer, assets: HttpServerAssets): Promise<void> {
  const container = new DIContainer()

  container.registerSingleton(CONFIG_SCHEMA, () => configStdReverseSchema)
  container.registerSingleton(HTTP_SERVER_ASSETS, () => assets)

  AjvValidator.inject(container)

  EnvConfig.inject<StdReverseConfig>(container)

  PinoLogger.inject(container)

  EtaTemplater.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisProxyRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisRedirectorRepository.inject(container)
  RedisLureRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  RedisProduceConnector.inject(container)

  BullAnalyzeQueue.inject(container)

  CurlHttpClient.inject(container)

  HttpServerRouter.inject(container)

  NativeHttpServer.inject(container)

  ReverseApp.inject(container)

  autoLoad(container)

  composer(container)

  await ReverseApp.resolve(container).start()
}
