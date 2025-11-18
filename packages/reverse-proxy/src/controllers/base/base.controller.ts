import {
  EnabledFullTargetModel,
  EnabledLureModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  FullMessageModel,
  FullRedirectorModel,
  HttpServerError,
  HttpServerRouter,
  HttpServerState,
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

  protected absentStateCampaign(state: HttpServerState): asserts state is HttpServerState & {
    campaign: FullCampaignModel | undefined
  } {
    if (state['campaign']) {
      throw new HttpServerError(`State campaign exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateCampaign(state: HttpServerState): asserts state is HttpServerState & {
    readonly campaign: FullCampaignModel
  } {
    if (!state['campaign']) {
      throw new HttpServerError(`State campaign absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateProxy(state: HttpServerState): asserts state is HttpServerState & {
    proxy: EnabledProxyModel | undefined
  } {
    if (state['proxy']) {
      throw new HttpServerError(`State proxy exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateProxy(state: HttpServerState): asserts state is HttpServerState & {
    readonly proxy: EnabledProxyModel
  } {
    if (!state['proxy']) {
      throw new HttpServerError(`State proxy absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateTarget(state: HttpServerState): asserts state is HttpServerState & {
    target: EnabledFullTargetModel | undefined
  } {
    if (state['target']) {
      throw new HttpServerError(`State target exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateTarget(state: HttpServerState): asserts state is HttpServerState & {
    readonly target: EnabledFullTargetModel
  } {
    if (!state['target']) {
      throw new HttpServerError(`State target absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateTargets(state: HttpServerState): asserts state is HttpServerState & {
    targets: EnabledTargetModel[] | undefined
  } {
    if (state['targets']) {
      throw new HttpServerError(`State targets exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateTargets(state: HttpServerState): asserts state is HttpServerState & {
    readonly targets: EnabledTargetModel[]
  } {
    if (!state['targets']) {
      throw new HttpServerError(`State targets absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateRedirector(state: HttpServerState): asserts state is HttpServerState & {
    redirector: FullRedirectorModel | undefined
  } {
    if (state['redirector']) {
      throw new HttpServerError(`State redirector exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateRedirector(state: HttpServerState): asserts state is HttpServerState & {
    readonly redirector: FullRedirectorModel
  } {
    if (!state['redirector']) {
      throw new HttpServerError(`State redirector absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateLure(state: HttpServerState): asserts state is HttpServerState & {
    lure: EnabledLureModel | undefined
  } {
    if (state['lure']) {
      throw new HttpServerError(`State lure exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateLure(state: HttpServerState): asserts state is HttpServerState & {
    readonly lure: EnabledLureModel
  } {
    if (!state['lure']) {
      throw new HttpServerError(`State lure absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateSession(state: HttpServerState): asserts state is HttpServerState & {
    session: SessionModel | undefined
  } {
    if (state['session']) {
      throw new HttpServerError(`State session exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateSession(state: HttpServerState): asserts state is HttpServerState & {
    readonly session: SessionModel
  } {
    if (!state['session']) {
      throw new HttpServerError(`State session absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateMessage(state: HttpServerState): asserts state is HttpServerState & {
    message: FullMessageModel | undefined
  } {
    if (state['message']) {
      throw new HttpServerError(`State message exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateMessage(state: HttpServerState): asserts state is HttpServerState & {
    readonly message: FullMessageModel
  } {
    if (!state['message']) {
      throw new HttpServerError(`State message absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected handleException(error: unknown, step: string): never {
    if (error instanceof HttpServerError) {
      error.context['controller'] = this.controllerName
      error.context['step'] = step

      throw error
    } else {
      throw new HttpServerError(`Controller internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          step
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
