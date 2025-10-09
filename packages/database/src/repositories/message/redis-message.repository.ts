import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateMessageModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { addSchemas, assertModel, buildModel } from './message.utils.js'

export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      MESSAGE_REPOSITORY,
      (c) =>
        new RedisMessageRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<DatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'message')

    validator.addSchemas(addSchemas)
  }

  async create(data: CreateMessageModel): Promise<MessageModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.message.create_message(
          this.options.prefix,
          data.campaignId,
          data.messageId,
          data.proxyId,
          data.targetId,
          data.sessionId,
          data.clientIp,
          data.method,
          data.originUrl,
          data.forwardUrl,
          data.requestHeaders,
          data.requestCookies,
          data.requestBody,
          data.statusCode,
          data.responseHeaders,
          data.responseCookies,
          data.responseBody,
          data.queryTime,
          data.score
        ),

        this.connection.message.read_message(this.options.prefix, data.campaignId, data.messageId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(this.assertSchema, raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  async read(data: ReadMessageModel): Promise<MessageModel | null> {
    try {
      const raw = await this.connection.message.read_message(
        this.options.prefix,
        data.campaignId,
        data.messageId
      )

      return buildModel(this.assertSchema, raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }
}
