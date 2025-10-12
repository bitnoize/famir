import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateLureModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteLureModel,
  DisabledLureModel,
  EnabledLureModel,
  ListLureModels,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureModel,
  ReadLurePathModel,
  SwitchLureModel,
  Validator,
  VALIDATOR
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
  static inject(container: DIContainer) {
    container.registerSingleton<LureRepository>(
      LURE_REPOSITORY,
      (c) =>
        new RedisLureRepository(
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
    super(validator, config, logger, connection, 'lure')
  }

  async create(data: CreateLureModel): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.create_lure(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.path,
          data.redirectorId
        ),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionWrapper(error, 'create', data)
    }
  }

  async read(data: ReadLureModel): Promise<LureModel | null> {
    try {
      const raw = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        data.lureId
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionWrapper(error, 'read', data)
    }
  }

  async readPath(data: ReadLurePathModel): Promise<EnabledLureModel | null> {
    try {
      const lureId = await this.connection.lure.read_lure_path(
        this.options.prefix,
        data.campaignId,
        data.path
      )

      if (!lureId) {
        return null
      }

      const raw = await this.connection.lure.read_lure(this.options.prefix, data.campaignId, lureId)

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionWrapper(error, 'readPath', data)
    }
  }

  async enable(data: SwitchLureModel): Promise<EnabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertEnabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionWrapper(error, 'enable', data)
    }
  }

  async disable(data: SwitchLureModel): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionWrapper(error, 'disable', data)
    }
  }

  async delete(data: DeleteLureModel): Promise<DisabledLureModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.lureId),

        this.connection.lure.delete_lure(
          this.options.prefix,
          data.campaignId,
          data.lureId,
          data.path,
          data.redirectorId
        )
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionWrapper(error, 'delete', data)
    }
  }

  async list(data: ListLureModels): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, data.campaignId)

      if (!index) {
        return null
      }

      const raws = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, data.campaignId, lureId)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionWrapper(error, 'list', data)
    }
  }
}
