import { DIContainer } from '@famir/common'
import {
  Config,
  CONFIG,
  Logger,
  LOGGER,
  REPL_SERVER,
  REPL_SERVER_ROUTER,
  ReplServer,
  ReplServerError,
  ReplServerRouter
} from '@famir/domain'
import repl from 'node:repl'
import util from 'node:util'
import { CliReplServerConfig, CliReplServerOptions } from './repl-server.js'

export class CliReplServer implements ReplServer {
  static inject(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) =>
        new CliReplServer(
          c.resolve<Config<CliReplServerConfig>>(CONFIG),
          c.resolve<Logger>(LOGGER),
          c.resolve<ReplServerRouter>(REPL_SERVER_ROUTER)
        )
    )
  }

  protected readonly options: CliReplServerOptions

  constructor(
    config: Config<CliReplServerConfig>,
    protected readonly logger: Logger,
    protected readonly router: ReplServerRouter
  ) {
    this.options = this.buildOptions(config.data)

    this.logger.debug(`ReplServer initialized`)
  }

  protected replServer: repl.REPLServer | null = null

  async listen(): Promise<void> {
    this.replServer = repl.start({
      terminal: true,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: true,
      writer: (output) =>
        util.inspect(output, {
          depth: 4,
          colors: this.options.useColors
        }),
      breakEvalOnSigint: true
    })

    this.replServer.on('reset', (context) => {
      this.defineContext(context)
    })

    this.replServer.on('exit', () => {
      console.log(`So long!`)

      process.kill(process.pid, 'SIGINT')
    })

    this.defineContext(this.replServer.context)

    this.logger.debug(`ReplServer listening`)

    console.log(`Welcome to Fake-Mirrors REPL!`)

    this.replServer.displayPrompt()
  }

  async close(): Promise<void> {
    if (this.replServer) {
      this.replServer.close()

      this.replServer = null
    }

    this.logger.info(`ReplServer closed`)
  }

  protected defineContext(context: object) {
    const value: Record<string, unknown> = {}

    const apiCalls = this.router.resolve()

    apiCalls.forEach(([name, apiCall]) => {
      value[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          if (error instanceof ReplServerError) {
            error.context['apiCall'] = name
            error.context['data'] = data

            throw error
          } else {
            throw new ReplServerError(`Server unknown error`, {
              cause: error,
              context: {
                apiCall: name,
                data
              },
              code: 'INTERNAL_ERROR'
            })
          }
        }
      }
    })

    Object.defineProperty(context, 'famir', {
      configurable: false,
      enumerable: true,
      value: value
    })
  }

  private buildOptions(config: CliReplServerConfig): CliReplServerOptions {
    return {
      prompt: config.REPL_SERVER_PROMPT,
      useColors: config.REPL_SERVER_USE_COLORS
    }
  }
}
