import { DIContainer } from '@famir/common'
import {
  Config,
  DatabaseConnector,
  CampaignRepository,
  SessionRepository,
  TargetRepository,
  MessageRepository,
  Logger,
  Storage,
  ExecutorDispatcher,
  AnalyzeLogWorker,
  ExecutorConnector,
  WorkflowConnector,
  Validator
} from '@famir/domain'
import { EnvConfig } from '@famir/config'
import {
  RedisCampaignRepository,
  RedisSessionRepository,
  RedisTargetRepository,
  RedisMessageRepository,
  RedisDatabaseConnection,
  RedisDatabaseConnector
} from '@famir/database'
import { PinoLogger } from '@famir/logger'
import {
  BullExecutorDispatcher,
  BullAnalyzeLogWorker,
  BullExecutorConnection,
  BullExecutorConnector,
} from '@famir/executor'
import {
  BullAnalyzeLogQueue,
  BullWorkflowConnection,
  BullWorkflowConnector,
} from '@famir/workflow'
import { AjvValidator } from '@famir/validator'
import { MinioStorage } from '@famir/storage'
import { AnalyzeLogApp } from './analyze-log.app.js'
import { AnalyzeLogConfig } from './analyze-log.js'
import { configAnalyzeLogSchema } from './analyze-log.schemas.js'

export async function bootstrap(composer: (container: DIContainer) => void): Promise<void> {
  const container = new DIContainer()

  //
  // Validator
  //

  container.registerSingleton<Validator>('Validator', () => new AjvValidator())

  //
  // Config
  //

  container.registerSingleton<Config<AnalyzeLogConfig>>(
    'Config',
    (c) =>
      new EnvConfig<AnalyzeLogConfig>(c.resolve<Validator>('Validator'), configScanMessageSchema)
  )

  //
  // Logger
  //

  container.registerSingleton<Logger>(
    'Logger',
    (c) =>
      new PinoLogger(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config')
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
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<CampaignRepository>(
    'CampaignRepository',
    (c) =>
      new RedisCampaignRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<TargetRepository>(
    'TargetRepository',
    (c) =>
      new RedisTargetRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<SessionRepository>(
    'SessionRepository',
    (c) =>
      new RedisSessionRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
      )
  )

  container.registerSingleton<MessageRepository>(
    'MessageRepository',
    (c) =>
      new RedisMessageRepository(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
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
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
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
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<AnalyzeLogQueue>(
    'AnalyzeLogQueue',
    (c) =>
      new BullAnalyzeLogQueue(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c
          .resolve<WorkflowConnector>('WorkflowConnector')
          .connection<BullWorkflowConnection>(),
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
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<ExecutorDispatcher>(
    'ExecutorDispatcher',
    (c) =>
      new BullExecutorRouter(
        c.resolve<Logger>('Logger')
      )
  )

  container.registerSingleton<AnalyzeLogWorker>(
    'AnalyzeLogWorker',
    (c) =>
      new BullAnalyzeLogWorker(
        c.resolve<Validator>('Validator'),
        c.resolve<Config<AnalyzeLogConfig>>('Config'),
        c.resolve<Logger>('Logger'),
        c
          .resolve<ExecutorConnector>('ExecutorConnector')
          .connection<BullExecutorConnection>(),
        c.resolve<ExecutorRouter>('ExecutorRouter')
      )
  )

  //
  // Modules
  //

  composer(container)

  //
  // Application
  //

  container.registerSingleton<AnalyzeLogApp>(
    'AnalyzeLogApp',
    (c) =>
      new AnalyzeLogApp(
        c.resolve<Validator>('Validator'),
        c.resolve<Logger>('Logger'),
        c.resolve<DatabaseConnector>('DatabaseConnector'),
        c.resolve<ExecutorConnector>('ExecutorConnector'),
        c.resolve<AnalyzeLogWorker>('AnalyzeLogWorker')
      )
  )

  const app = container.resolve<AnalyzeLogApp>('AnalyzeLogApp')

  await app.start()
}
