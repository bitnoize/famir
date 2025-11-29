import {
  HttpBody,
  HttpHeaders,
  HttpLog,
  HttpRequestCookies,
  HttpResponseCookies
} from '@famir/domain'
import { CommandParser } from '@redis/client'
import { campaignKey, messageKey, proxyKey, sessionKey, targetKey } from '../../database.keys.js'

export interface RawMessage {
  campaign_id: string
  message_id: string
  proxy_id: string
  target_id: string
  session_id: string
  method: string
  url: string
  is_streaming: number
  status: number
  score: number
  start_time: number
  finish_time: number
  created_at: number
}

export interface RawFullMessage extends RawMessage {
  request_headers: string
  request_cookies: string
  request_body: string
  response_headers: string
  response_cookies: string
  response_body: string
  client_ip: string
  logs: string
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
        method: string,
        url: string,
        isStreaming: boolean,
        requestHeaders: HttpHeaders,
        requestCookies: HttpRequestCookies,
        requestBody: HttpBody,
        responseHeaders: HttpHeaders,
        responseCookies: HttpResponseCookies,
        responseBody: HttpBody,
        clientIp: string,
        status: number,
        score: number,
        startTime: number,
        finishTime: number,
        logs: HttpLog[]
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
        parser.pushKey(proxyKey(prefix, campaignId, messageId))
        parser.pushKey(targetKey(prefix, campaignId, messageId))
        parser.pushKey(sessionKey(prefix, campaignId, messageId))

        parser.push(campaignId)
        parser.push(messageId)
        parser.push(proxyId)
        parser.push(targetId)
        parser.push(sessionId)
        parser.push(method)
        parser.push(url)
        parser.push(isStreaming ? '1' : '0')
        parser.push(JSON.stringify(requestHeaders))
        parser.push(JSON.stringify(requestCookies))
        parser.push(requestBody.toString('base64'))
        parser.push(JSON.stringify(responseHeaders))
        parser.push(JSON.stringify(responseCookies))
        parser.push(responseBody.toString('base64'))
        parser.push(clientIp)
        parser.push(status.toString())
        parser.push(score.toString())
        parser.push(startTime.toString())
        parser.push(finishTime.toString())
        parser.push(JSON.stringify(logs))
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
