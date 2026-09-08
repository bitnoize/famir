import { serializeError } from '@famir/common'
import { Config, Logger, ReplServer, ReplServerError, Validator } from '@famir/domain'
import { Console } from 'node:console'
import type { Readable, Writable } from 'node:stream'
import { Interface as ReadlineInterface } from 'readline'
import { ReplServerRouter } from './repl-server-router.js'

/**
 * Abstract base class for all repl-servers.
 *
 * All specific repl-server implementations should extend this class to ensure
 * consistent behavior and reduce code duplication.
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
   * Initializes and starts the Readline.
   *
   * @param input - The input readable stream.
   * @param output - The output writable stream.
   * @returns The initialized Readline instance.
   */
  protected abstract initReadline(input: Readable, output: Writable): ReadlineInterface

  /**
   * Setup readline to parse and execute commands.
   *
   * @param console - The underlying Console instance.
   * @param rl - The readline instance.
   */
  protected setupReadline(console: Console, rl: ReadlineInterface) {
    rl.on('line', (line: string) => {
      const trimmedLine = line.trim()

      if (!trimmedLine) {
        rl.prompt()

        return
      }

      const match = trimmedLine.match(/^(\S+)\s+(.*)$/)

      const [commandName, args] = match ? [match[1], match[2] ?? ''] : [trimmedLine, '']

      if (!commandName) {
        rl.prompt()

        return
      }

      const command = this.router.getCommand(commandName)

      if (!command) {
        console.error(`Command '${commandName}' not exists.`)

        rl.prompt()

        return
      }

      const parsedArgs = command.parseArgs(args)

      if (!parsedArgs) {
        rl.prompt()

        return
      }

      if (command.checkHelp(parsedArgs)) {
        command.showHelp(console)

        rl.prompt()

        return
      }

      command
        .execute(console, parsedArgs)
        .catch((error: unknown) => {
          if (error instanceof ReplServerError) {
            console.error(`Command error: ${error.code} ${error.message}`)
            console.error(error.context)

            if (error.cause) {
              console.error({ ...error.cause })
            }

            if (error.isInternalError) {
              this.logger.error(`ReplServer execute command internal error`, {
                error: serializeError(error),
              })
            }
          } else {
            console.error(`Command unknown error`)

            this.logger.error(`ReplServer execute command unknown error`, {
              error: serializeError(error),
            })
          }
        })
        .finally(() => {
          rl.prompt()
        })
    })
  }
}
