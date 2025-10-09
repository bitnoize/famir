import { DIContainer } from '@famir/common'
import {
  AuthSessionModel,
  Config,
  CONFIG,
  CreateSessionModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  Logger,
  LOGGER,
  ReadSessionModel,
  SESSION_REPOSITORY,
  SessionModel,
  SessionRepository,
  UpgradeSessionModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertModel, buildModel } from './session.utils.js'

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
  }

  async create(data: CreateSessionModel): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.create_session(
          this.options.prefix,
          data.campaignId,
          data.sessionId,
          data.secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  async read(data: ReadSessionModel): Promise<SessionModel | null> {
    try {
      const raw = await this.connection.session.read_session(
        this.options.prefix,
        data.campaignId,
        data.sessionId
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async auth(data: AuthSessionModel): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, data.campaignId, data.sessionId),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'auth', data)
    }
  }

  async upgrade(data: UpgradeSessionModel): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.upgrade_session(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.sessionId,
          data.secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.sessionId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'upgrade', data)
    }
  }
}
