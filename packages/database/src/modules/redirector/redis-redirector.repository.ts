import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import { DATABASE_CONNECTOR, DatabaseConnector, RedisDatabaseConfig } from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullRedirector, RawRedirector } from './redirector.functions.js'
import { REDIRECTOR_REPOSITORY, RedirectorRepository } from './redirector.js'
import { FullRedirectorModel, RedirectorModel } from './redirector.models.js'
import { redirectorSchemas } from './redirector.schemas.js'

/**
 * Redis redirector repository implementation.
 *
 * @category Redirector
 */
export class RedisRedirectorRepository extends RedisBaseRepository implements RedirectorRepository {
  /**
   * Register redirector repository instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<RedirectorRepository>(
      REDIRECTOR_REPOSITORY,
      (c) =>
        new RedisRedirectorRepository(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new redirector repository instance.
   *
   * @param validator - The validator instance
   * @param config - The database config instance
   * @param logger - The logger instance
   * @param connector - The database connector instance
   */
  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connector: DatabaseConnector
  ) {
    super(validator, config, logger, connector, 'redirector')

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
        Date.now(),
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

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

  /**
   * Converts raw Redis data to a redirector model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The redirector model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
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

  /**
   * Converts raw Redis data to a full redirector model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The full redirector model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
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

  /**
   * Converts an array of raw Redis data to an array of redirector models.
   *
   * @param rawCollection - The array of raw data from Redis
   * @returns An array of redirector models
   * @throws {@link DatabaseError} If the array of raw data fails validation
   * @internal
   */
  protected buildCollection(rawCollection: unknown): RedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }

  /**
   * Converts an array of raw Redis data to an array of full redirector models.
   *
   * @param rawCollection - The array of raw data from Redis
   * @returns An array of full redirector models
   * @throws {@link DatabaseError} If the array of raw data fails validation
   * @internal
   */
  protected buildFullCollection(rawCollection: unknown): FullRedirectorModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(RedirectorModel.isNotNull)
  }
}
