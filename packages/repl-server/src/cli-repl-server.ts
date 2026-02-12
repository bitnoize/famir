import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import repl from 'node:repl'
import util from 'node:util'
import { REPL_SERVER_ROUTER, ReplServerRouter } from './repl-server-router.js'
import { ReplServerError } from './repl-server.error.js'
import {
  CliReplServerConfig,
  CliReplServerOptions,
  REPL_SERVER,
  ReplServer,
  replServerDict
} from './repl-server.js'

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

  // eslint-disable-next-line @typescript-eslint/require-await
  async start(): Promise<void> {
    if (!this.replServer) {
      this.replServer = this.replServerStart()

      this.logger.debug(`ReplServer started`)
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async stop(): Promise<void> {
    if (this.replServer) {
      this.replServer.close()

      this.replServer = null

      this.logger.debug(`ReplServer stopped`)
    }
  }

  protected replServerStart(): repl.REPLServer {
    const replServer = repl.start({
      terminal: true,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: true,
      writer: (output) =>
        util.inspect(output, {
          depth: 4,
          colors: this.options.useColors
        })
    })

    replServer.on('reset', (context) => {
      this.defineContext(context)
    })

    replServer.on('exit', () => {
      console.log(replServerDict.leave)

      process.kill(process.pid, 'SIGINT')
    })

    this.defineContext(replServer.context)

    console.log(replServerDict.greet)

    replServer.displayPrompt()

    return replServer
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
