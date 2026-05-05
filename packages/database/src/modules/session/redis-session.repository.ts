import { DIContainer, randomIdent } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import { DATABASE_CONNECTOR, DatabaseConnector, RedisDatabaseConfig } from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawSession } from './session.functions.js'
import { SESSION_REPOSITORY, SessionRepository } from './session.js'
import { SessionModel } from './session.models.js'
import { sessionSchemas } from './session.schemas.js'

/**
 * Redis session repository implementation.
 *
 * @category Session
 */
export class RedisSessionRepository extends RedisBaseRepository implements SessionRepository {
  /**
   * Register session repository instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<SessionRepository>(
      SESSION_REPOSITORY,
      (c) =>
        new RedisSessionRepository(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new session repository instance.
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
    super(validator, config, logger, connector, 'session')

    this.validator.addSchemas(sessionSchemas)

    this.logger.debug(`SessionRepository initialized`)
  }

  async create(campaignId: string): Promise<SessionModel> {
    const [sessionId, secret] = [randomIdent(), randomIdent()]

    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.session.create_session(
          this.options.prefix,
          campaignId,
          sessionId,
          secret,
          Date.now()
        ),

        this.connection.session.read_session(this.options.prefix, campaignId, sessionId),
      ])

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { session: { campaignId, sessionId } })

      return this.buildModelStrict(rawModel)
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, sessionId })
    }
  }

  async read(campaignId: string, sessionId: string): Promise<SessionModel | null> {
    try {
      const rawModel = await this.connection.session.read_session(
        this.options.prefix,
        campaignId,
        sessionId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, sessionId })
    }
  }

  async auth(campaignId: string, sessionId: string): Promise<SessionModel> {
    try {
      const [statusReply, rawModel] = await Promise.all([
        this.connection.session.auth_session(
          this.options.prefix,
          campaignId,
          sessionId,
          Date.now()
        ),

        this.connection.session.read_session(this.options.prefix, campaignId, sessionId),
      ])

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { session: { campaignId, sessionId } })

      return this.buildModelStrict(rawModel)
    } catch (error) {
      this.raiseError(error, 'auth', { campaignId, sessionId })
    }
  }

  async upgrade(
    campaignId: string,
    lureId: string,
    sessionId: string,
    secret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.session.upgrade_session(
        this.options.prefix,
        campaignId,
        lureId,
        sessionId,
        secret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { session: { campaignId, lureId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'upgrade', { campaignId, lureId, sessionId })
    }
  }

  /**
   * Converts raw Redis data to a session model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The session model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildModel(rawModel: unknown): SessionModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawSession>('database-raw-session', rawModel)

    return new SessionModel(
      rawModel.campaign_id,
      rawModel.session_id,
      rawModel.proxy_id,
      rawModel.secret,
      rawModel.is_upgraded,
      rawModel.message_count,
      new Date(rawModel.created_at),
      new Date(rawModel.authorized_at)
    )
  }

  /**
   * Converts raw Redis data to a session model and asserts it exists.
   *
   * @param rawModel - The raw data from Redis
   * @returns The session model
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildModelStrict(rawModel: unknown): SessionModel {
    const model = this.buildModel(rawModel)

    if (!SessionModel.isNotNull(model)) {
      throw new DatabaseError(`Session unexpected lost`, {
        code: 'INTERNAL_ERROR',
      })
    }

    return model
  }
}
