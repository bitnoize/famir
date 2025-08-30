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
import { Logger, PinoLogger } from '@famir/logger'
import { Context, NodeContext, NodeReplServer, ReplServer } from '@famir/repl-server'
import {
  BullHeartbeatQueue,
  BullScanMessageQueue,
  BullScanSessionQueue,
  BullTaskQueueConnection,
  BullTaskQueueConnector,
  HeartbeatQueue,
  ScanMessageQueue,
  ScanSessionQueue,
  TaskQueueConnector
} from '@famir/task-queue'
import { AjvValidator, Validator } from '@famir/validator'
import { ShellApp } from './shell.app.js'
import { ShellConfig } from './shell.js'
import { configShellSchema } from './shell.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<ShellConfig>>(
    'Config',
    (c) => new EnvConfig<ShellConfig>(c.resolve<Validator>('Validator'), configShellSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(c.resolve<Validator>('Validator'), c.resolve<Config<ShellConfig>>('Config'))
  )

  //
  // Database
  //

  container.registerSingleton<DatabaseConnector>(
    'DatabaseConnector',
    (c) =>
      new RedisDatabaseConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
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
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<HeartbeatQueue>(
    'HeartbeatQueue',
    (c) =>
      new BullHeartbeatQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<TaskQueueConnector>('TaskQueueConnector').connection<BullTaskQueueConnection>()
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
  // ReplServer
  //

  container.registerSingleton<Context>('Context', () => new NodeContext())

  container.registerSingleton<ReplServer>(
    'ReplServer',
    (c) =>
      new NodeReplServer(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<Context>('Context')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<ShellApp>(
    'ShellApp',
    (c) =>
      new ShellApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<TaskQueueConnector>('TaskQueueConnector'),
        c.resolve<HeartbeatQueue>('HeartbeatQueue'),
        c.resolve<ScanSessionQueue>('ScanSessionQueue'),
        c.resolve<ScanMessageQueue>('ScanMessageQueue'),
        c.resolve<ReplServer>('ReplServer')
      )
  )

  const shellApp = container.resolve<ShellApp>('ShellApp')

  await shellApp.start()
}
