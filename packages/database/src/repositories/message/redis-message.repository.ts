import {
  Config,
  DatabaseError,
  Logger,
  Message,
  MessageHeaders,
  MessageMethod,
  MessageRepository,
  MessageRequestCookies,
  MessageResponseCookies,
  RepositoryContainer,
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
    method: MessageMethod,
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
  ): Promise<RepositoryContainer<Message>> {
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

        return [true, message, code, reason]
      }

      const isKnownError = ['NOT_FOUND', 'CONFLICT'].includes(code)

      if (isKnownError) {
        return [false, null, code, reason]
      }

      throw new DatabaseError({ code }, reason)
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

  async read(campaignId: string, id: string): Promise<Message | null> {
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
