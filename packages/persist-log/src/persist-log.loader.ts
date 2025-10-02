import { DIContainer } from '@famir/common'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector,
  RedisMessageRepository,
  RedisSessionRepository,
  RedisTargetRepository
} from '@famir/database'
import {
  AnalyzeLogQueue,
  CampaignRepository,
  Config,
  DatabaseConnector,
  ExecutorConnector,
  ExecutorDispatcher,
  Logger,
  MessageRepository,
  PersistLogWorker,
  SessionRepository,
  Storage,
  TargetRepository,
  Validator,
  WorkflowConnector
} from '@famir/domain'
import {
  BullExecutorConnection,
  BullExecutorConnector,
  BullExecutorDispatcher,
  BullPersistLogWorker
} from '@famir/executor'
import { PinoLogger } from '@famir/logger'
import { MinioStorage } from '@famir/storage'
import { AjvValidator } from '@famir/validator'
import { BullAnalyzeLogQueue, BullWorkflowConnection, BullWorkflowConnector } from '@famir/workflow'
import { PersistLogApp } from './persist-log.app.js'
import { PersistLogConfig } from './persist-log.js'
import { configPersistLogSchema } from './persist-log.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<PersistLogConfig>>(
    'Config',
    (c) =>
      new EnvConfig<PersistLogConfig>(c.resolve<Validator>('Validator'), configPersistLogSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config')
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
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<CampaignRepository>(
    'CampaignRepository',
    (c) =>
      new RedisCampaignRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<TargetRepository>(
    'TargetRepository',
    (c) =>
      new RedisTargetRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<SessionRepository>(
    'SessionRepository',
    (c) =>
      new RedisSessionRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<MessageRepository>(
    'MessageRepository',
    (c) =>
      new RedisMessageRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  //
  // Storage
  //

  container.registerSingleton<Storage>(
    'Storage',
    (c) =>
      new MinioStorage(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
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
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<AnalyzeLogQueue>(
    'AnalyzeLogQueue',
    (c) =>
      new BullAnalyzeLogQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<WorkflowConnector>('WorkflowConnector').connection<BullWorkflowConnection>()
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
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ExecutorDispatcher>(
    'ExecutorDispatcher',
    (c) => new BullExecutorDispatcher(c.resolve<Logger>('Logger'))
  )

  container.registerSingleton<PersistLogWorker>(
    'PersistLogWorker',
    (c) =>
      new BullPersistLogWorker(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<PersistLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<ExecutorConnector>('ExecutorConnector').connection<BullExecutorConnection>(),
        c.resolve<ExecutorDispatcher>('ExecutorDispatcher')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<PersistLogApp>(
    'PersistLogApp',
    (c) =>
      new PersistLogApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<WorkflowConnector>('WorkflowConnector'),
        c.resolve<AnalyzeLogQueue>('AnalyzeLogQueue'),
        c.resolve<ExecutorConnector>('ExecutorConnector'),
        c.resolve<PersistLogWorker>('PersistLogWorker')
      )
  )

  const app = container.resolve<PersistLogApp>('PersistLogApp')

  await app.start()
}
