import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import {
  HttpBody,
  HttpConnection,
  httpConnectionSchema,
  HttpError,
  httpErrorsSchema,
  HttpHeaders,
  httpHeadersSchema,
  HttpMethod,
  HttpPayload,
  httpPayloadSchema,
  HttpType,
} from '@famir/http-proto'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'
import { MESSAGE_REPOSITORY, MessageRepository } from './message.js'
import { FullMessageModel, MessageModel } from './message.models.js'
import { rawFullMessageSchema, rawMessageSchema } from './message.schemas.js'

/**
 * Redis-based message repository implementation.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link DatabaseConnector} via {@link DATABASE_CONNECTOR} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { MESSAGE_REPOSITORY, MessageRepository, RedisMessageRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisMessageRepository.register(container)
 *
 * // Resolve dependency from container
 * const messageRepository = container.resolve<MessageRepository>(MESSAGE_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Message
 */
export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  /**
   * Registers the message repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      MESSAGE_REPOSITORY,
      (c) =>
        new RedisMessageRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new message repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'message')

    this.validator
      .addSchema('database-raw-message', rawMessageSchema)
      .addSchema('database-raw-full-message', rawFullMessageSchema)
      .addSchema('database-message-headers', httpHeadersSchema)
      .addSchema('database-message-connection', httpConnectionSchema)
      .addSchema('database-message-payload', httpPayloadSchema)
      .addSchema('database-message-errors', httpErrorsSchema)
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.handleRepositoryError(error, 'create', {
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId,
      })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.handleRepositoryError(error, 'createDummy', {
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId,
      })
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
      this.handleRepositoryError(error, 'read', { campaignId, messageId })
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
      this.handleRepositoryError(error, 'readFull', { campaignId, messageId })
    }
  }

  /**
   * Converts raw Redis data to a message model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The message model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): MessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawMessage>('database-raw-message', rawModel)

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
   * @param rawModel - The raw data from Redis.
   * @returns The full message model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildFullModel(rawModel: unknown): FullMessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawFullMessage>('database-raw-full-message', rawModel)

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
   * Decodes a JSON string to an HTTP headers object.
   *
   * @param value - The JSON string to decode.
   * @returns The HTTP headers object.
   * @throws {@link DatabaseError} If decoding or validation fails.
   */
  protected parseHeaders(value: string): HttpHeaders {
    const data = this.decodeJson(value)

    this.validateReply<HttpHeaders>('database-message-headers', data)

    return data
  }

  /**
   * Decodes a JSON string to a connection details object.
   *
   * @param value - The JSON string to decode.
   * @returns The connection details object.
   * @throws {@link DatabaseError} If decoding or validation fails.
   */
  protected parseConnection(value: string): HttpConnection {
    const data = this.decodeJson(value)

    this.validateReply<HttpConnection>('database-message-connection', data)

    return data
  }

  /**
   * Decodes a JSON string to a payload data object.
   *
   * @param value - The JSON string to decode.
   * @returns The payload data object.
   * @throws {@link DatabaseError} If decoding or validation fails.
   */
  protected parsePayload(value: string): HttpPayload {
    const data = this.decodeJson(value)

    this.validateReply<HttpPayload>('database-message-payload', data)

    return data
  }

  /**
   * Decodes a JSON string to a list of error objects.
   *
   * @param value - The JSON string to decode.
   * @returns The array of error objects.
   * @throws {@link DatabaseError} If decoding or validation fails.
   */
  protected parseErrors(value: string): HttpError[] {
    const data = this.decodeJson(value)

    this.validateReply<HttpError[]>('database-message-errors', data)

    return data
  }
}
