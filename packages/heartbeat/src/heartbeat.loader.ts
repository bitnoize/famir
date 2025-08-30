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
  BullScanMessageQueue,
  BullScanSessionQueue,
  BullTaskQueueConnection,
  BullTaskQueueConnector,
  ScanMessageQueue,
  ScanSessionQueue,
  TaskQueueConnector
} from '@famir/task-queue'
import {
  BullHeartbeatWorker,
  BullTaskWorkerConnection,
  BullTaskWorkerConnector,
  HeartbeatDispatcher,
  HeartbeatWorker,
  TaskWorkerConnector
} from '@famir/task-worker'
import { AjvValidator, Validator } from '@famir/validator'
import { HeartbeatApp } from './heartbeat.app.js'
import { HeartbeatConfig } from './heartbeat.js'
import { configHeartbeatSchema } from './heartbeat.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<HeartbeatConfig>>(
    'Config',
    (c) => new EnvConfig<HeartbeatConfig>(c.resolve<Validator>('Validator'), configHeartbeatSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<HeartbeatConfig>>('Config')
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
        c.resolve<Config<HeartbeatConfig>>('Config'),
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
  // TaskQueue
  //

  container.registerSingleton<TaskQueueConnector>(
    'TaskQueueConnector',
    (c) =>
      new BullTaskQueueConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<HeartbeatConfig>>('Config'),
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
  // TaskWorker
  //

  container.registerSingleton<TaskWorkerConnector>(
    'TaskWorkerConnector',
    (c) =>
      new BullTaskWorkerConnector(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<HeartbeatConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<HeartbeatDispatcher>(
    'HeartbeatDispatcher',
    () => new HeartbeatDispatcher()
  )

  container.registerSingleton<HeartbeatWorker>(
    'HeartbeatWorker',
    (c) =>
      new BullHeartbeatWorker(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<HeartbeatConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c
          .resolve<TaskWorkerConnector>('TaskWorkerConnector')
          .connection<BullTaskWorkerConnection>(),
        c.resolve<HeartbeatDispatcher>('HeartbeatDispatcher')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<HeartbeatApp>(
    'HeartbeatApp',
    (c) =>
      new HeartbeatApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<TaskQueueConnector>('TaskQueueConnector'),
        c.resolve<ScanSessionQueue>('ScanSessionQueue'),
        c.resolve<ScanMessageQueue>('ScanMessageQueue'),
        c.resolve<TaskWorkerConnector>('TaskWorkerConnector'),
        c.resolve<HeartbeatWorker>('HeartbeatWorker')
      )
  )

  const heartbeatApp = container.resolve<HeartbeatApp>('HeartbeatApp')

  await heartbeatApp.start()
}
