import { DIComposer, DIContainer } from '@famir/common'
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
import { BullAnalyzeQueue, RedisWorkflowConnector } from '@famir/workflow'
import { App } from '../../reverse.app.js'
import { AppStdConfig } from './std.js'
import { configAppStdSchema } from './std.schemas.js'

export async function bootstrapStd(composer: DIComposer): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<AppStdConfig>(container, configAppStdSchema)

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

  BullAnalyzeQueue.inject(container)

  CurlHttpClient.inject(container)

  HttpServerRouter.inject(container)

  NativeHttpServer.inject(container)

  App.inject(container)

  composer(container)

  await App.resolve(container).start()
}
