import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import { Validator, VALIDATOR } from '@famir/validator'
import { Console } from 'node:console'
import repl from 'node:repl'
import type { Readable, Writable } from 'node:stream'
import { BaseReplServer } from './base-repl-server.js'
import { REPL_SERVER_ASSETS, ReplServerAssets } from './repl-server-assets.js'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { CliReplServerConfig, REPL_SERVER, ReplServer } from './repl-server.js'
import { cliReplServerConfigSchema } from './repl-server.schemas.js'

/**
 * Options for a Cli repl-server.
 */
interface CliReplServerOptions {
  prompt: string
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
 * import { REPL_SERVER, ReplServer, CliReplServer } from '@famir/repl-server'
 *
 * // Get container singleton
 * const container = DIContainer.getInstance()
 *
 * // Register in DI container
 * CliReplServer.register(container)
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

  /** Underlying REPL server instance. */
  protected rs: repl.REPLServer | null = null

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

    const configData = this.config.get<CliReplServerConfig>('repl-server-config')
    this.options = this.buildOptions(configData)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async start(): Promise<void> {
    try {
      if (!this.rs) {
        const console = this.initConsole(process.stdout, process.stderr)

        this.rs = this.initReplServer(process.stdin, process.stdout)

        this.rs.on('reset', (context) => {
          this.defineContext(context)
        })

        this.rs.on('exit', () => {
          console.log(this.getBannerLeave())

          process.kill(process.pid, 'SIGINT')
        })

        this.defineContext(this.rs.context)

        this.defineCommands(console, this.rs)

        console.log(this.getBannerGreet())

        this.rs.displayPrompt()

        this.logger.debug(`ReplServer started`)
      } else {
        this.logger.debug(`ReplServer already started`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'start')
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async stop(): Promise<void> {
    try {
      if (this.rs) {
        this.rs.close()

        this.rs = null

        this.logger.debug(`ReplServer stopped`)
      } else {
        this.logger.debug(`ReplServer already stopped`)
      }
    } catch (error) {
      this.handleBootstrapError(error, 'stop')
    }
  }

  protected initConsole(stdout: Writable, stderr: Writable): Console {
    return new Console({
      stdout,
      stderr,
      colorMode: this.options.useColors,
      inspectOptions: { depth: 8 },
    })
  }

  protected initReplServer(input: Readable, output: Writable): repl.REPLServer {
    return repl.start({
      input,
      output,
      terminal: true,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: false,
    })
  }

  /**
   * Converts validated configuration to a repl-server options.
   *
   * @param data - The validated configuration object.
   * @returns The repl-server options object.
   */
  private buildOptions(data: CliReplServerConfig): CliReplServerOptions {
    return {
      prompt: data.REPL_SERVER_PROMPT,
      useColors: data.REPL_SERVER_USE_COLORS,
    }
  }
}
