import { DIContainer } from '@famir/common'
import { DATABASE_MANAGER, DatabaseManager } from '@famir/database'
import { EDGE_SERVER, EdgeServer, EdgeServerInfo } from '@famir/edge-server'
import { ANALYZE_QUEUE, AnalyzeQueue, WEBHOOK_QUEUE, WebhookQueue } from '@famir/producer'

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
          c.resolve<EdgeServer>(EDGE_SERVER)
        )
    )
  }

  /**
   * Creates a new service instance.
   *
   * @param databaseManager - The database manager instance.
   * @param analyzeQueue - The analyze queue instance.
   * @param webhookQueue - The webhook queue instance.
   * @param edgeServer - The edge server instance.
   */
  constructor(
    protected readonly databaseManager: DatabaseManager,
    protected readonly analyzeQueue: AnalyzeQueue,
    protected readonly webhookQueue: WebhookQueue,
    protected readonly edgeServer: EdgeServer
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

  /**
   * Get edge server info.
   */
  async getEdgeServerInfo(): Promise<EdgeServerInfo> {
    return await this.edgeServer.getInfo()
  }
}
