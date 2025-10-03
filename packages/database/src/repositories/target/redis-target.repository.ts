import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  CreateTargetData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteTargetData,
  DisabledTargetModel,
  EnabledTargetModel,
  ListTargetsData,
  Logger,
  LOGGER,
  ReadTargetData,
  SwitchTargetData,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  UpdateTargetData,
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

  async create(data: CreateTargetData): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.create_target(
          this.options.prefix,
          data.campaignId,
          data.id,
          data.isLanding,
          data.donorSecure,
          data.donorSub,
          data.donorDomain,
          data.donorPort,
          data.mirrorSecure,
          data.mirrorSub,
          data.mirrorDomain,
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

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.id)
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

  async read(data: ReadTargetData): Promise<TargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', data)
    }
  }

  async readEnabled(data: ReadTargetData): Promise<EnabledTargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.id
      )

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', data)
    }
  }

  async update(data: UpdateTargetData): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          data.campaignId,
          data.id,
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

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'update', data)
    }
  }

  async enable(data: SwitchTargetData): Promise<EnabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, data.campaignId, data.id),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.id)
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

  async disable(data: SwitchTargetData): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, data.campaignId, data.id),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.id)
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

  async delete(data: DeleteTargetData): Promise<DisabledTargetModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, data.campaignId, data.id),

        this.connection.target.delete_target(this.options.prefix, data.campaignId, data.id)
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

  async list(data: ListTargetsData): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, id)
        )
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', data)
    }
  }

  async listEnabled(data: ListTargetsData): Promise<EnabledTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, id)
        )
      )

      return buildCollection(raws).filter(guardEnabledModel)
    } catch (error) {
      this.exceptionFilter(error, 'listEnabled', data)
    }
  }
}
