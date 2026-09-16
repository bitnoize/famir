import { DIContainer } from '@famir/common'
import {
  FullMessageModel,
  Logger,
  LOGGER,
  MessageModel,
  TEMPLATER,
  Templater,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  type ReplServerAssets,
  type ReplServerRouter,
} from '@famir/repl-server'
import { BaseController } from '../base/index.js'
import { DeleteMessageArgs, ListMessagesArgs, ReadMessageArgs } from './message.js'
import {
  deleteMessageArgsSchema,
  listMessagesArgsSchema,
  readMessageArgsSchema,
} from './message.schemas.js'
import { MESSAGE_SERVICE, type MessageService } from './message.service.js'

/**
 * DI token for the message controller.
 *
 * @category Message
 */
export const MESSAGE_CONTROLLER = Symbol('MessageController')

/**
 * Represents the message controller.
 *
 * @category Message
 */
export class MessageController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<MessageController>(
      MESSAGE_CONTROLLER,
      (c) =>
        new MessageController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<Templater>(TEMPLATER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<MessageService>(MESSAGE_SERVICE)
        )
    )
  }

  /**
   * Resolves the controller from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The controller instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<MessageController>(MESSAGE_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param messageService - The message service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly messageService: MessageService
  ) {
    super(validator, logger, templater, assets, router)

    this.validator
      .addSchema('console-read-message-args', readMessageArgsSchema)
      .addSchema('console-delete-message-args', deleteMessageArgsSchema)
      .addSchema('console-list-messages-args', listMessagesArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<ReadMessageArgs>(
      {
        name: 'message-read',
        description: `Reads the message by its ID.`,
        schemaName: 'console-read-message-args',
        options: [
          {
            name: 'show-headers',
            description: `Show message headers.`,
            type: 'boolean',
            alias: 'i',
            default: false,
          },
          {
            name: 'show-connection',
            description: `Show message connection.`,
            type: 'boolean',
            alias: 'c',
            default: false,
          },
          {
            name: 'show-payload',
            description: `Show message payload.`,
            type: 'boolean',
            alias: 'p',
            default: false,
          },
        ],
        params: ['campaign-id', 'message-id'],
      },
      null,
      async (console, spec, args) => {
        const [campaignId, messageId] = args._

        const message = await this.messageService.read({
          campaignId,
          messageId,
        })

        this.showMessageModel(
          console,
          message,
          args.showHeaders,
          args.showConnection,
          args.showPayload
        )
      }
    )

    this.router.addCommand<DeleteMessageArgs>(
      {
        name: 'message-delete',
        description: `Deletes the message by its ID.`,
        schemaName: 'console-delete-message-args',
        options: [],
        params: ['campaign-id', 'message-id'],
      },
      null,
      async (console, spec, args) => {
        const [campaignId, messageId] = args._

        await this.messageService.delete({
          campaignId,
          messageId,
        })

        console.log(`Message deleted!`)
      }
    )

    this.router.addCommand<ListMessagesArgs>(
      {
        name: 'message-list',
        description: `Lists campaign message history.`,
        schemaName: 'console-list-messages-args',
        options: [
          {
            name: 'limit',
            description: `Limit on the number of records.`,
            type: 'number',
            alias: 'l',
            default: 100,
          },
        ],
        params: ['campaign-id'],
      },
      null,
      async (console, spec, args) => {
        const [campaignId] = args._

        const messages = await this.messageService.list({
          campaignId,
          limit: args.limit,
        })

        this.showMessageCollection(console, messages)
      }
    )
  }

  private showMessageModel(
    console: Console,
    message: FullMessageModel,
    showHeaders: boolean,
    showConnection: boolean,
    showPayload: boolean
  ) {
    console.table({
      campaignId: message.campaignId,
      messageId: message.messageId,
      proxyId: message.proxyId,
      targetId: message.targetId,
      sessionId: message.sessionId,
      type: message.type,
      method: message.method,
      url: message.url,
      requestHeaders: Object.keys(message.requestHeaders).length,
      requestBody: message.requestBody.length,
      status: message.status,
      responseHeaders: Object.keys(message.responseHeaders).length,
      responseBody: message.responseBody.length,
      analyze: message.analyze,
      totalTime: message.totalTime,
      createdAt: message.createdAt.toISOString(),
    })

    if (message.hasErrors) {
      console.log(`Errors:`, message.errors)
    }

    if (showHeaders) {
      console.log(`Request headers:`, message.requestHeaders)
      console.log(`Response headers:`, message.responseHeaders)
    }

    if (showConnection) {
      console.log(`Connection:`, message.connection)
    }

    if (showPayload) {
      console.log(`Payload:`, message.payload)
    }
  }

  private showMessageCollection(console: Console, messages: MessageModel[]) {
    console.table(
      messages.map((message) => {
        return {
          //campaignId: message.campaignId,
          messageId: message.messageId,
          proxyId: message.proxyId,
          targetId: message.targetId,
          sessionId: message.sessionId,
          type: message.type,
          //method: message.method,
          //url: message.url,
          //status: message.status,
          //analyze: message.analyze,
          //totalTime: message.totalTime,
          createdAt: message.createdAt.toISOString(),
        }
      })
    )
  }
}
