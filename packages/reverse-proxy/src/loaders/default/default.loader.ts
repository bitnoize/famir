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
import { CurlHttpClient } from '@famir/http-client'
import { HttpServerRouter, NativeHttpServer } from '@famir/http-server'
import { PinoLogger } from '@famir/logger'
import { EtaTemplater } from '@famir/templater'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../reverse-proxy.app.js'
import { AppDefaultConfig } from './default.js'
import { configAppDefaultSchema } from './default.schemas.js'

export async function bootstrapDefault(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AppDefaultConfig>(container, configAppDefaultSchema)

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

  RedisWorkflowConnector.inject(container)

  BullAnalyzeLogQueue.inject(container)

  CurlHttpClient.inject(container)

  HttpServerRouter.inject(container)

  NativeHttpServer.inject(container)

  App.inject(container)

  composer(container)

  await App.resolve(container).start()
}
