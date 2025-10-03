import { DIContainer } from '@famir/common'
import { CurlHttpClient } from '@famir/http-client'
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
import { ExpressHttpServer, ExpressHttpServerRouter } from '@famir/http-server'
import { PinoLogger } from '@famir/logger'
import { AjvValidator } from '@famir/validator'
import { BullPersistLogQueue, BullWorkflowConnector } from '@famir/workflow'
import { ReverseProxyApp } from './reverse-proxy.app.js'
import { configReverseProxySchema } from './reverse-proxy.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject(container, configReverseProxySchema)

  PinoLogger.inject(container)

  RedisDatabaseConnector.inject(container)

  RedisCampaignRepository.inject(container)
  RedisProxyRepository.inject(container)
  RedisTargetRepository.inject(container)
  RedisRedirectorRepository.inject(container)
  RedisLureRepository.inject(container)
  RedisSessionRepository.inject(container)
  RedisMessageRepository.inject(container)

  BullWorkflowConnector.inject(container)

  BullPersistLogQueue.inject(container)

  CurlHttpClient.inject(container)

  ExpressHttpServerRouter.inject(container)

  ExpressHttpServer.inject(container)

  composer(container)

  const app = ReverseProxyApp.inject(container)

  await app.start()
}
