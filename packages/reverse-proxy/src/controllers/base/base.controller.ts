import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter,
  Logger,
  SessionModel,
  Validator
} from '@famir/domain'
import { AuthorizeState, ConfigureState, ReverseProxyState } from '../../reverse-proxy.js'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: HttpServerRouter,
    protected readonly controllerName: string
  ) {}

  protected isConfigureState(ctx: HttpServerContext): boolean {
    const state = ctx.getState<ReverseProxyState>()

    state.isConfigure ??= false

    return state.isConfigure
  }

  protected getConfigureState(ctx: HttpServerContext): ConfigureState {
    const state = ctx.getState<ReverseProxyState>()

    state.isConfigure ??= false

    if (!state.isConfigure) {
      throw new Error(`ConfigureState not exists`)
    }

    if (!state.campaign) {
      throw new Error(`ConfigureState campaign missing`)
    }

    if (!state.target) {
      throw new Error(`ConfigureState target missing`)
    }

    if (!state.targets) {
      throw new Error(`ConfigureState targets missing`)
    }

    return state as ConfigureState
  }

  protected setConfigureState(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    targets: EnabledTargetModel[]
  ): void {
    const state = ctx.getState<ReverseProxyState>()

    state.isConfigure = true
    state.campaign = campaign
    state.target = target
    state.targets = targets
  }

  protected isAuthorizeState(ctx: HttpServerContext): boolean {
    const state = ctx.getState<ReverseProxyState>()

    state.isAuthorize ??= false

    return state.isAuthorize
  }

  protected getAuthorizeState(ctx: HttpServerContext): AuthorizeState {
    const state = ctx.getState<ReverseProxyState>()

    state.isAuthorize ??= false

    if (!state.isAuthorize) {
      throw new Error(`AuthorizeState not exists`)
    }

    if (!state.session) {
      throw new Error(`AuthorizeState session missing`)
    }

    if (!state.proxy) {
      throw new Error(`AuthorizeState proxy missing`)
    }

    return state as AuthorizeState
  }

  protected setAuthorizeState(
    ctx: HttpServerContext,
    session: SessionModel,
    proxy: EnabledProxyModel
  ): void {
    const state = ctx.getState<ReverseProxyState>()

    state.isAuthorize = true
    state.session = session
    state.proxy = proxy
  }

  protected handleException(error: unknown, middleware: string): never {
    if (error instanceof HttpServerError) {
      error.context['controller'] = this.controllerName
      error.context['middleware'] = middleware

      throw error
    } else {
      throw new HttpServerError(`Server internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          middleware
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
