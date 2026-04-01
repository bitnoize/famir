import {
  DIContainer,
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType
} from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConfig,
  RedisDatabaseConnection
} from '../../database.js'
import { FullMessageModel, MessageModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'
import { MESSAGE_REPOSITORY, MessageRepository } from './message.js'
import { messageSchemas } from './message.schemas.js'

/*
 * Redis message repository
 */
export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      MESSAGE_REPOSITORY,
      (c) =>
        new RedisMessageRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).getConnection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'message')

    this.validator.addSchemas(messageSchemas)

    this.logger.debug(`MessageRepository initialized`)
  }

  /*
   * Create message
   */
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
    processor: string,
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
        status.toString(),
        this.encodeJson(responseHeaders),
        this.encodeBase64(responseBody),
        this.encodeJson(connection),
        this.encodeJson(payload),
        this.encodeJson(errors),
        processor,
        startTime.toString(),
        finishTime.toString(),
        Date.now().toString()
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, messageId, proxyId, targetId, sessionId })
    }
  }

  /*
   * Create dummy message
   */
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

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'createDummy', { campaignId, messageId, proxyId, targetId, sessionId })
    }
  }

  /*
   * Read message by id
   */
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

  /*
   * Read extended message by id
   */
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

  protected buildModel(rawModel: unknown): MessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawMessage>('database-raw-message', rawModel)
    this.validateRawData<HttpType>('database-message-type', rawModel.type)
    this.validateRawData<HttpMethod>('database-message-method', rawModel.method)

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
      rawModel.processor,
      rawModel.start_time,
      rawModel.finish_time,
      new Date(rawModel.created_at)
    )
  }

  protected buildFullModel(rawModel: unknown): FullMessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawFullMessage>('database-raw-full-message', rawModel)
    this.validateRawData<HttpType>('database-message-type', rawModel.type)
    this.validateRawData<HttpMethod>('database-message-method', rawModel.method)

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
      rawModel.processor,
      rawModel.start_time,
      rawModel.finish_time,
      new Date(rawModel.created_at)
    )
  }

  protected parseHeaders(value: string): HttpHeaders {
    const data = this.decodeJson(value)

    this.validateRawData<HttpHeaders>('database-message-headers', data)

    return data
  }

  protected parseConnection(value: string): HttpConnection {
    const data = this.decodeJson(value)

    this.validateRawData<HttpConnection>('database-message-connection', data)

    return data
  }

  protected parsePayload(value: string): HttpPayload {
    const data = this.decodeJson(value)

    this.validateRawData<HttpPayload>('database-message-payload', data)

    return data
  }

  protected parseErrors(value: string): HttpError[] {
    const data = this.decodeJson(value)

    this.validateRawData<HttpError[]>('database-message-errors', data)

    return data
  }
}
