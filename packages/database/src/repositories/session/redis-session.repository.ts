import {
  Config,
  DatabaseError,
  Logger,
  SessionModel,
  SessionRepository,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { assertSession, buildSessionModel } from './session.utils.js'

export class RedisSessionRepository extends RedisBaseRepository implements SessionRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'session')
  }

  async create(campaignId: string, id: string, secret: string): Promise<SessionModel> {
    try {
      const [status, rawSession] = await Promise.all([
        this.connection.session.create_session(this.options.prefix, campaignId, id, secret),

        this.connection.session.read_session(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const session = buildSessionModel(rawSession)

        assertSession(session)

        return session
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', { campaignId, id, secret })
    }
  }

  async read(campaignId: string, id: string): Promise<SessionModel | null> {
    try {
      const rawSession = await this.connection.session.read_session(
        this.options.prefix,
        campaignId,
        id
      )

      return buildSessionModel(rawSession)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async auth(campaignId: string, id: string): Promise<SessionModel> {
    try {
      const [status, rawSession] = await Promise.all([
        this.connection.session.auth_session(this.options.prefix, campaignId, id),

        this.connection.session.read_session(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const session = buildSessionModel(rawSession)

        assertSession(session)

        return session
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'auth', { campaignId, id })
    }
  }

  async upgrade(
    campaignId: string,
    lureId: string,
    id: string,
    secret: string
  ): Promise<SessionModel> {
    try {
      const [status, rawSession] = await Promise.all([
        this.connection.session.upgrade_session(
          this.options.prefix,
          campaignId,
          lureId,
          id,
          secret
        ),

        this.connection.session.read_session(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const session = buildSessionModel(rawSession)

        assertSession(session)

        return session
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'upgrade', {
        campaignId,
        lureId,
        id,
        secret
      })
    }
  }
}
