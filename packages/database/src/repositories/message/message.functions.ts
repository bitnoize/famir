import { CommandParser } from '@redis/client'
import { campaignKey, messageKey, proxyKey, sessionKey, targetKey } from '../../database.keys.js'

export interface RawMessage {
  campaign_id: string
  message_id: string
  proxy_id: string
  target_id: string
  session_id: string
  kind: string
  method: string
  url: string
  status: number
  score: number
  ip: string
  start_time: number
  finish_time: number
  created_at: number
}

export interface RawFullMessage extends RawMessage {
  request_headers: string
  request_body: string
  response_headers: string
  response_body: string
  connection: string
  payload: string
  errors: string
}

export const messageFunctions = {
  message: {
    create_message: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        messageId: string,
        proxyId: string,
        targetId: string,
        sessionId: string,
        kind: string,
        method: string,
        url: string,
        requestHeaders: string,
        requestBody: string,
        status: number,
        responseHeaders: string,
        responseBody: string,
        connection: string,
        payload: string,
        errors: string,
        score: number,
        ip: string,
        startTime: number,
        finishTime: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))

        parser.push(campaignId)
        parser.push(messageId)
        parser.push(proxyId)
        parser.push(targetId)
        parser.push(sessionId)
        parser.push(kind)
        parser.push(method)
        parser.push(url)
        parser.push(requestHeaders)
        parser.push(requestBody)
        parser.push(status.toString())
        parser.push(responseHeaders)
        parser.push(responseBody)
        parser.push(connection)
        parser.push(payload)
        parser.push(errors)
        parser.push(score.toString())
        parser.push(ip)
        parser.push(startTime.toString())
        parser.push(finishTime.toString())
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_message: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, messageId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_full_message: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, messageId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
