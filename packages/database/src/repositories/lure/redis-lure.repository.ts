import {
  Config,
  DatabaseError,
  DisabledLureModel,
  EnabledLureModel,
  Logger,
  LureModel,
  LureRepository,
  RepositoryContainer,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertDisabledLure,
  assertEnabledLure,
  buildLureCollection,
  buildLureModel,
  guardEnabledLure,
  guardLure
} from './lure.utils.js'

export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'lure')
  }

  async create(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<RepositoryContainer<DisabledLureModel>> {
    try {
      const [status, rawLure] = await Promise.all([
        this.connection.lure.create_lure(this.options.prefix, campaignId, id, path, redirectorId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const lure = buildLureModel(rawLure)

        assertDisabledLure(lure)

        return [true, lure, code, message]
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
        path,
        redirectorId
      })
    }
  }

  async read(campaignId: string, id: string): Promise<LureModel | null> {
    try {
      const rawLure = await this.connection.lure.read_lure(this.options.prefix, campaignId, id)

      return buildLureModel(rawLure)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async readPath(campaignId: string, path: string): Promise<EnabledLureModel | null> {
    try {
      const id = await this.connection.lure.read_lure_path(this.options.prefix, campaignId, path)

      if (id === null) {
        return null
      }

      const rawLure = await this.connection.lure.read_lure(this.options.prefix, campaignId, id)

      const lure = buildLureModel(rawLure)

      return guardEnabledLure(lure) ? lure : null
    } catch (error) {
      this.exceptionFilter(error, 'readPath', { campaignId, path })
    }
  }

  async enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledLureModel>> {
    try {
      const [status, rawLure] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, campaignId, id),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const lure = buildLureModel(rawLure)

        assertEnabledLure(lure)

        return [true, lure, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledLureModel>> {
    try {
      const [status, rawLure] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, campaignId, id),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const lure = buildLureModel(rawLure)

        assertDisabledLure(lure)

        return [true, lure, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<RepositoryContainer<DisabledLureModel>> {
    try {
      const [rawLure, status] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, campaignId, id),

        this.connection.lure.delete_lure(this.options.prefix, campaignId, id, path, redirectorId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const lure = buildLureModel(rawLure)

        assertDisabledLure(lure)

        return [true, lure, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', {
        campaignId,
        id,
        path,
        redirectorId
      })
    }
  }

  async list(campaignId: string): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const rawLures = await Promise.all(
        index.map((id) => this.connection.lure.read_lure(this.options.prefix, campaignId, id))
      )

      return buildLureCollection(rawLures).filter(guardLure)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }
}
