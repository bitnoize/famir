import { DIContainer } from '@famir/common'
import {
  ActionTargetLabelData,
  Config,
  CONFIG,
  CreateTargetData,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  DeleteTargetData,
  FullTargetModel,
  ListTargetsData,
  Logger,
  LOGGER,
  ReadTargetData,
  SwitchTargetData,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  testTargetModel,
  UpdateTargetData,
  Validator,
  VALIDATOR
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'
import { rawFullTargetSchema, rawTargetSchema } from './target.schemas.js'

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

    this.validator.addSchemas({
      'database-raw-target': rawTargetSchema,
      'database-raw-full-target': rawFullTargetSchema
    })
  }

  async createTarget(data: CreateTargetData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
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
          data.requestTimeout,
          data.streamingTimeout,
          data.requestBodyLimit,
          data.responseBodyLimit,
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'createTarget', data)
    }
  }

  async readTarget(data: ReadTargetData): Promise<FullTargetModel | null> {
    try {
      const rawValue = await this.connection.target.read_full_target(
        this.options.prefix,
        data.campaignId,
        data.targetId
      )

      return this.buildFullTargetModel(rawValue)
    } catch (error) {
      this.handleException(error, 'readTarget', data)
    }
  }

  async updateTarget(data: UpdateTargetData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.connectTimeout,
          data.requestTimeout,
          data.streamingTimeout,
          data.requestBodyLimit,
          data.responseBodyLimit,
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'updateTarget', data)
    }
  }

  async enableTarget(data: SwitchTargetData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'enableTarget', data)
    }
  }

  async disableTarget(data: SwitchTargetData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'disableTarget', data)
    }
  }

  async appendTargetLabel(data: ActionTargetLabelData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.target.append_target_label(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.label
        ),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'appendTargetLabel', data)
    }
  }

  async removeTargetLabel(data: ActionTargetLabelData): Promise<TargetModel> {
    try {
      const [status, rawValue] = await Promise.all([
        this.connection.target.remove_target_label(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.label
        ),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'removeTargetLabel', data)
    }
  }

  async deleteTarget(data: DeleteTargetData): Promise<TargetModel> {
    try {
      const [rawValue, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.delete_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawValue)

      this.existsTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'deleteTarget', data)
    }
  }

  async listTargets(data: ListTargetsData): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawValues = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, targetId)
        )
      )

      return this.buildTargetCollection(rawValues).filter(testTargetModel)
    } catch (error) {
      this.handleException(error, 'listTargets', data)
    }
  }

  protected buildTargetModel(rawValue: unknown): TargetModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawTarget(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      targetId: rawValue.target_id,
      isLanding: !!rawValue.is_landing,
      donorSecure: !!rawValue.donor_secure,
      donorSub: rawValue.donor_sub,
      donorDomain: rawValue.donor_domain,
      donorPort: rawValue.donor_port,
      mirrorSecure: !!rawValue.mirror_secure,
      mirrorSub: rawValue.mirror_sub,
      mirrorPort: rawValue.mirror_port,
      isEnabled: !!rawValue.is_enabled,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildFullTargetModel(rawValue: unknown): FullTargetModel | null {
    if (rawValue === null) {
      return null
    }

    this.validateRawFullTarget(rawValue)

    return {
      campaignId: rawValue.campaign_id,
      targetId: rawValue.target_id,
      isLanding: !!rawValue.is_landing,
      donorSecure: !!rawValue.donor_secure,
      donorSub: rawValue.donor_sub,
      donorDomain: rawValue.donor_domain,
      donorPort: rawValue.donor_port,
      mirrorSecure: !!rawValue.mirror_secure,
      mirrorSub: rawValue.mirror_sub,
      mirrorPort: rawValue.mirror_port,
      labels: rawValue.labels,
      connectTimeout: rawValue.connect_timeout,
      requestTimeout: rawValue.request_timeout,
      streamingTimeout: rawValue.streaming_timeout,
      requestBodyLimit: rawValue.request_body_limit,
      responseBodyLimit: rawValue.response_body_limit,
      mainPage: rawValue.main_page,
      notFoundPage: rawValue.not_found_page,
      faviconIco: rawValue.favicon_ico,
      robotsTxt: rawValue.robots_txt,
      sitemapXml: rawValue.sitemap_xml,
      successRedirectUrl: rawValue.success_redirect_url,
      failureRedirectUrl: rawValue.failure_redirect_url,
      isEnabled: !!rawValue.is_enabled,
      messageCount: rawValue.message_count,
      createdAt: new Date(rawValue.created_at),
      updatedAt: new Date(rawValue.updated_at)
    }
  }

  protected buildTargetCollection(rawValues: unknown): Array<TargetModel | null> {
    this.validateArrayReply(rawValues)

    return rawValues.map((rawValue) => this.buildTargetModel(rawValue))
  }

  protected validateRawTarget(value: unknown): asserts value is RawTarget {
    try {
      this.validator.assertSchema<RawTarget>('database-raw-target', value)
    } catch (error) {
      throw new DatabaseError(`RawTarget validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected validateRawFullTarget(value: unknown): asserts value is RawFullTarget {
    try {
      this.validator.assertSchema<RawFullTarget>('database-raw-full-target', value)
    } catch (error) {
      throw new DatabaseError(`RawFullTarget validate failed`, {
        cause: error,
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsTargetModel<T extends TargetModel>(value: T | null): asserts value is T {
    if (!testTargetModel(value)) {
      throw new DatabaseError(`TargetModel not exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
