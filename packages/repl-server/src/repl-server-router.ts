import { DIContainer } from '@famir/common'
import { Logger, LOGGER, Validator, VALIDATOR } from '@famir/domain'
import {
  ReplServerCommand,
  ReplServerCommandAction,
  ReplServerCommandArgs,
  ReplServerCommandManual,
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
 * import { ReplServerRouter } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * ReplServerRouter.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER_ROUTER, type ReplServerRouter } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve from DI container
 * const router = container.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
 *
 * interface SimpleArgs {
 *   _: string[]
 * }
 *
 * // Add custom command
 * router.addCommand<EchoArgs>(
 *   {
 *     name: 'echo',
 *     description: `Simple echo command`,
 *     schemaName: 'echo-args',
 *     options: [],
 *     params: [],
 *   },
 *   (spec) => `Some manual`,
 *   async (console, spec, args) => {
 *     console.log(args)
 *   }
 * )
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
   * @param manual - The command manual function.
   * @param action - The command action function.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If a command with the same name already exists.
   */
  addCommand<T extends ReplServerCommandArgs>(
    spec: ReplServerCommandSpec,
    manual: ReplServerCommandManual | null,
    action: ReplServerCommandAction<T>
  ): this {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }

    if (this.commands.has(spec.name)) {
      throw new Error(`Command already exists: ${spec.name}`)
    }

    const command = new ReplServerCommand<T>(this.validator, spec, manual, action)

    this.commands.set(spec.name, command as ReplServerCommand<ReplServerCommandArgs>)

    this.logger.debug(`ReplServerRouter add command: ${spec.name}`)

    return this
  }

  /**
   * Retrieves a command for a specific name.
   *
   * Commands can only be retrieved after the router is activated.
   *
   * @param commandName - The name of the command.
   * @returns The command object, or `undefined` if not found.
   * @throws Error If the router is not active.
   */
  getCommand(commandName: string): ReplServerCommand<ReplServerCommandArgs> | undefined {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }

    return this.commands.get(commandName)
  }

  getCommandsOverview(): Record<string, string> {
    const result: Record<string, string> = {}

    this.commands.forEach((command) => {
      result[command.spec.name] = command.spec.description
    })

    return result
  }

  getCommandsNames(): string[] {
    return Array.from(this.commands.keys())
  }
}
