import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateTargetModel,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteTargetModel,
  DisabledTargetModel,
  EnabledTargetModel,
  ListTargetModels,
  Logger,
  LOGGER,
  ReadTargetModel,
  SwitchTargetModel,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  UpdateTargetModel,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertModel,
  assertDisabledModel,
  assertEnabledModel,
  buildCollection,
  buildModel,
  guardEnabledModel,
  guardModel
} from './target.utils.js'

export class RedisTargetRepository extends RedisBaseRepository implements TargetRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetRepository>(
      TARGET_REPOSITORY,
      (c) =>
        new RedisTargetRepository(
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
    super(validator, config, logger, connection, 'target')
  }

  async create(data: CreateTargetModel): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.create_target(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.isLanding,
          data.donorSecure,
          data.donorSub,
          data.donorDomain,
          data.donorPort,
          data.mirrorSecure,
          data.mirrorSub,
          data.mirrorPort,
          data.connectTimeout,
          data.timeout,
          data.mainPage,
          data.notFoundPage,
          data.faviconIco,
          data.robotsTxt,
          data.sitemapXml,
          data.successRedirectUrl,
          data.failureRedirectUrl
        ),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
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

  async read(data: ReadTargetModel): Promise<TargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.targetId
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionWrapper(error, 'read', data)
    }
  }

  async readEnabled(data: ReadTargetModel): Promise<EnabledTargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.targetId
      )

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionWrapper(error, 'readEnabled', data)
    }
  }

  async update(data: UpdateTargetModel): Promise<TargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.connectTimeout,
          data.timeout,
          data.mainPage,
          data.notFoundPage,
          data.faviconIco,
          data.robotsTxt,
          data.sitemapXml,
          data.successRedirectUrl,
          data.failureRedirectUrl
        ),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionWrapper(error, 'update', data)
    }
  }

  async enable(data: SwitchTargetModel): Promise<EnabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
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

  async disable(data: SwitchTargetModel): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
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

  async delete(data: DeleteTargetModel): Promise<DisabledTargetModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.delete_target(this.options.prefix, data.campaignId, data.targetId)
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

  async list(data: ListTargetModels): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (!index) {
        return null
      }

      const raws = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, targetId)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionWrapper(error, 'list', data)
    }
  }

  async listEnabled(data: ListTargetModels): Promise<EnabledTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (!index) {
        return null
      }

      const raws = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, targetId)
        )
      )

      return buildCollection(raws).filter(guardEnabledModel)
    } catch (error) {
      this.exceptionWrapper(error, 'listEnabled', data)
    }
  }
}
