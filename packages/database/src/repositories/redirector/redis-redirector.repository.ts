import {
  Config,
  DatabaseError,
  Logger,
  RedirectorModel,
  RedirectorRepository,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertRedirector,
  buildRedirectorCollection,
  buildRedirectorModel,
  guardRedirector
} from './redirector.utils.js'

export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'redirector')
  }

  async create(campaignId: string, id: string, page: string): Promise<RedirectorModel> {
    try {
      const [status, rawRedirector] = await Promise.all([
        this.connection.redirector.create_redirector(this.options.prefix, campaignId, id, page),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return redirector
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        campaignId,
        id,
        page
      })
    }
  }

  async read(campaignId: string, id: string): Promise<RedirectorModel | null> {
    try {
      const rawRedirector = await this.connection.redirector.read_redirector(
        this.options.prefix,
        campaignId,
        id
      )

      return buildRedirectorModel(rawRedirector)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async update(
    campaignId: string,
    id: string,
    page: string | null | undefined
  ): Promise<RedirectorModel> {
    try {
      const [status, rawRedirector] = await Promise.all([
        this.connection.redirector.update_redirector(this.options.prefix, campaignId, id, page),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return redirector
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        campaignId,
        id,
        page
      })
    }
  }

  async delete(campaignId: string, id: string): Promise<RedirectorModel> {
    try {
      const [rawRedirector, status] = await Promise.all([
        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id),

        this.connection.redirector.delete_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return redirector
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<RedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        campaignId
      )

      if (index === null) {
        return null
      }

      const rawRedirectors = await Promise.all(
        index.map((id) =>
          this.connection.redirector.read_redirector(this.options.prefix, campaignId, id)
        )
      )

      return buildRedirectorCollection(rawRedirectors).filter(guardRedirector)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }
}
