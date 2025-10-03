import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateLureData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteLureData,
  DisabledLureModel,
  EnabledLureModel,
  ListLuresData,
  Logger,
  LOGGER,
  LURE_REPOSITORY,
  LureModel,
  LureRepository,
  ReadLureData,
  ReadLurePathData,
  SwitchLureData,
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

  async create(data: CreateLureData): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.create_lure(
          this.options.prefix,
          data.campaignId,
          data.id,
          data.path,
          data.redirectorId
        ),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', data)
    }
  }

  async read(data: ReadLureData): Promise<LureModel | null> {
    try {
      const raw = await this.connection.lure.read_lure(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async readPath(data: ReadLurePathData): Promise<EnabledLureModel | null> {
    try {
      const id = await this.connection.lure.read_lure_path(
        this.options.prefix,
        data.campaignId,
        data.path
      )

      if (id === null) {
        return null
      }

      const raw = await this.connection.lure.read_lure(this.options.prefix, data.campaignId, id)

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionFilter(error, 'readPath', data)
    }
  }

  async enable(data: SwitchLureData): Promise<EnabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.enable_lure(this.options.prefix, data.campaignId, data.id),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertEnabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'enable', data)
    }
  }

  async disable(data: SwitchLureData): Promise<DisabledLureModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.lure.disable_lure(this.options.prefix, data.campaignId, data.id),

        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'disable', data)
    }
  }

  async delete(data: DeleteLureData): Promise<DisabledLureModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.lure.read_lure(this.options.prefix, data.campaignId, data.id),

        this.connection.lure.delete_lure(
          this.options.prefix,
          data.campaignId,
          data.id,
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
      this.exceptionFilter(error, 'delete', data)
    }
  }

  async list(data: ListLuresData): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, data.campaignId)

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) => this.connection.lure.read_lure(this.options.prefix, data.campaignId, id))
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', data)
    }
  }
}
