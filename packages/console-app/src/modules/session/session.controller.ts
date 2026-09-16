import { DIContainer } from '@famir/common'
import {
  Logger,
  LOGGER,
  SessionModel,
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
import { ListSessionsArgs, ReadSessionArgs, RevokeSessionArgs } from './session.js'
import {
  listSessionsArgsSchema,
  readSessionArgsSchema,
  revokeSessionArgsSchema,
} from './session.schemas.js'
import { SESSION_SERVICE, type SessionService } from './session.service.js'

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
          c.resolve<Templater>(TEMPLATER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
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
   * @param templater - The templater instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   * @param sessionService - The session service instance.
   */
  constructor(
    validator: Validator,
    logger: Logger,
    templater: Templater,
    assets: ReplServerAssets,
    router: ReplServerRouter,
    protected readonly sessionService: SessionService
  ) {
    super(validator, logger, templater, assets, router)

    this.validator
      .addSchema('console-read-session-args', readSessionArgsSchema)
      .addSchema('console-revoke-session-args', revokeSessionArgsSchema)
      .addSchema('console-list-sessions-args', listSessionsArgsSchema)
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
      null,
      async (console, spec, args) => {
        const [campaignId, sessionId] = args._

        const session = await this.sessionService.read({
          campaignId,
          sessionId,
        })

        this.showSessionModel(console, session)
      }
    )

    this.router.addCommand<RevokeSessionArgs>(
      {
        name: 'session-revoke',
        description: `Revoking a session and stopping authorization.`,
        schemaName: 'console-revoke-session-args',
        options: [],
        params: ['campaign-id', 'session-id'],
      },
      null,
      async (console, spec, args) => {
        const [campaignId, sessionId] = args._

        await this.sessionService.revoke({
          campaignId,
          sessionId,
        })

        console.log(`Session revoked!`)
      }
    )

    this.router.addCommand<ListSessionsArgs>(
      {
        name: 'session-list',
        description: `Lists campaign session history.`,
        schemaName: 'console-list-sessions-args',
        options: [
          {
            name: 'limit',
            description: `Limit on the number of records.`,
            type: 'number',
            alias: 'l',
            default: 25,
          },
        ],
        params: ['campaign-id'],
      },
      null,
      async (console, spec, args) => {
        const [campaignId] = args._

        const sessions = await this.sessionService.list({
          campaignId,
          limit: args.limit,
        })

        this.showSessionCollection(console, sessions)
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
      isRevoked: session.isRevoked,
      messageCount: session.messageCount,
      createdAt: session.createdAt.toISOString(),
    })
  }

  private showSessionCollection(console: Console, sessions: SessionModel[]) {
    console.table(
      sessions.map((session) => {
        return {
          //campaignId: session.campaignId,
          sessionId: session.sessionId,
          proxyId: session.proxyId,
          //secret: session.secret,
          isUpgraded: session.isUpgraded,
          isRevoked: session.isRevoked,
          messageCount: session.messageCount,
          createdAt: session.createdAt.toISOString(),
        }
      })
    )
  }
}
