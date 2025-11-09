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
import { ExpressHttpServer, ExpressHttpServerRegistry } from '@famir/http-server'
import { PinoLogger } from '@famir/logger'
import { EtaTemplater } from '@famir/templater'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, BullWorkflowConnector } from '@famir/workflow'
import { ReverseProxyApp } from './reverse-proxy.app.js'
import { ReverseProxyConfig } from './reverse-proxy.js'
import { configReverseProxySchema } from './reverse-proxy.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  AjvValidator.inject(container)

  EnvConfig.inject<ReverseProxyConfig>(container, configReverseProxySchema)

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

  BullWorkflowConnector.inject(container)

  BullAnalyzeLogQueue.inject(container)

  CurlHttpClient.inject(container)

  ExpressHttpServerRegistry.inject(container, [
    'beforeSetup',
    'setup',
    'afterSetup',
    'beforeAuth',
    'auth',
    'afterAuth',
    'beforePrepare',
    'prepare',
    'afterPrepare',
    'beforeForward',
    'forward',
    'afterForward',
    'beforeComplete',
    'complete',
    'afterComplete'
  ])

  ExpressHttpServer.inject(container)

  ReverseProxyApp.inject(container)

  composer(container)

  await ReverseProxyApp.resolve(container).start()
}
