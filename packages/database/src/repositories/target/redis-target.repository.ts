import {
  Config,
  DatabaseError,
  DisabledTargetModel,
  EnabledTargetModel,
  Logger,
  TargetModel,
  TargetRepository,
  Validator
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
  constructor(
    validator: Validator,
    config: Config<DatabaseConfig>,
    logger: Logger,
    connection: RedisDatabaseConnection
  ) {
    super(validator, config, logger, connection, 'target')
  }

  async create(
    campaignId: string,
    id: string,
    isLanding: boolean,
    donorSecure: boolean,
    donorSub: string,
    donorDomain: string,
    donorPort: number,
    mirrorSecure: boolean,
    mirrorSub: string,
    mirrorDomain: string,
    mirrorPort: number,
    connectTimeout: number,
    timeout: number,
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    successRedirectUrl: string,
    failureRedirectUrl: string
  ): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.create_target(
          this.options.prefix,
          campaignId,
          id,
          isLanding,
          donorSecure,
          donorSub,
          donorDomain,
          donorPort,
          mirrorSecure,
          mirrorSub,
          mirrorDomain,
          mirrorPort,
          connectTimeout,
          timeout,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml,
          successRedirectUrl,
          failureRedirectUrl
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'create', {
        campaignId,
        id,
        isLanding,
        donorSecure,
        donorSub,
        donorDomain,
        donorPort,
        mirrorSecure,
        mirrorSub,
        mirrorDomain,
        mirrorPort,
        connectTimeout,
        timeout,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        successRedirectUrl,
        failureRedirectUrl
      })
    }
  }

  async read(campaignId: string, id: string): Promise<TargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(this.options.prefix, campaignId, id)

      return buildModel(raw)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async readEnabled(campaignId: string, id: string): Promise<EnabledTargetModel | null> {
    try {
      const raw = await this.connection.target.read_target(this.options.prefix, campaignId, id)

      const model = buildModel(raw)

      return guardEnabledModel(model) ? model : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', { campaignId, id })
    }
  }

  async update(
    campaignId: string,
    id: string,
    connectTimeout: number | null | undefined,
    timeout: number | null | undefined,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    successRedirectUrl: string | null | undefined,
    failureRedirectUrl: string | null | undefined
  ): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.update_target(
          this.options.prefix,
          campaignId,
          id,
          connectTimeout,
          timeout,
          mainPage,
          notFoundPage,
          faviconIco,
          robotsTxt,
          sitemapXml,
          successRedirectUrl,
          failureRedirectUrl
        ),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        campaignId,
        id,
        connectTimeout,
        timeout,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        successRedirectUrl,
        failureRedirectUrl
      })
    }
  }

  async enable(campaignId: string, id: string): Promise<EnabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, campaignId, id),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertEnabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<DisabledTargetModel> {
    try {
      const [status, raw] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, campaignId, id),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(campaignId: string, id: string): Promise<DisabledTargetModel> {
    try {
      const [raw, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, campaignId, id),

        this.connection.target.delete_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const model = buildModel(raw)

        assertDisabledModel(model)

        return model
      }

      throw new DatabaseError(message, { code })
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<TargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) => this.connection.target.read_target(this.options.prefix, campaignId, id))
      )

      return buildCollection(raws).filter(guardModel)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }

  async listEnabled(campaignId: string): Promise<EnabledTargetModel[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const raws = await Promise.all(
        index.map((id) => this.connection.target.read_target(this.options.prefix, campaignId, id))
      )

      return buildCollection(raws).filter(guardEnabledModel)
    } catch (error) {
      this.exceptionFilter(error, 'listEnabled', { campaignId })
    }
  }
}
