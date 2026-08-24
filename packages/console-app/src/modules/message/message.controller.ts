import { DIContainer } from '@famir/common'
import { FullMessageModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import {
  REPL_SERVER_ASSETS,
  REPL_SERVER_ROUTER,
  ReplServerAssets,
  ReplServerRouter,
} from '@famir/repl-server'
import { TEMPLATER, Templater } from '@famir/templater'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ReadMessageArgs } from './message.js'
import { readMessageArgsSchema } from './message.schemas.js'
import { type MessageService, MESSAGE_SERVICE } from './message.service.js'

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

    this.validator.addSchema('console-read-message-args', readMessageArgsSchema)
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
        options: [],
        params: ['campaign-id', 'message-id'],
      },
      (console, spec) => {
        console.log(`// Reads some message in the 'httpbin' campaign:`)
        console.log(`.${spec.name} httpbin 5ad44dbcf927457eadc57d8de23eb7c1\n`)
      },
      async (console, spec, args) => {
        const [campaignId, messageId] = args._

        const message = await this.messageService.read({
          campaignId,
          messageId,
        })

        this.showMessageModel(console, message)
      }
    )
  }

  private showMessageModel(console: Console, message: FullMessageModel) {
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

    console.log(`Request headers:`, message.requestHeaders)
    console.log(`Response headers:`, message.responseHeaders)
    console.log(`Connection:`, message.connection)
    console.log(`Payload:`, message.payload)
    if (message.hasErrors) {
      console.log(`Errors:`, message.errors)
    }
  }
}
