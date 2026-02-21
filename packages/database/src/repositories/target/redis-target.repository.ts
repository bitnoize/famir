import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConnection
} from '../../database-connector.js'
import { RedisDatabaseConfig } from '../../database.js'
import { FullTargetModel, TargetModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'
import { TARGET_REPOSITORY, TargetRepository } from './target.js'
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
    simpleTimeout: number,
    streamTimeout: number,
    requestSizeLimit: number,
    responseSizeLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    lockSecret: string
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
        simpleTimeout,
        streamTimeout,
        requestSizeLimit,
        responseSizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        lockSecret
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
    simpleTimeout: number | null | undefined,
    streamTimeout: number | null | undefined,
    requestSizeLimit: number | null | undefined,
    responseSizeLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.update_target(
        this.options.prefix,
        campaignId,
        targetId,
        connectTimeout,
        simpleTimeout,
        streamTimeout,
        requestSizeLimit,
        responseSizeLimit,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'update', { campaignId, targetId })
    }
  }

  async enable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.enable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'enable', { campaignId, targetId })
    }
  }

  async disable(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.disable_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
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
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.append_target_label(
        this.options.prefix,
        campaignId,
        targetId,
        label,
        lockSecret
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
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.remove_target_label(
        this.options.prefix,
        campaignId,
        targetId,
        label,
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId, label } })
    } catch (error) {
      this.raiseError(error, 'removeLabel', { campaignId, targetId, label })
    }
  }

  async delete(campaignId: string, targetId: string, lockSecret: string): Promise<void> {
    try {
      const statusReply = await this.connection.target.delete_target(
        this.options.prefix,
        campaignId,
        targetId,
        lockSecret
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

    return new TargetModel(
      rawModel.campaign_id,
      rawModel.target_id,
      !!rawModel.is_landing,
      !!rawModel.donor_secure,
      rawModel.donor_sub,
      rawModel.donor_domain,
      rawModel.donor_port,
      !!rawModel.mirror_secure,
      rawModel.mirror_sub,
      rawModel.mirror_domain,
      rawModel.mirror_port,
      rawModel.labels,
      !!rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at),
      new Date(rawModel.updated_at)
    )
  }

  protected buildFullModel(rawFullModel: unknown): FullTargetModel | null {
    if (rawFullModel === null) {
      return null
    }

    this.validateRawData<RawFullTarget>('database-raw-full-target', rawFullModel)

    return new FullTargetModel(
      rawFullModel.campaign_id,
      rawFullModel.target_id,
      !!rawFullModel.is_landing,
      !!rawFullModel.donor_secure,
      rawFullModel.donor_sub,
      rawFullModel.donor_domain,
      rawFullModel.donor_port,
      !!rawFullModel.mirror_secure,
      rawFullModel.mirror_sub,
      rawFullModel.mirror_domain,
      rawFullModel.mirror_port,
      rawFullModel.labels,
      rawFullModel.connect_timeout,
      rawFullModel.simple_timeout,
      rawFullModel.stream_timeout,
      rawFullModel.request_size_limit,
      rawFullModel.response_size_limit,
      rawFullModel.main_page,
      rawFullModel.not_found_page,
      rawFullModel.favicon_ico,
      rawFullModel.robots_txt,
      rawFullModel.sitemap_xml,
      !!rawFullModel.is_enabled,
      rawFullModel.message_count,
      new Date(rawFullModel.created_at),
      new Date(rawFullModel.updated_at)
    )
  }

  protected buildCollection(rawCollection: unknown): TargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(TargetModel.isNotNull)
  }
}
