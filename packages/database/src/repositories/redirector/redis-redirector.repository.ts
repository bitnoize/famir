import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
} from '../../database.js'
import { FullRedirectorModel, RedirectorModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { REDIRECTOR_REPOSITORY, RedirectorRepository } from './redirector.js'
import { redirectorSchemas } from './redirector.schemas.js'

/**
 * Redis redirector repository implementation
 * @category Repositories
 */
export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).getConnection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'redirector')

    this.validator.addSchemas(redirectorSchemas)

    this.logger.debug(`RedirectorRepository initialized`)
  }

  async create(
    campaignId: string,
    redirectorId: string,
    page: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.create_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page,
        Date.now().toString(),
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, redirectorId })
    }
  }

  async read(campaignId: string, redirectorId: string): Promise<RedirectorModel | null> {
    try {
      const rawModel = await this.connection.redirector.read_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, redirectorId })
    }
  }

  async readFull(campaignId: string, redirectorId: string): Promise<FullRedirectorModel | null> {
    try {
      const rawModel = await this.connection.redirector.read_full_redirector(
        this.options.prefix,
        campaignId,
        redirectorId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'readFull', { campaignId, redirectorId })
    }
  }

  async update(
    campaignId: string,
    redirectorId: string,
    page: string | null | undefined,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.update_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        page ?? null,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId, redirectorId })
    }
  }

  async appendField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.append_redirector_field(
        this.options.prefix,
        campaignId,
        redirectorId,
        field,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId, field } })
    } catch (error) {
      this.raiseError(error, 'appendField', { campaignId, redirectorId, field })
    }
  }

  async removeField(
    campaignId: string,
    redirectorId: string,
    field: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.remove_redirector_field(
        this.options.prefix,
        campaignId,
        redirectorId,
        field,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId, field } })
    } catch (error) {
      this.raiseError(error, 'removeField', { campaignId, redirectorId, field })
    }
  }

  async delete(campaignId: string, redirectorId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.redirector.delete_redirector(
        this.options.prefix,
        campaignId,
        redirectorId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { redirector: { campaignId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, redirectorId })
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

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_redirector(this.options.prefix, campaignId, redirectorId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  async listFull(campaignId: string): Promise<FullRedirectorModel[] | null> {
    try {
      const index = await this.connection.redirector.read_redirector_index(
        this.options.prefix,
        campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((redirectorId) =>
          this.connection.redirector.read_full_redirector(
            this.options.prefix,
            campaignId,
            redirectorId
          )
        )
      )

      return this.buildFullCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'listFull', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): RedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawRedirector>('database-raw-redirector', rawModel)

    return new RedirectorModel(
      rawModel.campaign_id,
      rawModel.redirector_id,
      rawModel.lure_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildFullModel(rawModel: unknown): FullRedirectorModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawFullRedirector>('database-raw-full-redirector', rawModel)

    return new FullRedirectorModel(
      rawModel.campaign_id,
      rawModel.redirector_id,
      rawModel.page,
      rawModel.fields,
      rawModel.lure_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildCollection(rawCollection: unknown): RedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }

  protected buildFullCollection(rawCollection: unknown): FullRedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }
}
