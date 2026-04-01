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
  ReplServer
} from './repl-server.js'

/*
 * Cli REPL server implementation
 */
export class CliReplServer implements ReplServer {
  /*
   * Register dependency
   */
  static register(container: DIContainer) {
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

  /*
   * Start server
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async start(): Promise<void> {
    if (!this.replServer) {
      this.replServer = this.replServerStart()

      this.logger.debug(`ReplServer started`)
    }
  }

  /*
   * Stop server
   */
  // eslint-disable-next-line @typescript-eslint/require-await
  async stop(): Promise<void> {
    if (this.replServer) {
      this.replServer.close()

      this.replServer = null

      this.logger.debug(`ReplServer stopped`)
    }
  }

  protected replServerStart(): repl.REPLServer {
    const bannerGreet = this.router.getAsset('banner-greet.txt') ?? REPL_SERVER_BANNER_GREET
    const bannerLeave = this.router.getAsset('banner-leave.txt') ?? REPL_SERVER_BANNER_LEAVE

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
      console.log(bannerLeave)

      process.kill(process.pid, 'SIGINT')
    })

    this.defineContext(replServer.context)
    //this.defineCommands(replServer)

    console.log(bannerGreet)

    replServer.displayPrompt()

    return replServer
  }

  protected defineContext(context: object) {
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
                data
              },
              code: 'INTERNAL_ERROR'
            })
          }
        }
      }
    })

    Object.defineProperty(context, 'famir', {
      value: apiCalls
    })

    Object.defineProperty(context, 'getAssetNames', {
      value: (): string[] => {
        return this.router.getAssetNames()
      }
    })

    Object.defineProperty(context, 'getAsset', {
      value: (assetName: unknown): string | undefined => {
        if (!(assetName && typeof assetName === 'string')) {
          throw new TypeError(`Asset name not a string`)
        }

        return this.router.getAsset(assetName)
      }
    })
  }

  //protected defineCommands(replServer: repl.REPLServer) {}

  private buildOptions(config: CliReplServerConfig): CliReplServerOptions {
    return {
      prompt: config.REPL_SERVER_PROMPT,
      useColors: config.REPL_SERVER_USE_COLORS
    }
  }
}
