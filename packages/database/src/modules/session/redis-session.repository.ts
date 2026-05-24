import { DIContainer, randomIdent } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DATABASE_CONNECTOR, DatabaseConnector } from '../../database-connector.js'
import { DatabaseError } from '../../database.error.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawSession } from './session.functions.js'
import { SESSION_REPOSITORY, SessionRepository } from './session.js'
import { SessionModel } from './session.models.js'
import { rawSessionSchema } from './session.schemas.js'

/**
 * Redis-based session repository implementation.
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
 * import { SESSION_REPOSITORY, SessionRepository, RedisSessionRepository } from '@famir/database'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register dependency in container
 * RedisSessionRepository.register(container)
 *
 * // Resolve dependency from container
 * const sessionRepository = container.resolve<SessionRepository>(SESSION_REPOSITORY)
 *
 * // TODO more examples
 * ```
 *
 * @category Session
 */
export class RedisSessionRepository extends RedisBaseRepository implements SessionRepository {
  /**
   * Registers the session repository as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SessionRepository>(
      SESSION_REPOSITORY,
      (c) =>
        new RedisSessionRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new session repository instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param connector - The connector instance.
   */
  constructor(validator: Validator, config: Config, logger: Logger, connector: DatabaseConnector) {
    super(validator, config, logger, connector, 'session')

    this.validator.addSchema('database-raw-session', rawSessionSchema)
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { session: { campaignId, sessionId } })

      return this.buildModelStrict(rawModel)
    } catch (error) {
      this.handleRepositoryError(error, 'create', { campaignId, sessionId })
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
      this.handleRepositoryError(error, 'read', { campaignId, sessionId })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { session: { campaignId, sessionId } })

      return this.buildModelStrict(rawModel)
    } catch (error) {
      this.handleRepositoryError(error, 'auth', { campaignId, sessionId })
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

      const mesg = this.checkStatusReply(statusReply)

      this.logger.info(mesg, { session: { campaignId, lureId, sessionId } })
    } catch (error) {
      this.handleRepositoryError(error, 'upgrade', { campaignId, lureId, sessionId })
    }
  }

  /**
   * Converts raw Redis data to a session model.
   *
   * @param rawModel - The raw data from Redis.
   * @returns The session model, or `null` if the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
   */
  protected buildModel(rawModel: unknown): SessionModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateReply<RawSession>('database-raw-session', rawModel)

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
   * @param rawModel - The raw data from Redis.
   * @returns The session model.
   * @throws {@link DatabaseError} If the raw data is `null`.
   * @throws {@link DatabaseError} If the raw data fails validation.
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
