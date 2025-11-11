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
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawTarget } from './target.functions.js'
import { rawTargetSchema } from './target.schemas.js'

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
      'database-raw-target': rawTargetSchema
    })

    this.logger.debug(`TargetRepository initialized`)
  }

  async createTarget(data: CreateTargetData): Promise<DisabledTargetModel> {
    try {
      const [status, rawTarget] = await Promise.all([
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
          data.marks,
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawTarget)

      this.assertDisabledTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'createTarget', data)
    }
  }

  async readTarget(data: ReadTargetData): Promise<TargetModel | null> {
    try {
      const rawTarget = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.targetId
      )

      return this.buildTargetModel(rawTarget)
    } catch (error) {
      this.handleException(error, 'readTarget', data)
    }
  }

  async readEnabledTarget(data: ReadTargetData): Promise<EnabledTargetModel | null> {
    try {
      const rawTarget = await this.connection.target.read_target(
        this.options.prefix,
        data.campaignId,
        data.targetId
      )

      const targetModel = this.buildTargetModel(rawTarget)

      return this.guardEnabledTargetModel(targetModel) ? targetModel : null
    } catch (error) {
      this.handleException(error, 'readEnabledTarget', data)
    }
  }

  async updateTarget(data: UpdateTargetData): Promise<TargetModel> {
    try {
      const [status, rawTarget] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          data.campaignId,
          data.targetId,
          data.marks,
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

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawTarget)

      this.assertTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'updateTarget', data)
    }
  }

  async enableTarget(data: SwitchTargetData): Promise<EnabledTargetModel> {
    try {
      const [status, rawTarget] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawTarget)

      this.assertEnabledTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'enableTarget', data)
    }
  }

  async disableTarget(data: SwitchTargetData): Promise<DisabledTargetModel> {
    try {
      const [status, rawTarget] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawTarget)

      this.assertDisabledTargetModel(targetModel)

      this.logger.info(message, { targetModel })

      return targetModel
    } catch (error) {
      this.handleException(error, 'disableTarget', data)
    }
  }

  async deleteTarget(data: DeleteTargetData): Promise<DisabledTargetModel> {
    try {
      const [rawTarget, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, data.campaignId, data.targetId),

        this.connection.target.delete_target(this.options.prefix, data.campaignId, data.targetId)
      ])

      const [code, message] = this.parseStatusReply(status)

      if (code !== 'OK') {
        throw new DatabaseError(message, { code })
      }

      const targetModel = this.buildTargetModel(rawTarget)

      this.assertDisabledTargetModel(targetModel)

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

      const rawTargets = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, targetId)
        )
      )

      return this.buildTargetCollection(rawTargets).filter(this.guardTargetModel)
    } catch (error) {
      this.handleException(error, 'listTargets', data)
    }
  }

  async listEnabledTargets(data: ListTargetsData): Promise<EnabledTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(
        this.options.prefix,
        data.campaignId
      )

      if (index === null) {
        return null
      }

      const rawTargets = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, data.campaignId, targetId)
        )
      )

      return this.buildTargetCollection(rawTargets).filter(this.guardEnabledTargetModel)
    } catch (error) {
      this.handleException(error, 'listEnabledTargets', data)
    }
  }

  protected buildTargetModel(rawTarget: unknown): TargetModel | null {
    if (rawTarget === null) {
      return null
    }

    this.validateRawTarget(rawTarget)

    return {
      campaignId: rawTarget.campaign_id,
      targetId: rawTarget.target_id,
      isLanding: !!rawTarget.is_landing,
      donorSecure: !!rawTarget.donor_secure,
      donorSub: rawTarget.donor_sub,
      donorDomain: rawTarget.donor_domain,
      donorPort: rawTarget.donor_port,
      mirrorSecure: !!rawTarget.mirror_secure,
      mirrorSub: rawTarget.mirror_sub,
      mirrorPort: rawTarget.mirror_port,
      marks: rawTarget.marks.split(' '),
      connectTimeout: rawTarget.connect_timeout,
      timeout: rawTarget.timeout,
      mainPage: rawTarget.main_page,
      notFoundPage: rawTarget.not_found_page,
      faviconIco: rawTarget.favicon_ico,
      robotsTxt: rawTarget.robots_txt,
      sitemapXml: rawTarget.sitemap_xml,
      successRedirectUrl: rawTarget.success_redirect_url,
      failureRedirectUrl: rawTarget.failure_redirect_url,
      isEnabled: !!rawTarget.is_enabled,
      messageCount: rawTarget.message_count,
      createdAt: new Date(rawTarget.created_at),
      updatedAt: new Date(rawTarget.updated_at)
    }
  }

  protected buildTargetCollection(rawTargets: unknown): Array<TargetModel | null> {
    this.validateArrayReply(rawTargets)

    return rawTargets.map((rawTarget) => this.buildTargetModel(rawTarget))
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

  protected guardTargetModel(value: TargetModel | null): value is TargetModel {
    return value != null
  }

  protected guardEnabledTargetModel(value: TargetModel | null): value is EnabledTargetModel {
    return this.guardTargetModel(value) && value.isEnabled
  }

  protected guardDisabledTargetModel(value: TargetModel | null): value is DisabledTargetModel {
    return this.guardTargetModel(value) && !value.isEnabled
  }

  protected assertTargetModel(value: TargetModel | null): asserts value is TargetModel {
    if (!this.guardTargetModel(value)) {
      throw new Error(`TargetModel unexpected lost`)
    }
  }

  protected assertEnabledTargetModel(
    value: TargetModel | null
  ): asserts value is EnabledTargetModel {
    if (!this.guardEnabledTargetModel(value)) {
      throw new Error(`EnabledTargetModel unexpected lost`)
    }
  }

  protected assertDisabledTargetModel(
    value: TargetModel | null
  ): asserts value is DisabledTargetModel {
    if (!this.guardDisabledTargetModel(value)) {
      throw new Error(`DisabledTargetModel unexpected lost`)
    }
  }
}
