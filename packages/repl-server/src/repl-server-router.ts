import { DIContainer } from '@famir/common'
import { Logger, LOGGER, Validator, VALIDATOR } from '@famir/domain'
import {
  ReplServerCommand,
  ReplServerCommandAction,
  ReplServerCommandArgs,
  ReplServerCommandSpec,
} from './repl-server-command.js'

/**
 * DI token for the repl-server router.
 */
export const REPL_SERVER_ROUTER = Symbol('ReplServerRouter')

type ReplServerRouterCommands = Map<string, ReplServerCommand<ReplServerCommandArgs>>

/**
 * Represents the repl-server router.
 *
 * The router acts as root of a REPL server and handles the routing commants
 * to their respective handlers.
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
      (c) => new this(c.resolve<Validator>(VALIDATOR), c.resolve<Logger>(LOGGER))
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

  /** Mapping of commands to their actions. */
  protected readonly commands: ReplServerRouterCommands = new Map()

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
   * Checks if the router is active.
   *
   * @returns `true` if the router is active, `false` otherwise.
   */
  get isActive(): boolean {
    return this.#isActive
  }

  /**
   * Activates the router.
   *
   * Once activated, commands can be retrieved but not added.
   *
   * @returns This router for method chaining.
   */
  activate(): this {
    if (!this.#isActive) {
      this.#isActive = true
    }

    return this
  }

  /**
   * Adds a command in the router.
   *
   * Commands can only be added before the router is activated.
   *
   * @param spec - The command spec object.
   * @param action - The command action function.
   * @returns This router for method chaining.
   * @throws Error If the router is already active.
   * @throws Error If a command with the same name already exists.
   */
  add<T extends ReplServerCommandArgs>(
    spec: ReplServerCommandSpec,
    action: ReplServerCommandAction<T>
  ): this {
    this.sureNotActive()

    if (this.commands.has(spec.name)) {
      throw new Error(`Command already exists: ${spec.name}`)
    }

    const command = new ReplServerCommand<T>(this.validator, spec, action)

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
  find(commandName: string): ReplServerCommand<ReplServerCommandArgs> | undefined {
    this.sureIsActive()

    return this.commands.get(commandName)
  }

  /**
   * Retrieves all commands overview object.
   *
   * Overview object can only be retrieved after the router is activated.
   *
   * @returns The command overview object.
   * @throws Error If the router is not active.
   */
  overview(): Record<string, string> {
    this.sureIsActive()

    const overview: Record<string, string> = {}

    this.commands.forEach((command) => {
      overview[command.spec.name] = command.spec.description
    })

    return overview
  }

  /**
   * Retrieves all commands names list.
   *
   * Names list can only be retrieved after the router is activated.
   *
   * @returns The command names list.
   * @throws Error If the router is not active.
   */
  names(): string[] {
    this.sureIsActive()

    return Array.from(this.commands.keys())
  }

  protected sureNotActive() {
    if (this.#isActive) {
      throw new Error(`Router is active`)
    }
  }

  protected sureIsActive() {
    if (!this.#isActive) {
      throw new Error(`Router not active`)
    }
  }
}
