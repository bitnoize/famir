import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import { DATABASE_CONNECTOR, DatabaseConnector, RedisDatabaseConfig } from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'
import { MESSAGE_REPOSITORY, MessageRepository } from './message.js'
import { FullMessageModel, MessageModel } from './message.models.js'
import { messageSchemas } from './message.schemas.js'

/**
 * Redis message repository implementation.
 *
 * @category Message
 */
export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  /**
   * Register message repository instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      MESSAGE_REPOSITORY,
      (c) =>
        new RedisMessageRepository(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new message repository instance.
   *
   * @param validator - The validator instance
   * @param config - The database config instance
   * @param logger - The logger instance
   * @param connector - The database connector instance
   */
  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connector: DatabaseConnector
  ) {
    super(validator, config, logger, connector, 'message')

    this.validator.addSchemas(messageSchemas)

    this.logger.debug(`MessageRepository initialized`)
  }

  async create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    status: number,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    connection: HttpConnection,
    payload: HttpPayload,
    errors: HttpError[],
    analyze: string,
    startTime: number,
    finishTime: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.message.create_message(
        this.options.prefix,
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId,
        type,
        method,
        url,
        this.encodeJson(requestHeaders),
        this.encodeBase64(requestBody),
        status,
        this.encodeJson(responseHeaders),
        this.encodeBase64(responseBody),
        this.encodeJson(connection),
        this.encodeJson(payload),
        this.encodeJson(errors),
        analyze,
        startTime,
        finishTime,
        Date.now()
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, messageId, proxyId, targetId, sessionId })
    }
  }

  async createDummy(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.message.create_dummy_message(
        this.options.prefix,
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'createDummy', { campaignId, messageId, proxyId, targetId, sessionId })
    }
  }

  async read(campaignId: string, messageId: string): Promise<MessageModel | null> {
    try {
      const rawModel = await this.connection.message.read_message(
        this.options.prefix,
        campaignId,
        messageId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, messageId })
    }
  }

  async readFull(campaignId: string, messageId: string): Promise<FullMessageModel | null> {
    try {
      const rawModel = await this.connection.message.read_full_message(
        this.options.prefix,
        campaignId,
        messageId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'readFull', { campaignId, messageId })
    }
  }

  /**
   * Converts raw Redis data to a message model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The message model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildModel(rawModel: unknown): MessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawMessage>('database-raw-message', rawModel)

    return new MessageModel(
      rawModel.campaign_id,
      rawModel.message_id,
      rawModel.proxy_id,
      rawModel.target_id,
      rawModel.session_id,
      rawModel.type,
      rawModel.method,
      rawModel.url,
      rawModel.status,
      rawModel.analyze,
      rawModel.start_time,
      rawModel.finish_time,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts raw Redis data to a full message model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The full message model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildFullModel(rawModel: unknown): FullMessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawFullMessage>('database-raw-full-message', rawModel)

    return new FullMessageModel(
      rawModel.campaign_id,
      rawModel.message_id,
      rawModel.proxy_id,
      rawModel.target_id,
      rawModel.session_id,
      rawModel.type,
      rawModel.method,
      rawModel.url,
      this.parseHeaders(rawModel.request_headers),
      this.decodeBase64(rawModel.request_body),
      rawModel.status,
      this.parseHeaders(rawModel.response_headers),
      this.decodeBase64(rawModel.response_body),
      this.parseConnection(rawModel.connection),
      this.parsePayload(rawModel.payload),
      this.parseErrors(rawModel.errors),
      rawModel.analyze,
      rawModel.start_time,
      rawModel.finish_time,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Parses a JSON string to HTTP headers object.
   *
   * @param value - The JSON string to parse
   * @returns The HTTP headers object
   * @throws {@link DatabaseError} If parsing fails
   * @internal
   */
  protected parseHeaders(value: string): HttpHeaders {
    const data = this.decodeJson(value)

    this.validateRawData<HttpHeaders>('database-message-headers', data)

    return data
  }

  /**
   * Parses a JSON string to HTTP connection object.
   *
   * @param value - The JSON string to parse
   * @returns The HTTP connection object
   * @throws {@link DatabaseError} If parsing fails
   * @internal
   */
  protected parseConnection(value: string): HttpConnection {
    const data = this.decodeJson(value)

    this.validateRawData<HttpConnection>('database-message-connection', data)

    return data
  }

  /**
   * Parses a JSON string to HTTP payload object.
   *
   * @param value - The JSON string to parse
   * @returns The HTTP payload object
   * @throws {@link DatabaseError} If parsing fails
   * @internal
   */
  protected parsePayload(value: string): HttpPayload {
    const data = this.decodeJson(value)

    this.validateRawData<HttpPayload>('database-message-payload', data)

    return data
  }

  /**
   * Parses a JSON string to HTTP errors object.
   *
   * @param value - The JSON string to parse
   * @returns The HTTP errors object
   * @throws {@link DatabaseError} If parsing fails
   * @internal
   */
  protected parseErrors(value: string): HttpError[] {
    const data = this.decodeJson(value)

    this.validateRawData<HttpError[]>('database-message-errors', data)

    return data
  }
}
