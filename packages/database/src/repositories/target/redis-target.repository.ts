import {
  Config,
  DatabaseError,
  DisabledTarget,
  EnabledTarget,
  Logger,
  RepositoryContainer,
  Target,
  TargetRepository,
  Validator
} from '@famir/domain'
import { DatabaseConfig } from '../../database.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  assertDisabledTarget,
  assertEnabledTarget,
  buildTargetCollection,
  buildTargetModel,
  guardEnabledTarget,
  guardTarget
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
  ): Promise<RepositoryContainer<DisabledTarget>> {
    try {
      const [status, rawTarget] = await Promise.all([
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
        const target = buildTargetModel(rawTarget)

        assertDisabledTarget(target)

        return [true, target, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'CONFLICT'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
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

  async read(campaignId: string, id: string): Promise<Target | null> {
    try {
      const rawTarget = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        id
      )

      return buildTargetModel(rawTarget)
    } catch (error) {
      this.exceptionFilter(error, 'read', { campaignId, id })
    }
  }

  async readEnabled(campaignId: string, id: string): Promise<EnabledTarget | null> {
    try {
      const rawTarget = await this.connection.target.read_target(
        this.options.prefix,
        campaignId,
        id
      )

      const target = buildTargetModel(rawTarget)

      return guardEnabledTarget(target) ? target : null
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
  ): Promise<RepositoryContainer<DisabledTarget>> {
    try {
      const [status, rawTarget] = await Promise.all([
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
        const target = buildTargetModel(rawTarget)

        assertDisabledTarget(target)

        return [true, target, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
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

  async enable(campaignId: string, id: string): Promise<RepositoryContainer<EnabledTarget>> {
    try {
      const [status, rawTarget] = await Promise.all([
        this.connection.target.enable_target(this.options.prefix, campaignId, id),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const target = buildTargetModel(rawTarget)

        assertEnabledTarget(target)

        return [true, target, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { campaignId, id })
    }
  }

  async disable(campaignId: string, id: string): Promise<RepositoryContainer<DisabledTarget>> {
    try {
      const [status, rawTarget] = await Promise.all([
        this.connection.target.disable_target(this.options.prefix, campaignId, id),

        this.connection.target.read_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const target = buildTargetModel(rawTarget)

        assertDisabledTarget(target)

        return [true, target, code, message]
      }

      const isKnownError = ['NOT_FOUND'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { campaignId, id })
    }
  }

  async delete(campaignId: string, id: string): Promise<RepositoryContainer<DisabledTarget>> {
    try {
      const [rawTarget, status] = await Promise.all([
        this.connection.target.read_target(this.options.prefix, campaignId, id),

        this.connection.target.delete_target(this.options.prefix, campaignId, id)
      ])

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        const target = buildTargetModel(rawTarget)

        assertDisabledTarget(target)

        return [true, target, code, message]
      }

      const isKnownError = ['NOT_FOUND', 'FORBIDDEN'].includes(code)

      if (isKnownError) {
        return [false, null, code, message]
      }

      throw new DatabaseError({ code }, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { campaignId, id })
    }
  }

  async list(campaignId: string): Promise<Target[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const rawTargets = await Promise.all(
        index.map((id) => this.connection.target.read_target(this.options.prefix, campaignId, id))
      )

      return buildTargetCollection(rawTargets).filter(guardTarget)
    } catch (error) {
      this.exceptionFilter(error, 'list', { campaignId })
    }
  }

  async listEnabled(campaignId: string): Promise<EnabledTarget[] | null> {
    try {
      const index = await this.connection.target.read_target_index(this.options.prefix, campaignId)

      if (index === null) {
        return null
      }

      const rawTargets = await Promise.all(
        index.map((id) => this.connection.target.read_target(this.options.prefix, campaignId, id))
      )

      return buildTargetCollection(rawTargets).filter(guardEnabledTarget)
    } catch (error) {
      this.exceptionFilter(error, 'listEnabled', { campaignId })
    }
  }
}
