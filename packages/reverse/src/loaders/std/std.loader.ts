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
  NativeHttpServer,
  NativeHttpServerContextFactory
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
  const container = DIContainer.getInstance()

  container.registerSingleton(CONFIG_SCHEMA, () => configStdReverseSchema)
  container.registerSingleton(HTTP_SERVER_ASSETS, () => assets)

  AjvValidator.register(container)

  EnvConfig.register<StdReverseConfig>(container)

  PinoLogger.register(container)

  EtaTemplater.register(container)

  RedisDatabaseConnector.register(container)

  RedisCampaignRepository.register(container)
  RedisProxyRepository.register(container)
  RedisTargetRepository.register(container)
  RedisRedirectorRepository.register(container)
  RedisLureRepository.register(container)
  RedisSessionRepository.register(container)
  RedisMessageRepository.register(container)

  RedisProduceConnector.register(container)

  BullAnalyzeQueue.register(container)

  CurlHttpClient.register(container)

  HttpServerRouter.register(container)

  NativeHttpServerContextFactory.register(container)

  NativeHttpServer.register(container)

  ReverseApp.register(container)

  autoLoad(container)

  composer(container)

  await ReverseApp.resolve(container).start()
}
