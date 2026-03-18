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
  REPL_SERVER_BANNER_GREET,
  REPL_SERVER_BANNER_LEAVE,
  ReplServer
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
    Object.defineProperty(context, 'famir', {
      value: this.buildApiCalls()
    })

    Object.defineProperty(context, 'phish', {
      value: this.buildAssets()
    })

    Object.defineProperty(context, 'campaignId', {
      writable: true,
      value: null
    })

    Object.defineProperty(context, 'lockSecret', {
      writable: true,
      value: null
    })
  }

  //protected defineCommands(replServer: repl.REPLServer) {}

  private buildApiCalls(): Record<string, unknown> {
    const apiCalls: Record<string, unknown> = {}

    this.router.getApiCalls().forEach(([name, apiCall]) => {
      apiCalls[name] = async (data: unknown): Promise<unknown> => {
        try {
          return await apiCall(data)
        } catch (error) {
          if (error instanceof ReplServerError) {
            error.context['apiCall'] = name
            error.context['data'] = data

            throw error
          } else {
            throw new ReplServerError(`Server internal error`, {
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

    return apiCalls
  }

  private buildAssets(): Record<string, unknown> {
    const assets: Record<string, unknown> = {}

    const excludeNames = ['banner-greet.txt', 'banner-leave.txt']

    this.router
      .getAssets()
      .filter(([name]) => !excludeNames.some((excludeName) => name === excludeName))
      .forEach(([name, asset]) => {
        if (name.match(/\.json$/)) {
          try {
            assets[name] = JSON.parse(asset)
          } catch {
            assets[name] = null
          }
        } else {
          assets[name] = asset
        }
      })

    return assets
  }

  private buildOptions(config: CliReplServerConfig): CliReplServerOptions {
    return {
      prompt: config.REPL_SERVER_PROMPT,
      useColors: config.REPL_SERVER_USE_COLORS
    }
  }
}
