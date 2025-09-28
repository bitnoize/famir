import {
  Config,
  DatabaseError,
  DisabledLureModel,
  EnabledLureModel,
  Logger,
  LureModel,
  LureRepository,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertDisabledModel,
  assertEnabledModel,
  buildCollection,
  buildModel,
  guardEnabledModel,
  guardModel
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
  ): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.create_lure(this.options.prefix, campaignId, id, path, redirectorId),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
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
      const raw = await this.connection.lure.read_lure(this.options.prefix, campaignId, id)

      return buildModel(raw)
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

      const raw = await this.connection.lure.read_lure(this.options.prefix, campaignId, id)

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionFilter(error, 'readPath', { campaignId, path })
    }
  }

  async enable(campaignId: string, id: string): Promise<EnabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, campaignId, id),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertEnabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, campaignId, id),

        this.connection.lure.read_lure(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(
    campaignId: string,
    id: string,
    path: string,
    redirectorId: string
  ): Promise<DisabledLureModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, campaignId, id),

        this.connection.lure.delete_lure(this.options.prefix, campaignId, id, path, redirectorId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
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

      const raws = await Promise.all(
        index.map((id) => this.connection.lure.read_lure(this.options.prefix, campaignId, id))
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }
}
