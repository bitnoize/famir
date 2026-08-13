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
 * DI token for a message repository implementation.
 *
 * @category Message
 */
export const MESSAGE_REPOSITORY = Symbol('MessageRepository')

/**
 * Defines the public contract for a message repository.
 *
 * A message contains a complete HTTP request/response transaction for analysis.
 * Messages are immutable records that capture all details of a processed request.
 *
 * @category Message
 */
export interface MessageRepository {
  /**
   * Creates a new message.
   *
   * @param campaignId - The ID of the campaign to create the message in.
   * @param messageId - The new message ID to create.
   * @param proxyId - The ID of the proxy that processed this message.
   * @param targetId - The ID of the target that handled this message.
   * @param sessionId - The ID of the session that generated this message.
   * @param type - The message type.
   * @param method - The HTTP method.
   * @param url - The HTTP request URL.
   * @param requestHeaders - The HTTP request headers.
   * @param requestBody - The HTTP request body.
   * @param status - The HTTP status code.
   * @param responseHeaders - The HTTP response headers.
   * @param responseBody - The HTTP response body.
   * @param connection - The connection details.
   * @param payload - The payload data extracted from the transaction.
   * @param errors - The list of errors that occurred during processing.
   * @param analyze - The analyze identifier.
   * @param startTime - The start processing timestamp.
   * @param finishTime - The finish processing timestamp.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the proxy does not exist.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the session does not exist.
   * @throws DatabaseError If a message with the same ID already exists.
   * @throws DatabaseError If the data validation fails.
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
   * Creates a new dummy message.
   *
   * This method only increments counters and does not store the actual message data.
   * Useful for tracking traffic without storing full transaction details.
   *
   * @param campaignId - The ID of the campaign to create the message in.
   * @param messageId - The new message ID to create.
   * @param proxyId - The ID of the proxy that processed this message.
   * @param targetId - The ID of the target that handled this message.
   * @param sessionId - The ID of the session that generated this message.
   * @throws DatabaseError If the campaign does not exist.
   * @throws DatabaseError If the proxy does not exist.
   * @throws DatabaseError If the target does not exist.
   * @throws DatabaseError If the session does not exist.
   * @throws DatabaseError If a message with the same ID already exists.
   * @throws DatabaseError If the data validation fails.
   */
  createDummy(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string
  ): Promise<void>

  /**
   * Reads the message by its ID.
   *
   * @param campaignId - The ID of the campaign containing the message.
   * @param messageId - The message ID to read.
   * @returns The message model, or `null` if the message is not found.
   * @throws DatabaseError If the data validation fails.
   */
  read(campaignId: string, messageId: string): Promise<MessageModel | null>

  /**
   * Reads the full message by its ID.
   *
   * @param campaignId - The ID of the campaign containing the message.
   * @param messageId - The message ID to read.
   * @returns The full message model, or `null` if the message is not found.
   * @throws DatabaseError If the data validation fails.
   */
  readFull(campaignId: string, messageId: string): Promise<FullMessageModel | null>
}
