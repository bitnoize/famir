import { DIContainer, randomIdent } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  FullMessageModel,
  HttpBody,
  HttpConnection,
  HttpHeaders,
  Logger,
  LOGGER,
  MESSAGE_REPOSITORY,
  MessageRepository,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage } from './message.functions.js'
import { messageSchemas } from './message.schemas.js'

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

    this.validator.addSchemas(messageSchemas)

    this.logger.debug(`MessageRepository initialized`)
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
  ): Promise<string> {
    const messageId = randomIdent()

    try {
      const statusReply = await this.connection.message.create_message(
        this.options.prefix,
        campaignId,
        messageId,
        proxyId,
        targetId,
        sessionId,
        method,
        url,
        isStreaming,
        this.encodeJson(requestHeaders),
        this.encodeBase64(requestBody),
        this.encodeJson(responseHeaders),
        this.encodeBase64(responseBody),
        clientIp,
        status,
        score,
        startTime,
        finishTime,
        this.encodeJson(connection)
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })

      return messageId
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, messageId, proxyId, targetId, sessionId })
    }
  }

  async read(campaignId: string, messageId: string): Promise<FullMessageModel | null> {
    try {
      const rawFullModel = await this.connection.message.read_full_message(
        this.options.prefix,
        campaignId,
        messageId
      )

      return this.buildFullModel(rawFullModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, messageId })
    }
  }

  /*
  protected buildModel(rawModel: unknown): MessageModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawMessage>('database-raw-message', rawModel)

    return {
      campaignId: rawModel.campaign_id,
      messageId: rawModel.message_id,
      proxyId: rawModel.proxy_id,
      targetId: rawModel.target_id,
      sessionId: rawModel.session_id,
      method: rawModel.method,
      url: rawModel.url,
      isStreaming: !!rawModel.is_streaming,
      status: rawModel.status,
      score: rawModel.score,
      createdAt: new Date(rawModel.created_at)
    }
  }

  protected buildModelStrict(rawModel: unknown): MessageModel {
    const model = this.buildModel(rawModel)

    if (!testMessageModel(model)) {
      throw new DatabaseError(`Message unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return model
  }
  */

  protected buildFullModel(rawFullModel: unknown): FullMessageModel | null {
    if (rawFullModel === null) {
      return null
    }

    this.validateRawData<RawFullMessage>('database-raw-full-message', rawFullModel)

    return {
      campaignId: rawFullModel.campaign_id,
      messageId: rawFullModel.message_id,
      proxyId: rawFullModel.proxy_id,
      targetId: rawFullModel.target_id,
      sessionId: rawFullModel.session_id,
      method: rawFullModel.method,
      url: rawFullModel.url,
      isStreaming: !!rawFullModel.is_streaming,
      requestHeaders: this.parseHeaders(rawFullModel.request_headers),
      requestBody: this.decodeBase64(rawFullModel.request_body),
      responseHeaders: this.parseHeaders(rawFullModel.response_headers),
      responseBody: this.decodeBase64(rawFullModel.response_body),
      clientIp: rawFullModel.client_ip,
      status: rawFullModel.status,
      score: rawFullModel.score,
      startTime: rawFullModel.start_time,
      finishTime: rawFullModel.finish_time,
      connection: this.parseConnection(rawFullModel.connection),
      createdAt: new Date(rawFullModel.created_at)
    }
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
}
