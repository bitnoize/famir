import { DIContainer } from '@famir/common'
import { Config, EnvConfig } from '@famir/config'
import {
  DatabaseConnector,
  RedisCampaignRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector,
  RedisLureRepository,
  RedisProxyRepository,
  RedisRedirectorRepository,
  RedisTargetRepository
} from '@famir/database'
import {
  CampaignRepository,
  LureRepository,
  ProxyRepository,
  RedirectorRepository,
  TargetRepository
} from '@famir/domain'
import { ExpressHttpServer, ExpressRouter, HttpServer, Router } from '@famir/http-server'
import { Logger, PinoLogger } from '@famir/logger'
import {
  BullScanMessageQueue,
  BullScanSessionQueue,
  BullTaskQueueConnection,
  BullTaskQueueConnector,
  ScanMessageQueue,
  ScanSessionQueue,
  TaskQueueConnector
} from '@famir/task-queue'
import { AjvValidator, Validator } from '@famir/validator'
import { ReverseProxyApp } from './reverse-proxy.app.js'
import { ReverseProxyConfig } from './reverse-proxy.js'
import { configReverseProxySchema } from './reverse-proxy.schemas.js'

export async function main(setup: (container: DIContainer) => void): Promise<void> {
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
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<ProxyRepository>(
    'ProxyRepository',
    (c) =>
      new RedisProxyRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<TargetRepository>(
    'TargetRepository',
    (c) =>
      new RedisTargetRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<RedirectorRepository>(
    'RedirectorRepository',
    (c) =>
      new RedisRedirectorRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<LureRepository>(
    'LureRepository',
    (c) =>
      new RedisLureRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  //
  // Queues
  //

  container.registerSingleton<TaskQueueConnector>(
    'TaskQueueConnector',
    (c) =>
      new BullTaskQueueConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanSessionQueue>(
    'ScanSessionQueue',
    (c) =>
      new BullScanSessionQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<TaskQueueConnector>('TaskQueueConnector').connection<BullTaskQueueConnection>()
      )
  )

  container.registerSingleton<ScanMessageQueue>(
    'ScanMessageQueue',
    (c) =>
      new BullScanMessageQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<TaskQueueConnector>('TaskQueueConnector').connection<BullTaskQueueConnection>()
      )
  )

  //
  // HttpServer
  //

  container.registerSingleton<Router>('MainRouter', () => new ExpressRouter())

  container.registerSingleton<HttpServer>(
    'HttpServer',
    (c) =>
      new ExpressHttpServer(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ReverseProxyConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        [c.resolve<Router>('MainRouter')]
      )
  )

  //
  // Controllers
  //

  setup(container)

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
        c.resolve<TaskQueueConnector>('TaskQueueConnector'),
        c.resolve<HttpServer>('HttpServer')
      )
  )

  const reverseProxyApp = container.resolve<ReverseProxyApp>('ReverseProxyApp')

  await reverseProxyApp.start()
}
