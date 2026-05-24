import { BootstrapError, serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Console } from 'node:console'
import repl from 'node:repl'
import type { Readable, Writable } from 'node:stream'
import {
  REPL_SERVER_ASSET_BANNER_GREET,
  REPL_SERVER_ASSET_BANNER_LEAVE,
  ReplServerAssets,
} from './repl-server-assets.js'
import {
  ReplServerCommand,
  ReplServerCommandArgs,
  ReplServerCommandContext,
} from './repl-server-command.js'
import { ReplServerRouter } from './repl-server-router.js'
import { ReplServerError } from './repl-server.error.js'
import { ReplServer } from './repl-server.js'

/**
 * Abstract base class for all repl-servers.
 *
 * All specific repl-server implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
 *
 * @internal
 */
export abstract class BaseReplServer implements ReplServer {
  /**
   * Creates a new repl-server instance.
   *
   * @param validator - The validator instance.
   * @param config - The config instance.
   * @param logger - The logger instance.
   * @param assets - The assets instance.
   * @param router - The router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
    protected readonly assets: ReplServerAssets,
    protected readonly router: ReplServerRouter
  ) {}

  abstract start(): Promise<void>

  abstract stop(): Promise<void>

  /**
   * Initializes the Console.
   *
   * @param stdout - The output writable stream.
   * @param stderr - The error writable stream.
   * @returns The initialized Console instance.
   */
  protected abstract initConsole(stdout: Writable, stderr: Writable): Console

  /**
   * Initializes and starts the REPL server.
   *
   * @param input - The input readable stream.
   * @param output - The output writable stream.
   * @returns The initialized REPL server instance.
   */
  protected abstract initReplServer(input: Readable, output: Writable): repl.REPLServer

  /**
   * Defines the REPL server context.
   *
   * @param context - The context object.
   */
  protected defineContext(context: object) {
    Object.defineProperty(context, 'famir', {
      value: {},
    })
  }

  /**
   * Defines the REPL server commands.
   *
   * @param console - The underlying Console instance.
   * @param rs - The underlying REPL server instance.
   * @returns The initialized REPL server instance.
   */
  protected defineCommands(console: Console, rs: repl.REPLServer) {
    this.router.eachCommand((command) => {
      rs.defineCommand(command.spec.name, {
        help: command.spec.description,
        action: (args: string) => {
          rs.clearBufferedCommand()

          const parsedArgs = this.parseCommand(console, rs, command, args)

          if (parsedArgs) {
            this.executeCommand(console, rs, command, parsedArgs)
          }
        },
      })
    })
  }

  /**
   * Parses command arguments.
   *
   * @param console - The underlying Console instance.
   * @param rs - The underlying REPL server instance.
   * @param command - The command instance.
   * @returns Parsed command arguments, or `null` if parsing fails.
   */
  protected parseCommand(
    console: Console,
    rs: repl.REPLServer,
    command: ReplServerCommand<ReplServerCommandArgs>,
    args: string
  ): ReplServerCommandArgs | null {
    try {
      const parsedArgs = command.parseArgs(args)

      if (parsedArgs.help) {
        command.showHelp(console, true)

        rs.displayPrompt()

        return null
      }

      return parsedArgs
    } catch (error) {
      if (error instanceof ReplServerError) {
        console.error(`Parse command error: ${error.code} ${error.message}`)

        if (error.code === 'INTERNAL_ERROR') {
          this.logger.error(`ReplServer parse command internal error`, {
            error: serializeError(error),
          })
        } else if (error.code === 'BAD_REQUEST') {
          command.showHelp(console)
        }
      } else {
        console.error(`Parse command critical error, see log for details`)

        this.logger.error(`ReplServer parse command critical error`, {
          error: serializeError(error),
        })
      }

      rs.displayPrompt()

      return null
    }
  }

  /**
   * Executes command with arguments.
   *
   * @param console - The underlying Console instance.
   * @param rs - The underlying REPL server instance.
   * @param command - The command instance.
   * @param args - The parsed command args.
   */
  protected executeCommand(
    console: Console,
    rs: repl.REPLServer,
    command: ReplServerCommand<ReplServerCommandArgs>,
    args: ReplServerCommandArgs
  ) {
    command
      .execute(console, args, rs.context as ReplServerCommandContext)
      .catch((error: unknown) => {
        if (error instanceof ReplServerError) {
          console.error(`Execute command error: ${error.code} ${error.message}`)

          if (error.code === 'INTERNAL_ERROR') {
            this.logger.error(`ReplServer execute command internal error`, {
              error: serializeError(error),
            })
          } else if (error.code === 'BAD_REQUEST') {
            command.showHelp(console)
          }
        } else {
          console.error(`Execute command critical error, see log for details`)

          this.logger.error(`ReplServer process command unknown error`, {
            error: serializeError(error),
          })
        }
      })
      .finally(() => {
        rs.displayPrompt()
      })
  }

  /**
   * Handles bootstrap operation errors.
   *
   * Re-throws `BootstrapError` instances with additional context, or wraps
   * unknown errors into a `BootstrapError`.
   *
   * @param error - The caught error.
   * @param method - The method where the error occurred.
   * @returns Never returns, always throws.
   */
  protected handleBootstrapError(error: unknown, method: string): never {
    if (error instanceof BootstrapError) {
      error.context['service'] = 'repl-server'
      error.context['method'] = method

      throw error
    } else {
      throw new BootstrapError(`Unknown error`, {
        cause: error,
        context: {
          service: 'repl-server',
          method,
        },
      })
    }
  }

  /**
   * Retrieves the banner greet asset.
   *
   * @returns The asset content.
   */
  protected getBannerGreet(): string {
    return this.assets.get('banner-greet.txt') ?? REPL_SERVER_ASSET_BANNER_GREET
  }

  /**
   * Retrieves the banner leave asset.
   *
   * @returns The asset content.
   */
  protected getBannerLeave(): string {
    return this.assets.get('banner-leave.txt') ?? REPL_SERVER_ASSET_BANNER_LEAVE
  }
}
