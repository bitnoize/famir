import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  targetIndexKey,
  targetKey,
  targetLabelsKey,
  targetMirrorHostsKey,
  targetUniqueDonorKey,
  targetUniqueMirrorKey
} from '../../database.keys.js'

export interface RawTarget {
  campaign_id: string
  target_id: string
  is_landing: number
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
  updated_at: number
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
        headersSizeLimit: number,
        bodySizeLimit: number,
        mainPage: string,
        notFoundPage: string,
        faviconIco: string,
        robotsTxt: string,
        sitemapXml: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetMirrorHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(targetId)
        parser.push(isLanding ? '1' : '0')
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
        parser.push(Date.now().toString())
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
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        if (connectTimeout != null) {
          parser.push('connect_timeout')
          parser.push(connectTimeout.toString())
        }

        if (simpleTimeout != null) {
          parser.push('simple_timeout')
          parser.push(simpleTimeout.toString())
        }

        if (streamTimeout != null) {
          parser.push('stream_timeout')
          parser.push(streamTimeout.toString())
        }

        if (headersSizeLimit != null) {
          parser.push('headers_size_limit')
          parser.push(headersSizeLimit.toString())
        }

        if (bodySizeLimit != null) {
          parser.push('body_size_limit')
          parser.push(bodySizeLimit.toString())
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

        parser.push(Date.now().toString())
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

        parser.push(Date.now().toString())
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

        parser.push(Date.now().toString())
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
        parser.push(Date.now().toString())
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
        parser.push(Date.now().toString())
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
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetMirrorHostsKey(prefix))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
