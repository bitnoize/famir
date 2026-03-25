import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { AnalyzeJobData } from '../../jobs/index.js'
import {
  BullProduceConfig,
  PRODUCE_CONNECTOR,
  ProduceConnector,
  RedisProduceConnection
} from '../../produce.js'
import { BullBaseQueue } from '../base/index.js'
import { ANALYZE_QUEUE, ANALYZE_QUEUE_NAME, AnalyzeQueue } from './analyze.js'

export class BullAnalyzeQueue extends BullBaseQueue implements AnalyzeQueue {
  static inject(container: DIContainer) {
    container.registerSingleton<AnalyzeQueue>(
      ANALYZE_QUEUE,
      (c) =>
        new BullAnalyzeQueue(
          c.resolve<Config<BullProduceConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ProduceConnector>(PRODUCE_CONNECTOR).connection<RedisProduceConnection>()
        )
    )
  }

  constructor(
    config: Config<BullProduceConfig>,
    logger: Logger,
    connection: RedisProduceConnection
  ) {
    super(config, logger, connection, ANALYZE_QUEUE_NAME)

    this.logger.debug(`AnalyzeQueue initialized`)
  }

  async addJob(name: string, data: AnalyzeJobData): Promise<void> {
    try {
      const jobId = [data.campaignId, data.messageId].join('-')

      await this.queue.add(name, data, {
        jobId
      })
    } catch (error) {
      this.raiseError(error, 'addJob', data)
    }
  }
}
