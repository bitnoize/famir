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
  testSessionModel,
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

    this.validator.addSchemas({
      'database-raw-session': rawSessionSchema
    })
  }

  async createSession(data: CreateSessionData): Promise<SessionModel> {
    try {
      const sessionId = randomIdent()
      const secret = randomIdent()

      const [status, rawValue] = await Promise.all([
        this.connection.session.create_session(
          this.options.prefix,
          data.campaignId,
          sessionId,
          secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, sessionId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const sessionModel = this.buildSessionModel(rawValue)

      if (!testSessionModel(sessionModel)) {
        throw new DatabaseError(`SessionModel lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { sessionModel })

      return sessionModel
    } catch (error) {
      this.handleException(error, 'createSession', data)
    }
  }

  async readSession(data: ReadSessionData): Promise<SessionModel | null> {
    try {
      const rawValue = await this.connection.session.read_session(
        this.options.prefix,
        data.campaignId,
        data.sessionId
      )

      return this.buildSessionModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readSession', data)
    }
  }

  async authSession(data: AuthSessionData): Promise<SessionModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, data.campaignId, data.sessionId),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const sessionModel = this.buildSessionModel(rawValue)

      if (!testSessionModel(sessionModel)) {
        throw new DatabaseError(`SessionModel lost on auth`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { sessionModel })

      return sessionModel
    } catch (error) {
      this.handleException(error, 'authSession', data)
    }
  }

  async upgradeSession(data: UpgradeSessionData): Promise<SessionModel> {
    try {
      const [status, rawValue] = await Promise.all([
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

      const sessionModel = this.buildSessionModel(rawValue)

      if (!testSessionModel(sessionModel)) {
        throw new DatabaseError(`SessionModel lost on upgrade`, {
          code: 'INTERNAL_ERROR'
        })
      }

      this.logger.info(message, { sessionModel })

      return sessionModel
    } catch (error) {
      this.handleException(error, 'upgradeSession', data)
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
