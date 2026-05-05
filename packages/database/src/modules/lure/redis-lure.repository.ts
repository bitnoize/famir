import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import { DATABASE_CONNECTOR, DatabaseConnector, RedisDatabaseConfig } from '../../database.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawLure } from './lure.functions.js'
import { LURE_REPOSITORY, LureRepository } from './lure.js'
import { LureModel } from './lure.models.js'
import { lureSchemas } from './lure.schemas.js'

/**
 * Redis lure repository implementation.
 *
 * @category Lure
 */
export class RedisLureRepository extends RedisBaseRepository implements LureRepository {
  /**
   * Register lure repository instance as singleton in DI container.
   *
   * @param container - DI container to register in
   */
  static register(container: DIContainer) {
    container.registerSingleton<LureRepository>(
      LURE_REPOSITORY,
      (c) =>
        new RedisLureRepository(
          c.resolve(VALIDATOR),
          c.resolve(CONFIG),
          c.resolve(LOGGER),
          c.resolve(DATABASE_CONNECTOR)
        )
    )
  }

  /**
   * Creates a new lure repository instance.
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
    super(validator, config, logger, connector, 'lure')

    this.validator.addSchemas(lureSchemas)

    this.logger.debug(`LureRepository initialized`)
  }

  async create(
    campaignId: string,
    lureId: string,
    path: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.lure.create_lure(
        this.options.prefix,
        campaignId,
        lureId,
        path,
        redirectorId,
        Date.now(),
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { lure: { campaignId, lureId, path, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, lureId, path, redirectorId })
    }
  }

  async read(campaignId: string, lureId: string): Promise<LureModel | null> {
    try {
      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, lureId })
    }
  }

  async find(campaignId: string, path: string): Promise<LureModel | null> {
    try {
      const lureId = await this.connection.lure.find_lure_id(this.options.prefix, campaignId, path)

      if (lureId === null) {
        return null
      }

      this.validateStringReply(lureId)

      const rawModel = await this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'find', { campaignId, path })
    }
  }

  async enable(campaignId: string, lureId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.lure.enable_lure(
        this.options.prefix,
        campaignId,
        lureId,
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { lure: { campaignId, lureId } })
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, lureId })
    }
  }

  async disable(campaignId: string, lureId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.lure.disable_lure(
        this.options.prefix,
        campaignId,
        lureId,
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { lure: { campaignId, lureId } })
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, lureId })
    }
  }

  async delete(
    campaignId: string,
    lureId: string,
    redirectorId: string,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.lure.delete_lure(
        this.options.prefix,
        campaignId,
        lureId,
        redirectorId,
        lockSecret
      )

      const [code, mesg] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(mesg, { code })
      }

      this.logger.info(mesg, { lure: { campaignId, lureId, redirectorId } })
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, lureId, redirectorId })
    }
  }

  async list(campaignId: string): Promise<LureModel[] | null> {
    try {
      const index = await this.connection.lure.read_lure_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((lureId) =>
          this.connection.lure.read_lure(this.options.prefix, campaignId, lureId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  /**
   * Converts raw Redis data to a lure model.
   *
   * @param rawModel - The raw data from Redis
   * @returns The lure model, or `null` if the raw data is `null`
   * @throws {@link DatabaseError} If the raw data fails validation
   * @internal
   */
  protected buildModel(rawModel: unknown): LureModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawLure>('database-raw-lure', rawModel)

    return new LureModel(
      rawModel.campaign_id,
      rawModel.lure_id,
      rawModel.path,
      rawModel.redirector_id,
      rawModel.is_enabled,
      rawModel.session_count,
      new Date(rawModel.created_at)
    )
  }

  /**
   * Converts an array of raw Redis data to an array of lure models.
   *
   * @param rawCollection - The array of raw data from Redis
   * @returns An array of lure models
   * @throws {@link DatabaseError} If the array of raw data fails validation
   * @internal
   */
  protected buildCollection(rawCollection: unknown): LureModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(LureModel.isNotNull)
  }
}
