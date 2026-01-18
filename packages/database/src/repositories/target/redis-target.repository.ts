import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  DATABASE_CONNECTOR,
  DatabaseConnector,
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
import { RedisDatabaseConfig } from '../../database.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'
import { targetSchemas } from './target.schemas.js'

export class RedisTargetRepository extends RedisBaseRepository implements TargetRepository {
  static inject(container: DIContainer) {
    container.registerSingleton<TargetRepository>(
      TARGET_REPOSITORY,
      (c) =>
        new RedisTargetRepository(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config<RedisDatabaseConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<DatabaseConnector>(DATABASE_CONNECTOR).connection<RedisDatabaseConnection>()
        )
    )
  }

  constructor(
    validator: Validator,
    config: Config<RedisDatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'target')

    this.validator.addSchemas(targetSchemas)

    this.logger.debug(`TargetRepository initialized`)
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
    ordinaryTimeout: number,
    streamingTimeout: number,
    requestBodyLimit: number,
    responseBodyLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    lockCode: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.create_target(
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
        ordinaryTimeout,
        streamingTimeout,
        requestBodyLimit,
        responseBodyLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, targetId })
    }
  }

  async read(campaignId: string, targetId: string): Promise<FullTargetModel | null> {
    try {
      const rawFullModel = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullModel(rawFullModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, targetId })
    }
  }

  async update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    ordinaryTimeout: number | null | undefined,
    streamingTimeout: number | null | undefined,
    requestBodyLimit: number | null | undefined,
    responseBodyLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    lockCode: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.update_target(
        this.options.prefix,
        campaignId,
        targetId,
        connectTimeout,
        ordinaryTimeout,
        streamingTimeout,
        requestBodyLimit,
        responseBodyLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId, targetId })
    }
  }

  async enable(campaignId: string, targetId: string, lockCode: number): Promise<void> {
    try {
      const statusReply = await this.connection.target.enable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, targetId })
    }
  }

  async disable(campaignId: string, targetId: string, lockCode: number): Promise<void> {
    try {
      const statusReply = await this.connection.target.disable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'disable', { campaignId, targetId })
    }
  }

  async appendLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockCode: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.append_target_label(
        this.options.prefix,
        campaignId,
        targetId,
        label,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId, label } })
    } catch (error) {
      this.raiseError(error, 'appendLabel', { campaignId, targetId, label })
    }
  }

  async removeLabel(
    campaignId: string,
    targetId: string,
    label: string,
    lockCode: number
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.remove_target_label(
        this.options.prefix,
        campaignId,
        targetId,
        label,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId, label } })
    } catch (error) {
      this.raiseError(error, 'removeLabel', { campaignId, targetId, label })
    }
  }

  async delete(campaignId: string, targetId: string, lockCode: number): Promise<void> {
    try {
      const statusReply = await this.connection.target.delete_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockCode
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'delete', { campaignId, targetId })
    }
  }

  async list(campaignId: string): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'list', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): TargetModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawTarget>('database-raw-target', rawModel)

    return {
      campaignId: rawModel.campaign_id,
      targetId: rawModel.target_id,
      isLanding: !!rawModel.is_landing,
      donorSecure: !!rawModel.donor_secure,
      donorSub: rawModel.donor_sub,
      donorDomain: rawModel.donor_domain,
      donorPort: rawModel.donor_port,
      mirrorSecure: !!rawModel.mirror_secure,
      mirrorSub: rawModel.mirror_sub,
      mirrorPort: rawModel.mirror_port,
      isEnabled: !!rawModel.is_enabled,
      messageCount: rawModel.message_count,
      createdAt: new Date(rawModel.created_at),
      updatedAt: new Date(rawModel.updated_at)
    }
  }

  protected buildFullModel(rawFullModel: unknown): FullTargetModel | null {
    if (rawFullModel === null) {
      return null
    }

    this.validateRawData<RawFullTarget>('database-raw-full-target', rawFullModel)

    return {
      campaignId: rawFullModel.campaign_id,
      targetId: rawFullModel.target_id,
      isLanding: !!rawFullModel.is_landing,
      donorSecure: !!rawFullModel.donor_secure,
      donorSub: rawFullModel.donor_sub,
      donorDomain: rawFullModel.donor_domain,
      donorPort: rawFullModel.donor_port,
      mirrorSecure: !!rawFullModel.mirror_secure,
      mirrorSub: rawFullModel.mirror_sub,
      mirrorPort: rawFullModel.mirror_port,
      labels: rawFullModel.labels,
      connectTimeout: rawFullModel.connect_timeout,
      ordinaryTimeout: rawFullModel.ordinary_timeout,
      streamingTimeout: rawFullModel.streaming_timeout,
      requestBodyLimit: rawFullModel.request_body_limit,
      responseBodyLimit: rawFullModel.response_body_limit,
      mainPage: rawFullModel.main_page,
      notFoundPage: rawFullModel.not_found_page,
      faviconIco: rawFullModel.favicon_ico,
      robotsTxt: rawFullModel.robots_txt,
      sitemapXml: rawFullModel.sitemap_xml,
      isEnabled: !!rawFullModel.is_enabled,
      messageCount: rawFullModel.message_count,
      createdAt: new Date(rawFullModel.created_at),
      updatedAt: new Date(rawFullModel.updated_at)
    }
  }

  protected buildCollection(rawCollection: unknown): TargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(testTargetModel)
  }
}
