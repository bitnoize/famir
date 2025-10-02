import { DIContainer } from '@famir/common'
import {
  Config,
  CreateMessageData,
  DatabaseConnector,
  DatabaseError,
  Logger,
  MessageModel,
  MessageRepository,
  ReadMessageData,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertModel, buildModel } from './message.utils.js'

export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  static inject<C extends DatabaseConfig>(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      'MessageRepository',
      (c) =>
        new RedisMessageRepository(
          c.resolve<Validator>('Validator'),
          c.resolve<Config<C>>('Config'),
          c.resolve<Logger>('Logger'),
          c.resolve<DatabaseConnector>('DatabaseConnector').connection<RedisDatabaseConnection>()
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
  }

  async create(data: CreateMessageData): Promise<MessageModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.message.create_message(
          this.options.prefix,
          data.campaignId,
          data.id,
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

        this.connection.message.read_message(this.options.prefix, data.campaignId, data.id)
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

  async read(data: ReadMessageData): Promise<MessageModel | null> {
    try {
      const raw = await this.connection.message.read_message(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(this.assertSchema, raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }
}
