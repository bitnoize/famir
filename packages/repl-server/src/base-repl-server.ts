import { serializeError } from '@famir/common'
import { Config } from '@famir/config'
import { Logger } from '@famir/logger'
import { Validator } from '@famir/validator'
import { Console } from 'node:console'
import repl from 'node:repl'
import type { Readable, Writable } from 'node:stream'
import { ReplServerCommand, ReplServerCommandArgs } from './repl-server-command.js'
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
   * @param router - The router instance.
   */
  constructor(
    protected readonly validator: Validator,
    protected readonly config: Config,
    protected readonly logger: Logger,
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

          const parsedArgs = command.parseArgs(args)

          if (!parsedArgs) {
            rs.displayPrompt()

            return
          }

          if (command.checkHelp(parsedArgs)) {
            command.showHelp(console)

            rs.displayPrompt()

            return
          }

          this.executeCommand(console, command, parsedArgs, () => {
            rs.displayPrompt()
          })
        },
      })
    })
  }

  /**
   * Executes command with arguments.
   *
   * @param console - The underlying Console instance.
   * @param command - The command instance.
   * @param args - The parsed command args.
   */
  protected executeCommand(
    console: Console,
    command: ReplServerCommand<ReplServerCommandArgs>,
    args: ReplServerCommandArgs,
    finallyFun: () => void
  ) {
    command
      .execute(console, args)
      .catch((error: unknown) => {
        if (error instanceof ReplServerError) {
          console.error(`Command error: ${error.code} ${error.message}`)

          this.logger.warn(`ReplServer execute command error`, {
            error: serializeError(error),
          })
        } else {
          console.error(`Command unknown error`)

          this.logger.error(`ReplServer execute command unknown error`, {
            error: serializeError(error),
          })
        }
      })
      .finally(finallyFun)
  }
}
