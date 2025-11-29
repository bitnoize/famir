import {
  EnabledFullTargetModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  HttpServerError,
  HttpServerRouter,
  HttpState,
  Logger,
  SessionModel,
  Validator
} from '@famir/domain'

export abstract class BaseController {
  constructor(
    protected readonly validator: Validator,
    protected readonly logger: Logger,
    protected readonly router: HttpServerRouter,
    protected readonly controllerName: string
  ) {}

  /*
  protected absentConfigure(state: HttpState): asserts state is HttpState & {
    campaign: FullCampaignModel | undefined
    target: EnabledFullTargetModel | undefined
    targets: EnabledTargetModel[] | undefined
  } {
    if (state['campaign']) {
      throw new Error(`State campaign exists`)
    }

    if (state['target']) {
      throw new Error(`State target exists`)
    }

    if (state['targets']) {
      throw new Error(`State targets exists`)
    }
  }
  */

  protected testConfigure(state: HttpState): asserts state is HttpState & {
    readonly campaign: FullCampaignModel
    readonly target: EnabledFullTargetModel
    readonly targets: EnabledTargetModel[]
  } {
    if (!state['campaign']) {
      throw new Error(`State campaign absent`)
    }

    if (!state['target']) {
      throw new Error(`State target absent`)
    }

    if (!state['targets']) {
      throw new Error(`State targets absent`)
    }
  }

  /*
  protected absentAuthorize(state: HttpState): asserts state is HttpState & {
    proxy: EnabledProxyModel | undefined
    session: SessionModel | undefined
  } {
    if (state['proxy']) {
      throw new Error(`State proxy exists`)
    }

    if (state['session']) {
      throw new Error(`State session exists`)
    }
  }
  */

  protected testAuthorize(state: HttpState): asserts state is HttpState & {
    readonly proxy: EnabledProxyModel
    readonly session: SessionModel
  } {
    if (!state['proxy']) {
      throw new Error(`State proxy absent`)
    }

    if (!state['session']) {
      throw new Error(`State session absent`)
    }
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
