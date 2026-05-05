import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'
import { FullMessageModel, MessageModel } from './message.models.js'

/**
 * DI token for message repository.
 *
 * @category Message
 * @internal
 */
export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

/**
 * Represents a message repository.
 *
 * @category Message
 */
export interface MessageRepository {
  /**
   * Creates a message with complete HTTP transaction details.
   *
   * @param campaignId - The ID of the campaign to create the message in
   * @param messageId - The unique identifier for the message
   * @param proxyId - The ID of the proxy that processed this message
   * @param targetId - The ID of the target that handled this message
   * @param sessionId - The ID of the session that generated this message
   * @param type - The message type
   * @param method - The HTTP method
   * @param url - The request URL
   * @param requestHeaders - The request headers
   * @param requestBody - The request body
   * @param status - The HTTP status code
   * @param responseHeaders - The response headers
   * @param responseBody - The response body
   * @param connection - Connection details
   * @param payload - Payload information
   * @param errors - Array of errors that occurred during processing
   * @param analyze - Analyze identifier
   * @param startTime - Start timestamp
   * @param finishTime - Finish timestamp
   *
   * @throws {@link DatabaseError} If any of the referenced entities does not exist
   * @throws {@link DatabaseError} If a message with the same ID already exists
   */
  create(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    requestHeaders: HttpHeaders,
    requestBody: HttpBody,
    status: number,
    responseHeaders: HttpHeaders,
    responseBody: HttpBody,
    connection: HttpConnection,
    payload: HttpPayload,
    errors: HttpError[],
    analyze: string,
    startTime: number,
    finishTime: number
  ): Promise<void>

  /**
   * Creates a dummy message.
   *
   * @param campaignId - The ID of the campaign to create the message in
   * @param messageId - The unique identifier for the message
   * @param proxyId - The ID of the proxy that processed this message
   * @param targetId - The ID of the target that handled this message
   * @param sessionId - The ID of the session that generated this message
   *
   * @throws {@link DatabaseError} If any of the referenced entities does not exist
   * @throws {@link DatabaseError} If a message with the same ID already exists
   */
  createDummy(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string
  ): Promise<void>

  /**
   * Reads a message by its ID.
   *
   * @param campaignId - The ID of the campaign containing the message
   * @param messageId - The unique identifier of the message
   * @returns The message model, or `null` if not found
   */
  read(campaignId: string, messageId: string): Promise<MessageModel | null>

  /**
   * Reads a full message by its ID.
   *
   * @param campaignId - The ID of the campaign containing the message
   * @param messageId - The unique identifier of the message
   * @returns The full message model, or `null` if not found
   */
  readFull(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
