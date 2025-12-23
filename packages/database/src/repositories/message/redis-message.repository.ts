import { DIContainer, randomIdent } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  FullMessageModel,
  HttpBody,
  HttpConnection,
  HttpHeaders,
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageModel,
  MessageRepository,
  testMessageModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'
import {
  messageConnectionSchema,
  messageHeadersSchema,
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
      'database-message-connection': messageConnectionSchema
    })
  }

  async create(
    campaignId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    method: string,
    url: string,
    isStreaming: boolean,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    clientIp: string,
    status: number,
    score: number,
    startTime: number,
    finishTime: number,
    connection: HttpConnection
  ): Promise<MessageModel> {
    const messageId = randomIdent()

    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.message.create_message(
          this.options.prefix,
          campaignId,
          messageId,
          proxyId,
          targetId,
          sessionId,
          method,
          url,
          isStreaming,
          requestHeaders,
          requestBody,
          responseHeaders,
          responseBody,
          clientIp,
          status,
          score,
          startTime,
          finishTime,
          connection
        ),

        this.connection.message.read_message(this.options.prefix, campaignId, messageId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildMessageModel(rawValue)

      if (!testMessageModel(model)) {
        throw new DatabaseError(`Message lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { message: model })

      return model
    } catch (error) {
      this.handleException(error, 'create', {
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId
      })
    }
  }

  async read(campaignId: string, messageId: string): Promise<FullMessageModel | null> {
    try {
      const rawValue = await this.connection.message.read_full_message(
        this.options.prefix,
        campaignId,
        messageId
      )

      return this.buildFullMessageModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, messageId })
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

  protected parseMessageConnection(value: string): HttpConnection {
    try {
      const connection: unknown = JSON.parse(value)

      this.validator.assertSchema<HttpConnection>('database-message-connection', connection)

      return connection
    } catch (error) {
      throw new DatabaseError(`HttpConnection parse failed`, {
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
      requestBody: this.parseMessageBody(rawValue.request_body),
      responseHeaders: this.parseMessageHeaders(rawValue.response_headers),
      responseBody: this.parseMessageBody(rawValue.response_body),
      clientIp: rawValue.client_ip,
      status: rawValue.status,
      score: rawValue.score,
      startTime: rawValue.start_time,
      finishTime: rawValue.finish_time,
      connection: this.parseMessageConnection(rawValue.connection),
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
}
