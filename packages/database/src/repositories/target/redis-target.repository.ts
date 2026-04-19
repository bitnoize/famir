import { DIContainer } from '@famir/common'
import { CONFIG, Config } from '@famir/config'
import { LOGGER, Logger } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { DatabaseError } from '../../database.error.js'
import {
  DATABASE_CONNECTOR,
  DatabaseConnector,
  RedisDatabaseConfig,
  RedisDatabaseConnection,
} from '../../database.js'
import { FullTargetModel, TargetAccessLevel, TargetModel } from '../../models/index.js'
import { RedisBaseRepository } from '../base/index.js'
import { RawFullTarget, RawTarget } from './target.functions.js'
import { TARGET_REPOSITORY, TargetRepository } from './target.js'
import { targetSchemas } from './target.schemas.js'

/**
 * Redis target repository implementation
 * @category Repositories
 */
export class RedisTargetRepository extends RedisBaseRepository implements TargetRepository {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<TargetRepository>(
      TARGET_REPOSITORY,
      (c) =>
        new RedisTargetRepository(
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
    super(validator, config, logger, connection, 'target')

    this.validator.addSchemas(targetSchemas)

    this.logger.debug(`TargetRepository initialized`)
  }

  async create(
    campaignId: string,
    targetId: string,
    accessLevel: TargetAccessLevel,
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
    headersSizeLimit: number,
    bodySizeLimit: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    allowWebSockets: boolean,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.create_target(
        this.options.prefix,
        campaignId,
        targetId,
        accessLevel,
        donorSecure ? '1' : '0',
        donorSub,
        donorDomain,
        donorPort.toString(),
        mirrorSecure ? '1' : '0',
        mirrorSub,
        mirrorPort.toString(),
        connectTimeout.toString(),
        simpleTimeout.toString(),
        streamTimeout.toString(),
        headersSizeLimit.toString(),
        bodySizeLimit.toString(),
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        allowWebSockets ? '1' : '0',
        Date.now().toString(),
        lockSecret
      )

      const mesg = this.handleStatusReply(statusReply)

      this.logger.info(mesg, { target: { campaignId, targetId } })
    } catch (error) {
      this.raiseError(error, 'create', { campaignId, targetId })
    }
  }

  async read(campaignId: string, targetId: string): Promise<TargetModel | null> {
    try {
      const rawModel = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'read', { campaignId, targetId })
    }
  }

  async readFull(campaignId: string, targetId: string): Promise<FullTargetModel | null> {
    try {
      const rawModel = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'readFull', { campaignId, targetId })
    }
  }

  async find(mirrorHost: string): Promise<TargetModel | null> {
    try {
      const targetLink = await this.connection.target.find_target_link(
        this.options.prefix,
        mirrorHost
      )

      if (targetLink === null) {
        return null
      }

      const [campaignId, targetId] = this.buildTargetLink(targetLink)

      const rawModel = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'find', { mirrorHost })
    }
  }

  async findFull(mirrorHost: string): Promise<FullTargetModel | null> {
    try {
      const targetLink = await this.connection.target.find_target_link(
        this.options.prefix,
        mirrorHost
      )

      if (targetLink === null) {
        return null
      }

      const [campaignId, targetId] = this.buildTargetLink(targetLink)

      const rawModel = await this.connection.target.read_full_target(
        this.options.prefix,
        campaignId,
        targetId
      )

      return this.buildFullModel(rawModel)
    } catch (error) {
      this.raiseError(error, 'findFull', { mirrorHost })
    }
  }

  async update(
    campaignId: string,
    targetId: string,
    connectTimeout: number | null | undefined,
    simpleTimeout: number | null | undefined,
    streamTimeout: number | null | undefined,
    headersSizeLimit: number | null | undefined,
    bodySizeLimit: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    allowWebSockets: boolean | null | undefined,
    lockSecret: string
  ): Promise<void> {
    try {
      const statusReply = await this.connection.target.update_target(
        this.options.prefix,
        campaignId,
        targetId,
        connectTimeout != null ? connectTimeout.toString() : null,
        simpleTimeout != null ? simpleTimeout.toString() : null,
        streamTimeout != null ? streamTimeout.toString() : null,
        headersSizeLimit != null ? headersSizeLimit.toString() : null,
        bodySizeLimit != null ? bodySizeLimit.toString() : null,
        mainPage ?? null,
        notFoundPage ?? null,
        faviconIco ?? null,
        robotsTxt ?? null,
        sitemapXml ?? null,
        allowWebSockets != null ? (allowWebSockets ? '1' : '0') : null,
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
        label.toLowerCase(),
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
        label.toLowerCase(),
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

  async listFull(campaignId: string): Promise<FullTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      this.validateArrayStringsReply(index)

      const rawCollection = await Promise.all(
        index.map((targetId) =>
          this.connection.target.read_full_target(this.options.prefix, campaignId, targetId)
        )
      )

      return this.buildFullCollection(rawCollection)
    } catch (error) {
      this.raiseError(error, 'listFull', { campaignId })
    }
  }

  protected buildModel(rawModel: unknown): TargetModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawTarget>('database-raw-target', rawModel)
    this.validateRawData<TargetAccessLevel>('database-target-access-level', rawModel.access_level)

    return new TargetModel(
      rawModel.campaign_id,
      rawModel.target_id,
      rawModel.access_level,
      !!rawModel.donor_secure,
      rawModel.donor_sub,
      rawModel.donor_domain,
      rawModel.donor_port,
      !!rawModel.mirror_secure,
      rawModel.mirror_sub,
      rawModel.mirror_domain,
      rawModel.mirror_port,
      !!rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildFullModel(rawModel: unknown): FullTargetModel | null {
    if (rawModel === null) {
      return null
    }

    this.validateRawData<RawFullTarget>('database-raw-full-target', rawModel)
    this.validateRawData<TargetAccessLevel>('database-target-access-level', rawModel.access_level)

    return new FullTargetModel(
      rawModel.campaign_id,
      rawModel.target_id,
      rawModel.access_level,
      !!rawModel.donor_secure,
      rawModel.donor_sub,
      rawModel.donor_domain,
      rawModel.donor_port,
      !!rawModel.mirror_secure,
      rawModel.mirror_sub,
      rawModel.mirror_domain,
      rawModel.mirror_port,
      rawModel.labels,
      rawModel.connect_timeout,
      rawModel.simple_timeout,
      rawModel.stream_timeout,
      rawModel.headers_size_limit,
      rawModel.body_size_limit,
      rawModel.main_page,
      rawModel.not_found_page,
      rawModel.favicon_ico,
      rawModel.robots_txt,
      rawModel.sitemap_xml,
      !!rawModel.allow_websockets,
      !!rawModel.is_enabled,
      rawModel.message_count,
      new Date(rawModel.created_at)
    )
  }

  protected buildCollection(rawCollection: unknown): TargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection.map((rawModel) => this.buildModel(rawModel)).filter(TargetModel.isNotNull)
  }

  protected buildFullCollection(rawCollection: unknown): FullTargetModel[] {
    this.validateArrayReply(rawCollection)

    return rawCollection
      .map((rawModel) => this.buildFullModel(rawModel))
      .filter(TargetModel.isNotNull)
  }

  protected buildTargetLink(value: unknown): [string, string] {
    this.validateArrayStringsReply(value)

    const [campaignId, targetId] = value

    if (!(campaignId && targetId)) {
      throw new DatabaseError(`TargetLink validate failed`, {
        code: 'INTERNAL_ERROR',
      })
    }

    return [campaignId, targetId]
  }
}
