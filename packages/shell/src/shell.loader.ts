import { DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector,
  RedisLureRepository,
  RedisMessageRepository,
  RedisProxyRepository,
  RedisRedirectorRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import {
  CampaignRepository,
  Config,
  DatabaseConnector,
  Logger,
  LureRepository,
  MessageRepository,
  ProxyRepository,
  RedirectorRepository,
  ReplServer,
  ReplServerContext,
  ScanMessageQueue,
  SessionRepository,
  TargetRepository,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import { PinoLogger } from '@famir/logger'
import { NetReplServer, NetReplServerContext } from '@famir/repl-server'
import { AjvValidator } from '@famir/validator'
import {
  BullScanMessageQueue,
  BullWorkflowConnection,
  BullWorkflowConnector
} from '@famir/workflow'
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
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<ProxyRepository>(
    'ProxyRepository',
    (c) =>
      new RedisProxyRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<TargetRepository>(
    'TargetRepository',
    (c) =>
      new RedisTargetRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<RedirectorRepository>(
    'RedirectorRepository',
    (c) =>
      new RedisRedirectorRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<LureRepository>(
    'LureRepository',
    (c) =>
      new RedisLureRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<SessionRepository>(
    'SessionRepository',
    (c) =>
      new RedisSessionRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<MessageRepository>(
    'MessageRepository',
    (c) =>
      new RedisMessageRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  //
  // Queues
  //

  container.registerSingleton<WorkflowConnector>(
    'WorkflowConnector',
    (c) =>
      new BullWorkflowConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanMessageQueue>(
    'ScanMessageQueue',
    (c) =>
      new BullScanMessageQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<WorkflowConnector>('WorkflowConnector').connection<BullWorkflowConnection>()
      )
  )

  //
  // ReplServer
  //

  container.registerSingleton<ReplServerContext>(
    'ReplServerContext',
    (c) => new NetReplServerContext(c.resolve<Logger>('Logger'))
  )

  container.registerSingleton<ReplServer>(
    'ReplServer',
    (c) =>
      new NetReplServer(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ShellConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<ReplServerContext>('ReplServerContext')
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
        c.resolve<WorkflowConnector>('WorkflowConnector'),
        c.resolve<ScanMessageQueue>('ScanMessageQueue'),
        c.resolve<ReplServer>('ReplServer')
      )
  )

  const shellApp = container.resolve<ShellApp>('ShellApp')

  await shellApp.start()
}
