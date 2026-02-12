import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from '../../database-connector.js'
import { RedisDatabaseConfig } from '../../database.js'
import {
  FullMessageModel,
  MessageBody,
  MessageConnection,
  MessageError,
  MessageHeaders,
  MessagePayload
} from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullMessage } from './message.functions.js'
import { MESSAGE_REPOSITORY, MessageRepository } from './message.js'
import { messageSchemas } from './message.schemas.js'

export class RedisMessageRepository extends RedisBaseRepository implements MessageRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<MessageRepository>(
      MESSAGE_REPOSITORY,
      (c) =>
        new RedisMessageRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
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

  async create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    kind: string,
    method: string,
    url: string,
    requestHeaders: MessageHeaders,
    requestBody: MessageBody,
    status: number,
    responseHeaders: MessageHeaders,
    responseBody: MessageBody,
    connection: MessageConnection,
    payload: MessagePayload,
    errors: MessageError[],
    score: number,
    ip: string,
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
        kind,
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
        score,
        ip,
        startTime,
        finishTime
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { message: { campaignId, messageId, proxyId, targetId, sessionId } })
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

    return new MessageModel(
      rawModel.campaign_id,
      rawModel.message_id,
      rawModel.proxy_id,
      rawModel.target_id,
      rawModel.session_id,
      rawModel.kind,
      rawModel.method,
      rawModel.url,
      rawModel.status,
      rawModel.score,
      rawModel.ip,
      rawModel.start_time,
      rawModel.finish_time,
      new Date(rawModel.created_at)
    )
  }

  protected buildModelStrict(rawModel: unknown): MessageModel {
    const model = this.buildModel(rawModel)

    if (!MessageModel.isNotNull(model)) {
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

    return new FullMessageModel(
      rawFullModel.campaign_id,
      rawFullModel.message_id,
      rawFullModel.proxy_id,
      rawFullModel.target_id,
      rawFullModel.session_id,
      rawFullModel.kind,
      rawFullModel.method,
      rawFullModel.url,
      this.parseHeaders(rawFullModel.request_headers),
      this.decodeBase64(rawFullModel.request_body),
      rawFullModel.status,
      this.parseHeaders(rawFullModel.response_headers),
      this.decodeBase64(rawFullModel.response_body),
      this.parseConnection(rawFullModel.connection),
      this.parsePayload(rawFullModel.payload),
      this.parseErrors(rawFullModel.errors),
      rawFullModel.score,
      rawFullModel.ip,
      rawFullModel.start_time,
      rawFullModel.finish_time,
      new Date(rawFullModel.created_at)
    )
  }

  protected parseHeaders(value: string): MessageHeaders {
    const data = this.decodeJson(value)

    this.validateRawData<MessageHeaders>('database-message-headers', data)

    return data
  }

  protected parseConnection(value: string): MessageConnection {
    const data = this.decodeJson(value)

    this.validateRawData<MessageConnection>('database-message-connection', data)

    return data
  }

  protected parsePayload(value: string): MessagePayload {
    const data = this.decodeJson(value)

    this.validateRawData<MessagePayload>('database-message-payload', data)

    return data
  }

  protected parseErrors(value: string): MessageError[] {
    const data = this.decodeJson(value)

    this.validateRawData<MessageError[]>('database-message-errors', data)

    return data
  }
}
