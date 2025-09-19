import {
  Config,
  DatabaseError,
  Logger,
  MessageHeaders,
  MessageModel,
  MessageRepository,
  MessageRequestCookies,
  MessageResponseCookies,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertMessage, buildMessageModel } from './message.utils.js'

export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'message')
  }

  async create(
    campaignId: string,
    id: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    clientIp: string,
    method: string,
    originUrl: string,
    forwardUrl: string,
    requestHeaders: MessageHeaders,
    requestCookies: MessageRequestCookies,
    requestBody: Buffer,
    statusCode: number,
    responseHeaders: MessageHeaders,
    responseCookies: MessageResponseCookies,
    responseBody: Buffer,
    queryTime: number,
    score: number
  ): Promise<MessageModel> {
    try {
      const [status, rawMessage] = await Promise.all([
        this.connection.message.create_message(
          this.options.prefix,
          campaignId,
          id,
          proxyId,
          targetId,
          sessionId,
          clientIp,
          method,
          originUrl,
          forwardUrl,
          requestHeaders,
          requestCookies,
          requestBody,
          statusCode,
          responseHeaders,
          responseCookies,
          responseBody,
          queryTime,
          score
        ),

        this.connection.message.read_message(this.options.prefix, campaignId, id)
      ])

      const [code, reason] = parseStatusReply(status)

      if (code === 'OK') {
        const message = buildMessageModel(this.assertSchema, rawMessage)

        assertMessage(message)

        return message
      }

      throw new DatabaseError(reason, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        campaignId,
        id,
        proxyId,
        targetId,
        sessionId
      })
    }
  }

  async read(campaignId: string, id: string): Promise<MessageModel | null> {
    try {
      const rawMessage = await this.connection.message.read_message(
        this.options.prefix,
        campaignId,
        id
      )

      return buildMessageModel(this.assertSchema, rawMessage)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }
}
