import { DIContainer, LifecycleError } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  ReplServer,
  Validator,
  VALIDATOR,
} from '@famir/domain'
import { Console } from 'node:console'
import type { Readable, Writable } from 'node:stream'
import * as readline from 'readline'
import { BaseReplServer } from './base-repl-server.js'
import { REPL_SERVER_ASSETS, ReplServerAssets } from './repl-server-assets.js'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { CliReplServerConfig, REPL_SERVER_PROMPT } from './repl-server.js'
import { cliReplServerConfigSchema } from './repl-server.schemas.js'

/**
 * Options for a Cli repl-server.
 */
interface CliReplServerOptions {
  useColors: boolean
}

/**
 * Cli-based repl-server implementation.
 *
 * This server runs a REPL (Read-Eval-Print-Loop) directly in the terminal
 * where the application is running. It provides an interactive environment
 * for system administration and debugging.
 *
 * Depends:
 * - {@link Validator} via {@link VALIDATOR} token
 * - {@link Config} via {@link CONFIG} token
 * - {@link Logger} via {@link LOGGER} token
 * - {@link ReplServerAssets} via {@link REPL_SERVER_ASSETS} token
 * - {@link ReplServerRouter} via {@link REPL_SERVER_ROUTER} token
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { CliReplServer } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * CliReplServer.register(container)
 * ```
 *
 * @example
 * ```ts
 * import { DIContainer } from '@famir/common'
 * import { REPL_SERVER, ReplServer } from '@famir/domain'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Resolve from DI container
 * const replServer = container.resolve<ReplServer>(REPL_SERVER)
 *
 * // Start REPL server
 * await replServer.start()
 *
 * //  Stop server
 * await replServer.stop()
 * ```
 */
export class CliReplServer extends BaseReplServer implements ReplServer {
  /**
   * Registers the repl-server as a singleton in the DI container.
   *
   * @param container - The DI container to register in.
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new CliReplServer(
          c.resolve<Validator>(VALIDATOR),
          c.resolve<Config>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerAssets>(REPL_SERVER_ASSETS),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
        )
    )
  }

  /** Built repl-server options. */
  protected readonly options: CliReplServerOptions

  /** Underlying redline instance. */
  protected rl: readline.Interface | null = null

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
    validator: Validator,
    config: Config,
    logger: Logger,
    assets: ReplServerAssets,
    router: ReplServerRouter
  ) {
    super(validator, config, logger, assets, router)

    this.validator.addSchema('repl-server-config', cliReplServerConfigSchema)

    const conf = this.config.get<CliReplServerConfig>('repl-server-config')
    this.options = this.buildOptions(conf)
  }

  #isShutdown: boolean = false

  // eslint-disable-next-line @typescript-eslint/require-await
  async start(): Promise<void> {
    try {
      if (this.#isShutdown) {
        this.logger.debug(`ReplServer shutdown, skip start`)

        return
      }

      if (!this.rl) {
        const console = this.initConsole(process.stdout, process.stderr)

        const rl = this.initReadline(process.stdin, process.stdout)

        this.setupReadline(console, rl)

        this.rl = rl

        this.rl.prompt()

        this.logger.info(`ReplServer started`)
      } else {
        this.logger.debug(`ReplServer already started`)
      }
    } catch (error) {
      throw LifecycleError.wrap(error, {
        service: 'repl-server',
        method: 'start',
      })
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async stop(): Promise<void> {
    try {
      this.#isShutdown = true

      if (this.rl) {
        this.rl.close()

        this.rl = null

        this.logger.info(`ReplServer stopped`)
      } else {
        this.logger.debug(`ReplServer already stopped`)
      }
    } catch (error) {
      throw LifecycleError.wrap(error, {
        service: 'repl-server',
        method: 'stop',
      })
    }
  }

  protected initConsole(stdout: Writable, stderr: Writable): Console {
    return new Console({
      stdout,
      stderr,
      colorMode: this.options.useColors,
      inspectOptions: {
        showHidden: false,
        depth: null,
      },
    })
  }

  protected initReadline(input: Readable, output: Writable): readline.Interface {
    const completer = (line: string) => {
      const completions = this.router.getCommandsNames()
      const hits = completions.filter((c) => c.startsWith(line))

      return [hits.length ? hits : completions, line]
    }

    const rl = readline.createInterface({
      input,
      output,
      terminal: true,
      prompt: REPL_SERVER_PROMPT,
      historySize: 1000,
      removeHistoryDuplicates: true,
      completer,
    })

    rl.on('close', () => {
      process.kill(process.pid, 'SIGINT')
    })

    return rl
  }

  /**
   * Converts validated configuration to a repl-server options.
   */
  private buildOptions(conf: CliReplServerConfig): CliReplServerOptions {
    return {
      useColors: conf.REPL_SERVER_USE_COLORS,
    }
  }
}
