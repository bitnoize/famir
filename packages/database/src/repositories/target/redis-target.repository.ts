import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
  DatabaseError,
  FullTargetModel,
  Logger,
  LOGGER,
  TARGET_REPOSITORY,
  TargetModel,
  TargetRepository,
  testTargetModel,
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

  async create(
    campaignId: string,
    targetId: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorPort: number,
    connectTimeout: number,
    requestTimeout: number,
    streamingTimeout: number,
    requestBodyLimit: number,
    responseBodyLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string
  ): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.create_target(
          this.options.prefix,
          campaignId,
          targetId,
          isLanding,
          donorSecure,
          donorSub,
          donorDomain,
          donorPort,
          mirrorSecure,
          mirrorSub,
          mirrorPort,
          connectTimeout,
          requestTimeout,
          streamingTimeout,
          requestBodyLimit,
          responseBodyLimit,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on create`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'create', { campaignId, targetId })
    }
  }

  async read(campaignId: string, targetId: string): Promise<FullTargetModel | null> {
    try {
      const rawValue = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullTargetModel(rawValue)
    } catch (error) {
      this.handleException(error, 'read', { campaignId, targetId })
    }
  }

  async update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    requestTimeout: number | null | undefined,
    streamingTimeout: number | null | undefined,
    requestBodyLimit: number | null | undefined,
    responseBodyLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined
  ): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          campaignId,
          targetId,
          connectTimeout,
          requestTimeout,
          streamingTimeout,
          requestBodyLimit,
          responseBodyLimit,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on update`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'update', { campaignId, targetId })
    }
  }

  async enable(campaignId: string, targetId: string): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, campaignId, targetId),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on enable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'enable', { campaignId, targetId })
    }
  }

  async disable(campaignId: string, targetId: string): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, campaignId, targetId),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on disable`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'disable', { campaignId, targetId })
    }
  }

  async appendLabel(campaignId: string, targetId: string, label: string): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.append_target_label(
          this.options.prefix,
          campaignId,
          targetId,
          label
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on append label`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'appendLabel', { campaignId, targetId, label })
    }
  }

  async removeLabel(campaignId: string, targetId: string, label: string): Promise<TargetModel> {
    try {
      const [statusReply, rawValue] = await Promise.all([
        this.connection.target.remove_target_label(
          this.options.prefix,
          campaignId,
          targetId,
          label
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on remove label`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'removeLabel', { campaignId, targetId, label })
    }
  }

  async delete(campaignId: string, targetId: string): Promise<TargetModel> {
    try {
      const [rawValue, statusReply] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, campaignId, targetId),

        this.connection.target.delete_target(this.options.prefix, campaignId, targetId)
      ])

      const [code, message] = this.parseStatusReply(statusReply)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const model = this.buildTargetModel(rawValue)

      if (!testTargetModel(model)) {
        throw new DatabaseError(`Target lost on delete`, {
          code: 'INTERNAL_ERROR'
        })
      }

      return model
    } catch (error) {
      this.handleException(error, 'delete', { campaignId, targetId })
    }
  }

  async list(campaignId: string): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawValues = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildTargetCollection(rawValues).filter(testTargetModel)
    } catch (error) {
      this.handleException(error, 'list', { campaignId })
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
}
