import {
  EnabledFullTargetModel,
  EnabledLureModel,
  EnabledProxyModel,
  EnabledTargetModel,
  FullCampaignModel,
  FullMessageModel,
  FullRedirectorModel,
  HttpServerContextState,
  HttpServerError,
  HttpServerRouter,
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

  protected absentStateCampaign(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    campaign: FullCampaignModel | undefined
  } {
    if (state['campaign']) {
      throw new HttpServerError(`ContextState campaign exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateCampaign(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly campaign: FullCampaignModel
  } {
    if (!state['campaign']) {
      throw new HttpServerError(`ContextState campaign absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateProxy(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    proxy: EnabledProxyModel | undefined
  } {
    if (state['proxy']) {
      throw new HttpServerError(`ContextState proxy exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateProxy(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly proxy: EnabledProxyModel
  } {
    if (!state['proxy']) {
      throw new HttpServerError(`ContextState proxy absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateTarget(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    target: EnabledFullTargetModel | undefined
  } {
    if (state['target']) {
      throw new HttpServerError(`ContextState target exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateTarget(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly target: EnabledFullTargetModel
  } {
    if (!state['target']) {
      throw new HttpServerError(`ContextState target absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateTargets(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    targets: EnabledTargetModel[] | undefined
  } {
    if (state['targets']) {
      throw new HttpServerError(`ContextState targets exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateTargets(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly targets: EnabledTargetModel[]
  } {
    if (!state['targets']) {
      throw new HttpServerError(`ContextState targets absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateRedirector(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    redirector: FullRedirectorModel | undefined
  } {
    if (state['redirector']) {
      throw new HttpServerError(`ContextState redirector exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateRedirector(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly redirector: FullRedirectorModel
  } {
    if (!state['redirector']) {
      throw new HttpServerError(`ContextState redirector absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateLure(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    lure: EnabledLureModel | undefined
  } {
    if (state['lure']) {
      throw new HttpServerError(`ContextState lure exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateLure(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly lure: EnabledLureModel
  } {
    if (!state['lure']) {
      throw new HttpServerError(`ContextState lure absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateSession(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    session: SessionModel | undefined
  } {
    if (state['session']) {
      throw new HttpServerError(`ContextState session exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateSession(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly session: SessionModel
  } {
    if (!state['session']) {
      throw new HttpServerError(`ContextState session absent`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected absentStateMessage(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    message: FullMessageModel | undefined
  } {
    if (state['message']) {
      throw new HttpServerError(`ContextState message exists`, {
        code: 'INTERNAL_ERROR'
      })
    }
  }

  protected existsStateMessage(
    state: HttpServerContextState
  ): asserts state is HttpServerContextState & {
    readonly message: FullMessageModel
  } {
    if (!state['message']) {
      throw new HttpServerError(`ContextState message absent`, {
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
