import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerContext,
  HttpServerError,
  HttpServerRouter,
  Logger,
  MessageModel,
  SessionModel,
  Validator
} from '@famir/domain'
import {
  AuthorizeState,
  CompleteState,
  ReverseProxyState,
  SetupMirrorState
} from '../../reverse-proxy.js'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: HttpServerRouter,
    protected readonly controllerName: string
  ) {}

  //
  // SetupMirrorState
  //

  protected isSetupMirrorState(ctx: HttpServerContext): boolean {
    const state = ctx.getState<ReverseProxyState>()

    state.isSetupMirror ??= false

    return state.isSetupMirror
  }

  protected getSetupMirrorState(ctx: HttpServerContext): SetupMirrorState {
    const state = ctx.getState<ReverseProxyState>()

    state.isSetupMirror ??= false

    if (!state.isSetupMirror) {
      throw new Error(`SetupMirrorState not exists`)
    }

    if (!state.campaign) {
      throw new Error(`SetupMirrorState campaign missing`)
    }

    if (!state.target) {
      throw new Error(`SetupMirrorState target missing`)
    }

    if (!state.targets) {
      throw new Error(`SetupMirrorState targets missing`)
    }

    return state as SetupMirrorState
  }

  protected setSetupMirrorState(
    ctx: HttpServerContext,
    campaign: FullCampaignModel,
    target: EnabledFullTargetModel,
    targets: EnabledTargetModel[]
  ): void {
    const state = ctx.getState<ReverseProxyState>()

    state.isSetupMirror = true
    state.campaign = campaign
    state.target = target
    state.targets = targets
  }

  //
  // AuthorizeState
  //

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

  //
  // CompleteState
  //

  protected isCompleteState(ctx: HttpServerContext): boolean {
    const state = ctx.getState<ReverseProxyState>()

    state.isComplete ??= false

    return state.isComplete
  }

  protected getCompleteState(ctx: HttpServerContext): CompleteState {
    const state = ctx.getState<ReverseProxyState>()

    state.isComplete ??= false

    if (!state.isComplete) {
      throw new Error(`CompleteState not exists`)
    }

    if (!state.message) {
      throw new Error(`CompleteState message missing`)
    }

    return state as CompleteState
  }

  protected setCompleteState(ctx: HttpServerContext, message: MessageModel): void {
    const state = ctx.getState<ReverseProxyState>()

    state.isComplete = true
    state.message = message
  }

  protected handleException(error: unknown, middleware: string): never {
    if (error instanceof HttpServerError) {
      error.context['middleware'] = middleware

      throw error
    } else {
      throw new HttpServerError(`Server internal error`, {
        cause: error,
        context: {
          middleware
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
