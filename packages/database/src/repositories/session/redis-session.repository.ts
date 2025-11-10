import { DIContainer, randomIdent } from '@famir/common'
import {
  AuthSessionData,
  Config,
  CONFIG,
  CreateSessionData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  ReadSessionData,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository,
  UpgradeSessionData,
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

    validator.addSchemas({
      'database-raw-session': rawSessionSchema
    })

    this.logger.debug(`SessionRepository initialized`)
  }

  async createSession(data: CreateSessionData): Promise<string> {
    try {
      const sessionId = randomIdent()
      const secret = randomIdent()

      const status = await this.connection.session.create_session(
        this.options.prefix,
        data.campaignId,
        sessionId,
        secret
      )

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      this.logger.info(message, { sessionId })

      return sessionId
    } catch (error) {
      this.handleException(error, 'createSession', data)
    }
  }

  async readSession(data: ReadSessionData): Promise<SessionModel | null> {
    try {
      const rawSession = await this.connection.session.read_session(
        this.options.prefix,
        data.campaignId,
        data.sessionId
      )

      return this.buildSessionModel(rawSession)
    } catch (error) {
      this.handleException(error, 'readSession', data)
    }
  }

  async authSession(data: AuthSessionData): Promise<SessionModel> {
    try {
      const [status, rawSession] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, data.campaignId, data.sessionId),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const sessionModel = this.buildSessionModel(rawSession)

      this.assertSessionModel(sessionModel)

      this.logger.info(message, { sessionModel })

      return sessionModel
    } catch (error) {
      this.handleException(error, 'authSession', data)
    }
  }

  async upgradeSession(data: UpgradeSessionData): Promise<SessionModel> {
    try {
      const [status, rawSession] = await Promise.all([
        this.connection.session.upgrade_session(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.sessionId,
          data.secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const sessionModel = this.buildSessionModel(rawSession)

      this.assertSessionModel(sessionModel)

      this.logger.info(message, { sessionModel })

      return sessionModel
    } catch (error) {
      this.handleException(error, 'upgradeSession', data)
    }
  }

  protected buildSessionModel(rawSession: unknown): SessionModel | null {
    if (rawSession === null) {
      return null
    }

    this.validateRawSession(rawSession)

    return {
      campaignId: rawSession.campaign_id,
      sessionId: rawSession.session_id,
      proxyId: rawSession.proxy_id,
      secret: rawSession.secret,
      isLanding: !!rawSession.is_landing,
      messageCount: rawSession.message_count,
      createdAt: new Date(rawSession.created_at),
      lastAuthAt: new Date(rawSession.last_auth_at)
    }
  }

  protected buildSessionCollection(rawSessions: unknown): Array<SessionModel | null> {
    this.validateArrayReply(rawSessions)

    return rawSessions.map((rawSession) => this.buildSessionModel(rawSession))
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

  protected guardSessionModel(value: SessionModel | null): value is SessionModel {
    return value != null
  }

  protected assertSessionModel(value: SessionModel | null): asserts value is SessionModel {
    if (!this.guardSessionModel(value)) {
      throw new DatabaseError(`SessionModel unexpected lost`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
