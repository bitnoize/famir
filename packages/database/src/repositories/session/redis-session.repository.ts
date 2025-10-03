import { DIContainer } from '@famir/common'
import {
  AuthSessionData,
  Config,
  CreateSessionData,
  DatabaseConnector,
  DatabaseError,
  Logger,
  ReadSessionData,
  SessionModel,
  SessionRepository,
  UpgradeSessionData,
  Validator,
  VALIDATOR,
  CONFIG,
  LOGGER,
  DATABASE_CONNECTOR,
  SESSION_REPOSITORY
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

  async create(data: CreateSessionData): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.create_session(
          this.options.prefix,
          data.campaignId,
          data.id,
          data.secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.id)
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

  async read(data: ReadSessionData): Promise<SessionModel | null> {
    try {
      const raw = await this.connection.session.read_session(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async auth(data: AuthSessionData): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, data.campaignId, data.id),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.id)
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

  async upgrade(data: UpgradeSessionData): Promise<SessionModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.session.upgrade_session(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.id,
          data.secret
        ),

        this.connection.session.read_session(this.options.prefix, data.campaignId, data.id)
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
