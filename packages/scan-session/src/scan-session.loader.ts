import { DIContainer } from '@famir/common'
import { Config, EnvConfig } from '@famir/config'
import {
  DatabaseConnector,
  RedisCampaignRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector
} from '@famir/database'
import { CampaignRepository } from '@famir/domain'
import { Logger, PinoLogger } from '@famir/logger'
import {
  BullScanSessionManager,
  BullScanSessionWorker,
  BullTaskWorkerConnection,
  BullTaskWorkerConnector,
  ScanSessionManager,
  ScanSessionWorker,
  TaskWorkerConnector
} from '@famir/task-worker'
import { AjvValidator, Validator } from '@famir/validator'
import { ScanSessionApp } from './scan-session.app.js'
import { ScanSessionConfig } from './scan-session.js'
import { configScanSessionSchema } from './scan-session.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<ScanSessionConfig>>(
    'Config',
    (c) =>
      new EnvConfig<ScanSessionConfig>(c.resolve<Validator>('Validator'), configScanSessionSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanSessionConfig>>('Config')
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
        c.resolve<Config<ScanSessionConfig>>('Config'),
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

  //
  // TaskWorker
  //

  container.registerSingleton<TaskWorkerConnector>(
    'TaskWorkerConnector',
    (c) =>
      new BullTaskWorkerConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanSessionConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ScanSessionManager>(
    'ScanSessionManager',
    () => new BullScanSessionManager()
  )

  container.registerSingleton<ScanSessionWorker>(
    'ScanSessionWorker',
    (c) =>
      new BullScanSessionWorker(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<ScanSessionConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c
          .resolve<TaskWorkerConnector>('TaskWorkerConnector')
          .connection<BullTaskWorkerConnection>(),
        c.resolve<ScanSessionManager>('ScanSessionManager')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<ScanSessionApp>(
    'ScanSessionApp',
    (c) =>
      new ScanSessionApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<TaskWorkerConnector>('TaskWorkerConnector'),
        c.resolve<ScanSessionWorker>('ScanSessionWorker')
      )
  )

  const heartbeatApp = container.resolve<ScanSessionApp>('ScanSessionApp')

  await heartbeatApp.start()
}
