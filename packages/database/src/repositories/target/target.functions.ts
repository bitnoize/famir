import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  targetDonorsKey,
  targetIndexKey,
  targetKey,
  targetLabelsKey,
  targetMirrorHostsKey,
  targetMirrorsKey
} from '../../database.keys.js'

export interface RawTarget {
  campaign_id: string
  target_id: string
  access_level: string
  donor_secure: number
  donor_sub: string
  donor_domain: string
  donor_port: number
  mirror_secure: number
  mirror_sub: string
  mirror_domain: string
  mirror_port: number
  labels: string[]
  is_enabled: number
  message_count: number
  created_at: number
}

export interface RawFullTarget extends RawTarget {
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
  allow_websockets: number
}

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
        donorSecure: string,
        donorSub: string,
        donorDomain: string,
        donorPort: string,
        mirrorSecure: string,
        mirrorSub: string,
        mirrorPort: string,
        connectTimeout: string,
        simpleTimeout: string,
        streamTimeout: string,
        headersSizeLimit: string,
        bodySizeLimit: string,
        mainPage: string,
        notFoundPage: string,
        faviconIco: string,
        robotsTxt: string,
        sitemapXml: string,
        allowWebSockets: string,
        createdAt: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetDonorsKey(prefix, campaignId))
        parser.pushKey(targetMirrorsKey(prefix, campaignId))
        parser.pushKey(targetMirrorHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(targetId)
        parser.push(accessLevel)
        parser.push(donorSecure)
        parser.push(donorSub)
        parser.push(donorDomain)
        parser.push(donorPort)
        parser.push(mirrorSecure)
        parser.push(mirrorSub)
        parser.push(mirrorPort)
        parser.push(connectTimeout)
        parser.push(simpleTimeout)
        parser.push(streamTimeout)
        parser.push(headersSizeLimit)
        parser.push(bodySizeLimit)
        parser.push(mainPage)
        parser.push(notFoundPage)
        parser.push(faviconIco)
        parser.push(robotsTxt)
        parser.push(sitemapXml)
        parser.push(allowWebSockets)
        parser.push(createdAt)
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_full_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetLabelsKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    find_target_link: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string, mirrorHost: string) {
        parser.pushKey(targetMirrorHostsKey(prefix))

        parser.push(mirrorHost)
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_target_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    update_target: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        connectTimeout: string | null,
        simpleTimeout: string | null,
        streamTimeout: string | null,
        headersSizeLimit: string | null,
        bodySizeLimit: string | null,
        mainPage: string | null,
        notFoundPage: string | null,
        faviconIco: string | null,
        robotsTxt: string | null,
        sitemapXml: string | null,
        allowWebSockets: string | null,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        if (connectTimeout != null) {
          parser.push('connect_timeout')
          parser.push(connectTimeout)
        }

        if (simpleTimeout != null) {
          parser.push('simple_timeout')
          parser.push(simpleTimeout)
        }

        if (streamTimeout != null) {
          parser.push('stream_timeout')
          parser.push(streamTimeout)
        }

        if (headersSizeLimit != null) {
          parser.push('headers_size_limit')
          parser.push(headersSizeLimit)
        }

        if (bodySizeLimit != null) {
          parser.push('body_size_limit')
          parser.push(bodySizeLimit)
        }

        if (mainPage != null) {
          parser.push('main_page')
          parser.push(mainPage)
        }

        if (notFoundPage != null) {
          parser.push('not_found_page')
          parser.push(notFoundPage)
        }

        if (faviconIco != null) {
          parser.push('favicon_ico')
          parser.push(faviconIco)
        }

        if (robotsTxt != null) {
          parser.push('robots_txt')
          parser.push(robotsTxt)
        }

        if (sitemapXml != null) {
          parser.push('sitemap_xml')
          parser.push(sitemapXml)
        }

        if (allowWebSockets != null) {
          parser.push('allow_websockets')
          parser.push(allowWebSockets)
        }

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
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

      transformReply: undefined as unknown as () => unknown
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

      transformReply: undefined as unknown as () => unknown
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

        parser.push(label.toLowerCase())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    remove_target_label: {
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

        parser.push(label.toLowerCase())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
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
        parser.pushKey(targetMirrorHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
