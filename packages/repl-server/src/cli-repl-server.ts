import { DIContainer } from '@famir/common'
import { Config, CONFIG } from '@famir/config'
import { Logger, LOGGER } from '@famir/logger'
import repl from 'node:repl'
import util from 'node:util'
import { ReplServerRouter } from './repl-server-router.js'
import { ReplServerError } from './repl-server.error.js'
import {
  CliReplServerConfig,
  CliReplServerOptions,
  REPL_SERVER,
  REPL_SERVER_BANNER_GREET,
  REPL_SERVER_BANNER_LEAVE,
  REPL_SERVER_ROUTER,
  ReplServer,
} from './repl-server.js'

/**
 * Cli REPL server implementation
 *
 * @category none
 */
export class CliReplServer implements ReplServer {
  /**
   * Register dependency
   */
  static register(container: DIContainer) {
    container.registerSingleton<ReplServer>(
      REPL_SERVER,
      (c) => new CliReplServer(c.resolve(CONFIG), c.resolve(LOGGER), c.resolve(REPL_SERVER_ROUTER))
    )
  }

  protected readonly options: CliReplServerOptions

  constructor(
    protected readonly config: Config<CliReplServerConfig>,
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

  private replServerStart(): repl.REPLServer {
    const replServer = repl.start({
      terminal: true,
      useGlobal: false,
      prompt: this.options.prompt,
      ignoreUndefined: true,
      preview: true,
      writer: (output) =>
        util.inspect(output, {
          depth: 4,
          colors: this.options.useColors,
        }),
    })

    replServer.on('reset', (context) => {
      this.defineContext(context)
    })

    replServer.on('exit', () => {
      console.log(this.getBannerLeave())

      process.kill(process.pid, 'SIGINT')
    })

    this.defineContext(replServer.context)
    //this.defineCommands(replServer)

    console.log(this.getBannerGreet())

    replServer.displayPrompt()

    return replServer
  }

  private defineContext(context: object) {
    Object.defineProperty(context, 'famir', {
      value: this.wrapApiCalls(),
    })

    Object.defineProperty(context, 'assets', {
      value: this.router.buildAssets(),
    })
  }

  //private defineCommands(replServer: repl.REPLServer) {}

  private wrapApiCalls(): Record<string, unknown> {
    const apiCalls: Record<string, unknown> = {}

    this.router.getApiCalls().forEach(([apiCallName, apiCall]) => {
      apiCalls[apiCallName] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          if (error instanceof ReplServerError) {
            error.context['apiCall'] = apiCallName
            error.context['data'] = data

            throw error
          } else {
            throw new ReplServerError(`Server internal error`, {
              cause: error,
              context: {
                apiCall: apiCallName,
                data,
              },
              code: 'INTERNAL_ERROR',
            })
          }
        }
      }
    })

    return apiCalls
  }

  private getBannerGreet(): string {
    return this.router.getAsset('banner-greet.txt') ?? REPL_SERVER_BANNER_GREET
  }

  private getBannerLeave(): string {
    return this.router.getAsset('banner-leave.txt') ?? REPL_SERVER_BANNER_LEAVE
  }

  private buildOptions(config: CliReplServerConfig): CliReplServerOptions {
    return {
      prompt: config.REPL_SERVER_PROMPT,
      useColors: config.REPL_SERVER_USE_COLORS,
    }
  }
}
