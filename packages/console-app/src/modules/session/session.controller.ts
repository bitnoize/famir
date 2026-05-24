import { DIContainer } from '@famir/common'
import { SessionModel } from '@famir/database'
import { Logger, LOGGER } from '@famir/logger'
import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
import { Validator, VALIDATOR } from '@famir/validator'
import { BaseController } from '../base/index.js'
import { ReadSessionArgs } from './session.js'
import { readSessionArgsSchema } from './session.schemas.js'
import { type SessionService, SESSION_SERVICE } from './session.service.js'

/**
 * DI token for the session controller.
 *
 * @category Session
 */
export const SESSION_CONTROLLER = Symbol('SessionController')

/**
 * Represents the session controller.
 *
 * @category Session
 */
export class SessionController extends BaseController {
  /**
   * Registers the controller as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<SessionController>(
      SESSION_CONTROLLER,
      (c) =>
        new SessionController(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER),
          c.resolve<SessionService>(SESSION_SERVICE)
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
    return container.resolve<SessionController>(SESSION_CONTROLLER)
  }

  /**
   * Creates a new controller instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   * @param router - The repl-server router instance.
   * @param sessionService - The session service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    router: ReplServerRouter,
    protected readonly sessionService: SessionService
  ) {
    super(validator, logger, router)

    this.validator.addSchema('console-read-session-args', readSessionArgsSchema)
  }

  /**
   * Registers used commands in the router.
   */
  use() {
    this.router.addCommand<ReadSessionArgs>(
      {
        name: 'session-read',
        description: `Reads the session by its ID.`,
        schemaName: 'console-read-session-args',
        options: [],
        params: ['campaign-id', 'session-id'],
      },
      (console, spec) => {
        console.log(`Returns the session model.\n`)

        console.log(
          `// Reads a session:\n` + `.${spec.name} httpbin 10db93aeb3ae4a3887a839997bf8840e\n`
        )
      },
      async (console, spec, args) => {
        const session = await this.sessionService.read({
          campaignId: args._[0],
          sessionId: args._[1],
        })

        this.showSessionModel(console, session)
      }
    )
  }

  private showSessionModel(console: Console, session: SessionModel) {
    console.table({
      campaignId: session.campaignId,
      sessionId: session.sessionId,
      proxyId: session.proxyId,
      //secret: session.secret,
      isUpgraded: session.isUpgraded,
      messageCount: session.messageCount,
      createdAt: session.createdAt.toISOString(),
    })
  }
}
