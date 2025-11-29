import { DIContainer, randomIdent } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateMessageData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  FullMessageModel,
  HttpBody,
  HttpHeaders,
  HttpLog,
  HttpRequestCookies,
  HttpResponseCookies,
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  ReadMessageData,
  testMessageModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'
import {
  messageHeadersSchema,
  messageLogsSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema,
  rawFullMessageSchema,
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
      'database-raw-full-message': rawFullMessageSchema,
      'database-message-headers': messageHeadersSchema,
      'database-message-request-cookies': messageRequestCookiesSchema,
      'database-message-response-cookies': messageResponseCookiesSchema,
      'database-message-logs': messageLogsSchema
    })
  }

  async createMessage(data: CreateMessageData): Promise<MessageModel> {
    try {
      const messageId = randomIdent()

      const [status, rawValue] = await Promise.all([
        this.connection.message.create_message(
          this.options.prefix,
          data.campaignId,
          messageId,
          data.proxyId,
          data.targetId,
          data.sessionId,
          data.method,
          data.url,
          data.isStreaming,
          data.requestHeaders,
          data.requestCookies,
          data.requestBody,
          data.responseHeaders,
          data.responseCookies,
          data.responseBody,
          data.clientIp,
          data.status,
          data.score,
          data.startTime,
          data.finishTime,
          data.logs
        ),

        this.connection.message.read_message(this.options.prefix, data.campaignId, messageId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const messageModel = this.buildMessageModel(rawValue)

      this.existsMessageModel(messageModel)

      this.logger.info(message, { messageModel })

      return messageModel
    } catch (error) {
      this.handleException(error, 'createMessage', {
        ...data,
        requestBody: data.requestBody.length,
        responseBody: data.responseBody.length
      })
    }
  }

  async readMessage(data: ReadMessageData): Promise<FullMessageModel | null> {
    try {
      const rawValue = await this.connection.message.read_full_message(
        this.options.prefix,
        data.campaignId,
        data.messageId
      )

      return this.buildFullMessageModel(rawValue)
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

  protected parseMessageLogs(value: string): HttpLog[] {
    try {
      const logs: unknown = JSON.parse(value)

      this.validator.assertSchema<HttpLog[]>('database-message-logs', logs)

      return logs
    } catch (error) {
      throw new DatabaseError(`HttpLogs parse failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected buildMessageModel(rawValue: unknown): MessageModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawMessage(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      messageId: rawValue.message_id,
      proxyId: rawValue.proxy_id,
      targetId: rawValue.target_id,
      sessionId: rawValue.session_id,
      method: rawValue.method,
      url: rawValue.url,
      isStreaming: !!rawValue.is_streaming,
      status: rawValue.status,
      score: rawValue.score,
      startTime: rawValue.start_time,
      finishTime: rawValue.finish_time,
      createdAt: new Date(rawValue.created_at)
    }
  }

  protected buildFullMessageModel(rawValue: unknown): FullMessageModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawFullMessage(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      messageId: rawValue.message_id,
      proxyId: rawValue.proxy_id,
      targetId: rawValue.target_id,
      sessionId: rawValue.session_id,
      method: rawValue.method,
      url: rawValue.url,
      isStreaming: !!rawValue.is_streaming,
      requestHeaders: this.parseMessageHeaders(rawValue.request_headers),
      requestCookies: this.parseMessageRequestCookies(rawValue.request_cookies),
      requestBody: this.parseMessageBody(rawValue.request_body),
      responseHeaders: this.parseMessageHeaders(rawValue.response_headers),
      responseCookies: this.parseMessageResponseCookies(rawValue.response_cookies),
      responseBody: this.parseMessageBody(rawValue.response_body),
      clientIp: rawValue.client_ip,
      status: rawValue.status,
      score: rawValue.score,
      startTime: rawValue.start_time,
      finishTime: rawValue.finish_time,
      logs: this.parseMessageLogs(rawValue.logs),
      createdAt: new Date(rawValue.created_at)
    }
  }

  protected buildMessageCollection(rawValues: unknown): Array<MessageModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildMessageModel(rawValue))
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

  protected validateRawFullMessage(value: unknown): asserts value is RawFullMessage {
    try {
      this.validator.assertSchema<RawFullMessage>('database-raw-full-message', value)
    } catch (error) {
      throw new DatabaseError(`RawFullMessage validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsMessageModel<T extends MessageModel>(value: T | null): asserts value is T {
    if (!testMessageModel(value)) {
      throw new DatabaseError(`MessageModel not exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
