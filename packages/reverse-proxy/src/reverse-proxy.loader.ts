import { DIContainer } from '@famir/common'
import {
  DatabaseConnector,
  CampaignRepository,
  LureRepository,
  ProxyRepository,
  RedirectorRepository,
  TargetRepository,
  Config,
  ScanMessageQueue,
  WorkflowConnector,
  Validator,
  HttpServerRouter,
  HttpServer,
  Logger,
} from '@famir/domain'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector,
  RedisLureRepository,
  RedisProxyRepository,
  RedisRedirectorRepository,
  RedisTargetRepository
} from '@famir/database'
import { ExpressHttpServer, ExpressHttpServerRouter } from '@famir/http-server'
import { PinoLogger } from '@famir/logger'
import {
  BullScanMessageQueue,
  BullWorkflowConnection,
  BullWorkflowConnector,
} from '@famir/workflow'
import { AjvValidator } from '@famir/validator'
import { ReverseProxyApp } from './reverse-proxy.app.js'
import { ReverseProxyConfig } from './reverse-proxy.js'
import { configReverseProxySchema } from './reverse-proxy.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<ReverseProxyConfig>>(
    'Config',
    (c) =>
      new EnvConfig<ReverseProxyConfig>(c.resolve<Validator>('Validator'), configReverseProxySchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config')
      )
  )

  //
  // Database
  //

  container.registerSingleton<DatabaseConnector>(
    'DatabaseConnector',
    (c) =>
      new RedisDatabaseConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<CampaignRepository>(
    'CampaignRepository',
    (c) =>
      new RedisCampaignRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<ProxyRepository>(
    'ProxyRepository',
    (c) =>
      new RedisProxyRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<TargetRepository>(
    'TargetRepository',
    (c) =>
      new RedisTargetRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<RedirectorRepository>(
    'RedirectorRepository',
    (c) =>
      new RedisRedirectorRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<LureRepository>(
    'LureRepository',
    (c) =>
      new RedisLureRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  //
  // Workflow
  //

  container.registerSingleton<WorkflowConnector>(
    'WorkflowConnector',
    (c) =>
      new BullWorkflowConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanMessageQueue>(
    'ScanMessageQueue',
    (c) =>
      new BullScanMessageQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<WorkflowConnector>('WorkflowConnector').connection<BullWorkflowConnection>()
      )
  )

  //
  // HttpServer
  //

  container.registerSingleton<HttpServerRouter>('HttpServerRouter', (c) => new ExpressHttpServerRouter(c.resolve<Logger>('Logger')))

  container.registerSingleton<HttpServer>(
    'HttpServer',
    (c) =>
      new ExpressHttpServer(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<HttpServerRouter>('HttpServerRouter')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<ReverseProxyApp>(
    'ReverseProxyApp',
    (c) =>
      new ReverseProxyApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<WorkflowConnector>('WorkflowConnector'),
        c.resolve<HttpServer>('HttpServer')
      )
  )

  const reverseProxyApp = container.resolve<ReverseProxyApp>('ReverseProxyApp')

  await reverseProxyApp.start()
}
