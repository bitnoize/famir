import {
  HttpBody,
  HttpConnection,
  HttpError,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/http-proto'

/**
 * Represents a message model.
 *
 * @category Message
 */
export class MessageModel {
  /**
   * Type guard to filter out null values in arrays.
   *
   * @param model - The model to check
   * @returns `true` if the model is not null, `false` otherwise
   */
  static isNotNull = <T extends MessageModel>(model: T | null): model is T => {
    return model != null
  }

  /**
   * Creates a new message model instance.
   *
   * @param campaignId - The ID of the campaign this message belongs to
   * @param messageId - The unique identifier of the message
   * @param proxyId - The ID of the proxy that processed this message
   * @param targetId - The ID of the target that handled this message
   * @param sessionId - The ID of the session that generated this message
   * @param type - The message type
   * @param method - The HTTP method
   * @param url - The request URL
   * @param status - The HTTP status code
   * @param analyze - Analyze identifier
   * @param startTime - Start timestamp
   * @param finishTime - Finish timestamp
   * @param createdAt - The date and time when the message was created
   */
  constructor(
    readonly campaignId: string,
    readonly messageId: string,
    readonly proxyId: string,
    readonly targetId: string,
    readonly sessionId: string,
    readonly type: HttpType,
    readonly method: HttpMethod,
    readonly url: string,
    readonly status: number,
    readonly analyze: string,
    readonly startTime: number,
    readonly finishTime: number,
    readonly createdAt: Date
  ) {}

  /**
   * Calculates the total processing time of the message.
   *
   * @returns The difference between `finishTime` and `startTime`
   */
  get totalTime(): number {
    return this.finishTime > this.startTime ? this.finishTime - this.startTime : 0
  }
}

/**
 * Represents a full message model.
 *
 * @category Message
 */
export class FullMessageModel extends MessageModel {
  /**
   * Creates a new full message model instance.
   *
   * @param campaignId - The ID of the campaign this message belongs to
   * @param messageId - The unique identifier of the message
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
   * @param createdAt - The date and time when the message was created
   */
  constructor(
    campaignId: string,
    messageId: string,
    proxyId: string,
    targetId: string,
    sessionId: string,
    type: HttpType,
    method: HttpMethod,
    url: string,
    readonly requestHeaders: HttpHeaders,
    readonly requestBody: HttpBody,
    status: number,
    readonly responseHeaders: HttpHeaders,
    readonly responseBody: HttpBody,
    readonly connection: HttpConnection,
    readonly payload: HttpPayload,
    readonly errors: HttpError[],
    analyze: string,
    startTime: number,
    finishTime: number,
    createdAt: Date
  ) {
    super(
      campaignId,
      messageId,
      proxyId,
      targetId,
      sessionId,
      type,
      method,
      url,
      status,
      analyze,
      startTime,
      finishTime,
      createdAt
    )
  }
}
