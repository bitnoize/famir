import { DIContainer } from '@famir/common'
import {
  ANALYZE_QUEUE,
  AnalyzeQueue,
  DATABASE_MANAGER,
  DatabaseManager,
  WEBHOOK_QUEUE,
  WebhookQueue,
} from '@famir/domain'

/**
 * DI token for the system service.
 *
 * @category System
 */
export const SYSTEM_SERVICE = Symbol('SystemService')

/**
 * Represents the system service.
 *
 * @category System
 */
export class SystemService {
  /**
   * Registers the service as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SystemService>(
      SYSTEM_SERVICE,
      (c) =>
        new SystemService(
          c.resolve<DatabaseManager>(DATABASE_MANAGER),
          c.resolve<AnalyzeQueue>(ANALYZE_QUEUE),
          c.resolve<WebhookQueue>(WEBHOOK_QUEUE),
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param databaseManager - The database manager instance.
   * @param analyzeQueue - The analyze queue instance.
   * @param webhookQueue - The webhook queue instance.
   */
  constructor(
    protected readonly databaseManager: DatabaseManager,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly webhookQueue: WebhookQueue,
  ) {}

  /**
   * Get database info.
   */
  async getDatabaseInfo(): Promise<string[]> {
    return await this.databaseManager.getInfo()
  }

  /**
   * Loads all custom functions into the database.
   */
  async loadDatabaseFunctions(): Promise<void> {
    await this.databaseManager.loadFunctions()
  }

  /**
   * Cleanup entire the database.
   */
  async cleanupDatabase(): Promise<void> {
    await this.databaseManager.cleanup()
  }

  /**
   * Gets producer info.
   */
  async getProducerInfo(): Promise<Record<string, unknown>> {
    return {
      analyze: {
        workers: await this.analyzeQueue.getWorkers(),
        jobCount: await this.analyzeQueue.getJobCount(),
      },
      webhook: {
        workers: await this.webhookQueue.getWorkers(),
        jobCount: await this.webhookQueue.getJobCount(),
      },
    }
  }
}
