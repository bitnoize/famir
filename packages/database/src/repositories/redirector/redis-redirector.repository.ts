import { Config } from '@famir/config'
import { Redirector, RedirectorRepository, RepositoryContainer } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
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

  async create(
    campaignId: string,
    id: string,
    page: string
  ): Promise<RepositoryContainer<Redirector>> {
    try {
      const [status, rawRedirector] = await Promise.all([
        this.connection.redirector.create_redirector(this.options.prefix, campaignId, id, page),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return [true, redirector, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'CONFLICT'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        campaignId,
        id,
        page
      })
    }
  }

  async read(campaignId: string, id: string): Promise<Redirector | null> {
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
  ): Promise<RepositoryContainer<Redirector>> {
    try {
      const [status, rawRedirector] = await Promise.all([
        this.connection.redirector.update_redirector(this.options.prefix, campaignId, id, page),

        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return [true, redirector, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        campaignId,
        id,
        page
      })
    }
  }

  async delete(campaignId: string, id: string): Promise<RepositoryContainer<Redirector>> {
    try {
      const [rawRedirector, status] = await Promise.all([
        this.connection.redirector.read_redirector(this.options.prefix, campaignId, id),

        this.connection.redirector.delete_redirector(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const redirector = buildRedirectorModel(rawRedirector)

        assertRedirector(redirector)

        return [true, redirector, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<Redirector[] | null> {
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
