import { DIContainer, randomIdent } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateMessageData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  HttpBody,
  HttpHeaders,
  HttpRequestCookies,
  HttpResponseCookies,
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawMessage } from './message.functions.js'
import {
  messageHeadersSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema,
  rawMessageSchema
} from './message.schemas.js'

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

    this.validator.addSchemas({
      'database-raw-message': rawMessageSchema,
      'database-message-headers': messageHeadersSchema,
      'database-message-request-cookies': messageRequestCookiesSchema,
      'database-message-response-cookies': messageResponseCookiesSchema
    })

    this.logger.debug(`MessageRepository initialized`)
  }

  async createMessage(data: CreateMessageData): Promise<string> {
    try {
      const messageId = randomIdent()

      const status = await this.connection.message.create_message(
        this.options.prefix,
        data.campaignId,
        messageId,
        data.proxyId,
        data.targetId,
        data.sessionId,
        data.method,
        data.originUrl,
        data.urlPath,
        data.urlQuery,
        data.urlHash,
        data.requestHeaders,
        data.requestCookies,
        data.requestBody,
        data.status,
        data.responseHeaders,
        data.responseCookies,
        data.responseBody,
        data.clientIp,
        data.score,
        data.queryTime
      )

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      this.logger.info(message, { messageId })

      return messageId
    } catch (error) {
      this.handleException(error, 'createMessage', {
        ...data,
        requestBody: data.requestBody.length,
        responseBody: data.responseBody.length
      })
    }
  }

  async readMessage(data: ReadMessageData): Promise<MessageModel | null> {
    try {
      const rawMessage = await this.connection.message.read_message(
        this.options.prefix,
        data.campaignId,
        data.messageId
      )

      return this.buildMessageModel(rawMessage)
    } catch (error) {
      this.handleException(error, 'readMessage', data)
    }
  }

  protected parseMessageHeaders(value: string): HttpHeaders {
    try {
      const headers: unknown = JSON.parse(value)

      this.validator.assertSchema<HttpHeaders>('database-message-headers', headers)

      return headers
    } catch (error) {
      throw new DatabaseError(`HttpHeaders parse failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected parseMessageBody(value: string): HttpBody {
    try {
      return Buffer.from(value, 'base64')
    } catch (error) {
      throw new DatabaseError(`HttpBody parse failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected parseMessageRequestCookies(value: string): HttpRequestCookies {
    try {
      const cookies: unknown = JSON.parse(value)

      this.validator.assertSchema<HttpRequestCookies>('database-message-request-cookies', cookies)

      return cookies
    } catch (error) {
      throw new DatabaseError(`HttpRequestCookies parse failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected parseMessageResponseCookies(value: string): HttpResponseCookies {
    try {
      const cookies: unknown = JSON.parse(value)

      this.validator.assertSchema<HttpResponseCookies>('database-message-response-cookies', cookies)

      return cookies
    } catch (error) {
      throw new DatabaseError(`HttpResponseCookies parse failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected buildMessageModel(rawMessage: unknown): MessageModel | null {
    if (rawMessage === null) {
      return null
    }

    this.validateRawMessage(rawMessage)

    return {
      campaignId: rawMessage.campaign_id,
      messageId: rawMessage.message_id,
      proxyId: rawMessage.proxy_id,
      targetId: rawMessage.target_id,
      sessionId: rawMessage.session_id,
      method: rawMessage.method,
      originUrl: rawMessage.origin_url,
      urlPath: rawMessage.url_path,
      urlQuery: rawMessage.url_query,
      urlHash: rawMessage.url_hash,
      requestHeaders: this.parseMessageHeaders(rawMessage.request_headers),
      requestCookies: this.parseMessageRequestCookies(rawMessage.request_cookies),
      requestBody: this.parseMessageBody(rawMessage.request_body),
      status: rawMessage.status,
      responseHeaders: this.parseMessageHeaders(rawMessage.response_headers),
      responseCookies: this.parseMessageResponseCookies(rawMessage.response_cookies),
      responseBody: this.parseMessageBody(rawMessage.request_body),
      clientIp: rawMessage.client_ip,
      score: rawMessage.score,
      queryTime: rawMessage.query_time,
      createdAt: new Date(rawMessage.created_at)
    }
  }

  protected buildMessageCollection(rawMessages: unknown): Array<MessageModel | null> {
    this.validateArrayReply(rawMessages)

    return rawMessages.map((rawMessage) => this.buildMessageModel(rawMessage))
  }

  protected validateRawMessage(value: unknown): asserts value is RawMessage {
    try {
      this.validator.assertSchema<RawMessage>('database-raw-message', value)
    } catch (error) {
      throw new DatabaseError(`RawMessage validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected guardMessageModel(value: MessageModel | null): value is MessageModel {
    return value != null
  }

  protected assertMessageModel(value: MessageModel | null): asserts value is MessageModel {
    if (!this.guardMessageModel(value)) {
      throw new DatabaseError(`MessageModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
