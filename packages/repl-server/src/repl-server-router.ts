import { DIContainer } from '@famir/common'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import {
  ReplServerCommand,
  ReplServerCommandAction,
  ReplServerCommandArgs,
  ReplServerCommandHelp,
  ReplServerCommandSpec,
} from './repl-server-command.js'

/**
 * DI token for the repl-server router.
 */
export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

/**
 * Represents the repl-server router.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Logger} via {@link LOGGER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER_ROUTER, ReplServerRouter } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * ReplServerRouter.register(container)
 *
 * // Resolve from DI container
 * const router = container.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
 *
 * // Add custom command
 * router.addCommand(
 *   'echo',
 *   'Simple echo command',
 *   [],
 *   (console, spec) => {
 *     console.log(`Example: .%s %s\n`, spec.name, `bla bla bla`)
 *   },
 *   async (console, spec, args) => {
 *     console.log(spec)
 *     console.log(args)
 *   }
 * })
 *
 * // Activate router
 * router.activate()
 * ```
 */
export class ReplServerRouter {
  /**
   * Registers the router as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReplServerRouter>(
      REPL_SERVER_ROUTER,
      (c) => new ReplServerRouter(c.resolve<Validator>(VALIDATOR), c.resolve<Logger>(LOGGER))
    )
  }

  /**
   * Resolves the router from the DI container.
   *
   * @param container - The DI container to resolve from.
   * @returns The router instance.
   */
  static resolve(container: DIContainer) {
    return container.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
  }

  /** Map of registered commands. */
  protected readonly commands: Map<string, ReplServerCommand<ReplServerCommandArgs>> = new Map()

  /**
   * Creates a new router instance.
   *
   * @param validator - The validator instance.
   * @param logger - The logger instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger
  ) {}

  #isActive: boolean = false

  /**
   * Activates the router.
   *
   * Once activated, commands can be retrieved but not added.
   */
  activate() {
    if (!this.#isActive) {
      this.#isActive = true
    }
  }

  /**
   * Adds a command in the router.
   *
   * Commands can only be added before the router is activated.
   *
   * @param spec - The command spec object.
   * @param help - The command help function.
   * @param action - The command action function.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If a command with the same name already exists.
   */
  addCommand<T extends ReplServerCommandArgs>(
    spec: ReplServerCommandSpec,
    help: ReplServerCommandHelp,
    action: ReplServerCommandAction<T>
  ): this {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }

    if (this.commands.has(spec.name)) {
      throw new Error(`Command already exists: ${spec.name}`)
    }

    const command = new ReplServerCommand<T>(this.validator, spec, help, action)

    this.commands.set(spec.name, command as ReplServerCommand<ReplServerCommandArgs>)

    this.logger.debug(`ReplServerRouter add command`, {
      command: spec.name,
    })

    return this
  }

  /**
   * Loop over all registered commands.
   *
   * Commands can only be retrieved after the router is activated.
   *
   * @param cb - The callback function to call for each command.
   * @throws Error If the router is not active.
   */
  eachCommand(cb: (command: ReplServerCommand<ReplServerCommandArgs>) => void) {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }

    this.commands.forEach((command) => {
      cb(command)
    })
  }
}
