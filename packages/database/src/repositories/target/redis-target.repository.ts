import { EnabledTarget, Target, TargetRepository } from '@famir/domain'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { DatabaseError } from '../../database.errors.js'
import { parseStatusReply } from '../../database.utils.js'
import { RedisDatabaseConnection } from '../../redis-database-connector.js'
import { RedisBaseRepository } from '../base/index.js'
import {
  buildTargetCollection,
  buildTargetModel,
  guardEnabledTarget,
  guardTarget
} from './target.utils.js'

export class RedisTargetRepository extends RedisBaseRepository implements TargetRepository {
  constructor(validator: Validator, logger: Logger, connection: RedisDatabaseConnection) {
    super(validator, logger, connection, 'target')
  }

  async create(
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
    mainPage: string,
    notFoundPage: string,
    faviconIco: string,
    robotsTxt: string,
    sitemapXml: string,
    successRedirectUrl: string,
    failureRedirectUrl: string
  ): Promise<void> {
    try {
      const status = await this.connection.target.create_target(
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
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        successRedirectUrl,
        failureRedirectUrl
      )

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'create', {
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

  async read(id: string): Promise<Target | null> {
    try {
      const rawTarget = await this.connection.target.read_target(id)

      const target = buildTargetModel(rawTarget)

      return guardTarget(target) ? target : null
    } catch (error) {
      this.exceptionFilter(error, 'read', { id })
    }
  }

  async readEnabled(id: string): Promise<EnabledTarget | null> {
    try {
      const rawTarget = await this.connection.target.read_target(id)

      const target = buildTargetModel(rawTarget)

      return guardEnabledTarget(target) ? target : null
    } catch (error) {
      this.exceptionFilter(error, 'readEnabled', { id })
    }
  }

  async update(
    id: string,
    mainPage: string | null | undefined,
    notFoundPage: string | null | undefined,
    faviconIco: string | null | undefined,
    robotsTxt: string | null | undefined,
    sitemapXml: string | null | undefined,
    successRedirectUrl: string | null | undefined,
    failureRedirectUrl: string | null | undefined
  ): Promise<void> {
    try {
      const status = await this.connection.target.update_target(
        id,
        mainPage,
        notFoundPage,
        faviconIco,
        robotsTxt,
        sitemapXml,
        successRedirectUrl,
        failureRedirectUrl
      )

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'update', {
        id,
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

  async enable(id: string): Promise<void> {
    try {
      const status = await this.connection.target.enable_target(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'enable', { id })
    }
  }

  async disable(id: string): Promise<void> {
    try {
      const status = await this.connection.target.disable_target(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'disable', { id })
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const status = await this.connection.target.delete_target(id)

      const [code, message] = parseStatusReply(status)

      if (code === 'OK') {
        return
      }

      throw new DatabaseError(code, {}, message)
    } catch (error) {
      this.exceptionFilter(error, 'delete', { id })
    }
  }

  async list(): Promise<Target[] | null> {
    try {
      const index = await this.connection.target.read_target_index()

      if (index === null) {
        return null
      }

      const rawTargets = await Promise.all(
        index.map((id) => this.connection.target.read_target(id))
      )

      return buildTargetCollection(rawTargets).filter(guardTarget)
    } catch (error) {
      this.exceptionFilter(error, 'list')
    }
  }

  async listEnabled(): Promise<EnabledTarget[] | null> {
    try {
      const index = await this.connection.target.read_target_index()

      if (index === null) {
        return null
      }

      const rawTargets = await Promise.all(
        index.map((id) => this.connection.target.read_target(id))
      )

      return buildTargetCollection(rawTargets).filter(guardEnabledTarget)
    } catch (error) {
      this.exceptionFilter(error, 'list')
    }
  }
}
