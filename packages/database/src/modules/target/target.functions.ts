import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  targetDonorsKey,
  targetHostsKey,
  targetIndexKey,
  targetKey,
  targetLabelsKey,
  targetMirrorsKey,
} from '../../database.keys.js'
import { TargetAccessLevel } from './target.models.js'

/**
 * Raw target data structure.
 *
 * @category Target
 * @internal
 */
export interface RawTarget {
  campaign_id: string
  target_id: string
  access_level: TargetAccessLevel
  donor_secure: boolean
  donor_sub: string
  donor_domain: string
  donor_port: number
  mirror_secure: boolean
  mirror_sub: string
  mirror_domain: string
  mirror_port: number
  is_enabled: boolean
  message_count: number
  created_at: number
}

/**
 * Raw full target data structure.
 *
 * @category Target
 * @internal
 */
export interface RawFullTarget extends RawTarget {
  labels: string[]
  connect_timeout: number
  simple_timeout: number
  stream_timeout: number
  headers_size_limit: number
  body_size_limit: number
  main_page: string
  not_found_page: string
  favicon_ico: string
  robots_txt: string
  sitemap_xml: string
  allow_websockets: boolean
}

/**
 * Redis Lua function definitions for target operations.
 *
 * @category Target
 * @internal
 */
export const targetFunctions = {
  target: {
    create_target: {
      NUMBER_OF_KEYS: 7,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        accessLevel: string,
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
        createdAt: number,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetDonorsKey(prefix, campaignId))
        parser.pushKey(targetMirrorsKey(prefix, campaignId))
        parser.pushKey(targetHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(targetId)
        parser.push(accessLevel)
        parser.push(donorSecure ? '1' : '0')
        parser.push(donorSub)
        parser.push(donorDomain)
        parser.push(donorPort.toString())
        parser.push(mirrorSecure ? '1' : '0')
        parser.push(mirrorSub)
        parser.push(mirrorPort.toString())
        parser.push(connectTimeout.toString())
        parser.push(simpleTimeout.toString())
        parser.push(streamTimeout.toString())
        parser.push(headersSizeLimit.toString())
        parser.push(bodySizeLimit.toString())
        parser.push(mainPage)
        parser.push(notFoundPage)
        parser.push(faviconIco)
        parser.push(robotsTxt)
        parser.push(sitemapXml)
        parser.push(allowWebSockets ? '1' : '0')
        parser.push(createdAt.toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_full_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_target_hosts: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string) {
        parser.pushKey(targetHostsKey(prefix))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    find_target_link: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string, mirrorHost: string) {
        parser.pushKey(targetHostsKey(prefix))

        parser.push(mirrorHost)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_target_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    update_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
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
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(connectTimeout.toString())
        parser.push(simpleTimeout.toString())
        parser.push(streamTimeout.toString())
        parser.push(headersSizeLimit.toString())
        parser.push(bodySizeLimit.toString())
        parser.push(mainPage)
        parser.push(notFoundPage)
        parser.push(faviconIco)
        parser.push(robotsTxt)
        parser.push(sitemapXml)
        parser.push(allowWebSockets ? '1' : '0')
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    enable_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    disable_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    append_target_label: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        label: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))

        parser.push(label)
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    remove_target_labels: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    delete_target: {
      NUMBER_OF_KEYS: 8,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
        parser.pushKey(targetDonorsKey(prefix, campaignId))
        parser.pushKey(targetMirrorsKey(prefix, campaignId))
        parser.pushKey(targetHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },
  },
} as const
