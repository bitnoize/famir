import { DIContainer, randomIdent } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { RedisDatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawSession } from './session.functions.js'
import { sessionSchemas } from './session.schemas.js'

export class RedisSessionRepository extends RedisBaseRepository implements SessionRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionRepository>(
      SESSION_REPOSITORY,
      (c) =>
        new RedisSessionRepository(
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
    super(validator, config, logger, connection, 'session')

    this.validator.addSchemas(sessionSchemas)

    this.logger.debug(`SessionRepository initialized`)
  }

  async create(campaignId: string, sessionId: string): Promise<void> {
    const secret = randomIdent()

    try {
      const statusReply = await this.connection.session.create_session(
        this.options.prefix,
        campaignId,
        sessionId,
        secret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { session: { campaignId, sessionId } })
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
        this.connection.session.auth_session(this.options.prefix, campaignId, sessionId),

        this.connection.session.read_session(this.options.prefix, campaignId, sessionId)
      ])

      const mesg = this.handleStatusReply(statusReply)

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

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { session: { campaignId, lureId, sessionId } })
    } catch (error) {
      this.raiseError(error, 'upgrade', { campaignId, lureId, sessionId })
    }
  }

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
      !!rawModel.is_landing,
      rawModel.message_count,
      new Date(rawModel.created_at),
      new Date(rawModel.last_auth_at)
    )
  }

  protected buildModelStrict(rawModel: unknown): SessionModel {
    const model = this.buildModel(rawModel)

    if (!SessionModel.isNotNull(model)) {
      throw new DatabaseError(`Session unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }

    return model
  }
}
