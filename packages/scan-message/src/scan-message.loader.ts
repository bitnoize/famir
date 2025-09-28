import { DIContainer } from '@famir/common'
import {
  Config,
  DatabaseConnector,
  CampaignRepository,
  MessageRepository,
  Logger,
  ScanMessageManager,
  ScanMessageWorker,
  ExecutorConnector,
  Validator
} from '@famir/domain'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisMessageRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import {
  BullScanMessageManager,
  BullScanMessageWorker,
  BullExecutorConnection,
  BullExecutorConnector,
} from '@famir/task-worker'
import { AjvValidator } from '@famir/validator'
import { ScanMessageApp } from './scan-message.app.js'
import { ScanMessageConfig } from './scan-message.js'
import { configScanMessageSchema } from './scan-message.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<ScanMessageConfig>>(
    'Config',
    (c) =>
      new EnvConfig<ScanMessageConfig>(c.resolve<Validator>('Validator'), configScanMessageSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanMessageConfig>>('Config')
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
        c.resolve<Config<ScanMessageConfig>>('Config'),
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
  // Executor
  //

  container.registerSingleton<ExecutorConnector>(
    'ExecutorConnector',
    (c) =>
      new BullExecutorConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanMessageConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanMessageManager>(
    'ScanMessageManager',
    (c) =>
      new BullScanMessageManager(
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanMessageWorker>(
    'ScanMessageWorker',
    (c) =>
      new BullScanMessageWorker(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanMessageConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c
          .resolve<ExecutorConnector>('ExecutorConnector')
          .connection<BullExecutorConnection>(),
        c.resolve<ScanMessageManager>('ScanMessageManager')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<ScanMessageApp>(
    'ScanMessageApp',
    (c) =>
      new ScanMessageApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<ExecutorConnector>('ExecutorConnector'),
        c.resolve<ScanMessageWorker>('ScanMessageWorker')
      )
  )

  const heartbeatApp = container.resolve<ScanMessageApp>('ScanMessageApp')

  await heartbeatApp.start()
}
