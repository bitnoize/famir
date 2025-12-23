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
  testSessionModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawSession } from './session.functions.js'
import { rawSessionSchema } from './session.schemas.js'

export class RedisSessionRepository extends RedisBaseRepository implements SessionRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<SessionRepository>(
      SESSION_REPOSITORY,
      (c) =>
        new RedisSessionRepository(
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
    super(validator, config, logger, connection, 'session')

    this.validator.addSchemas({
      'database-raw-session': rawSessionSchema
    })
  }

  async create(campaignId: string): Promise<SessionModel> {
    const sessionId = randomIdent()
    const secret = randomIdent()

    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.session.create_session(this.options.prefix, campaignId, sessionId, secret),

        this.connection.session.read_session(this.options.prefix, campaignId, sessionId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildSessionModel(rawValue)

      if (!testSessionModel(model)) {
        throw new DatabaseError(`Session lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { session: model })

      return model
    } catch (error) {
      this.handleException(error, 'create', { campaignId, sessionId })
    }
  }

  async read(campaignId: string, sessionId: string): Promise<SessionModel | null> {
    try {
      const rawValue = await this.connection.session.read_session(
        this.options.prefix,
        campaignId,
        sessionId
      )

      return this.buildSessionModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, sessionId })
    }
  }

  async auth(campaignId: string, sessionId: string): Promise<SessionModel | null> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, campaignId, sessionId),

        this.connection.session.read_session(this.options.prefix, campaignId, sessionId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildSessionModel(rawValue)

      if (!testSessionModel(model)) {
        throw new DatabaseError(`Session lost on auth`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { session: model })

      return model
    } catch (error) {
      this.handleException(error, 'auth', { campaignId, sessionId })
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

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      this.logger.info(message)

      return
    } catch (error) {
      this.handleException(error, 'upgrade', { campaignId, lureId, sessionId })
    }
  }

  protected buildSessionModel(rawValue: unknown): SessionModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawSession(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      sessionId: rawValue.session_id,
      proxyId: rawValue.proxy_id,
      secret: rawValue.secret,
      isLanding: !!rawValue.is_landing,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      lastAuthAt: new Date(rawValue.last_auth_at)
    }
  }

  protected buildSessionCollection(rawValues: unknown): Array<SessionModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildSessionModel(rawValue))
  }

  protected validateRawSession(value: unknown): asserts value is RawSession {
    try {
      this.validator.assertSchema<RawSession>('database-raw-session', value)
    } catch (error) {
      throw new DatabaseError(`RawSession validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
