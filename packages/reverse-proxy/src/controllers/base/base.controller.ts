import {
  CampaignModel,
  CreateMessageModel,
  EnabledLureModel,
  EnabledProxyModel,
  EnabledTargetModel,
  HttpServerError,
  HttpServerLocals,
  Logger,
  RedirectorModel,
  SessionModel,
  Templater,
  Validator,
  ValidatorAssertSchema,
  ValidatorGuardSchema
} from '@famir/domain'

export abstract class BaseController {
  protected readonly guardSchema: ValidatorGuardSchema
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly templater: Templater,
    protected readonly controllerName: string
  ) {
    this.guardSchema = validator.guardSchema
    this.assertSchema = validator.assertSchema

    this.logger.debug(`Controller initialized`, {
      controller: this.controllerName
    })
  }

  protected absentLocalsCampaign(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    campaign: CampaignModel | undefined
  } {
    if (locals['campaign']) {
      throw new Error(`Locals campaign exists`)
    }
  }

  protected existsLocalsCampaign(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly campaign: CampaignModel
  } {
    if (!locals['campaign']) {
      throw new Error(`Locals campaign absent`)
    }
  }

  protected absentLocalsProxy(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    proxy: EnabledProxyModel | undefined
  } {
    if (locals['proxy']) {
      throw new Error(`Locals proxy exists`)
    }
  }

  protected existsLocalsProxy(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly proxy: EnabledProxyModel
  } {
    if (!locals['proxy']) {
      throw new Error(`Locals proxy absent`)
    }
  }

  protected absentLocalsTarget(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    target: EnabledTargetModel | undefined
  } {
    if (locals['target']) {
      throw new Error(`Locals target exists`)
    }
  }

  protected existsLocalsTarget(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly target: EnabledTargetModel
  } {
    if (!locals['target']) {
      throw new Error(`Locals target absent`)
    }
  }

  protected absentLocalsTargets(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    targets: EnabledTargetModel[] | undefined
  } {
    if (locals['targets']) {
      throw new Error(`Locals targets exists`)
    }
  }

  protected existsLocalsTargets(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly targets: EnabledTargetModel[]
  } {
    if (!locals['targets']) {
      throw new Error(`Locals targets absent`)
    }
  }

  protected absentLocalsRedirector(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    redirector: RedirectorModel | undefined
  } {
    if (locals['redirector']) {
      throw new Error(`Locals redirector exists`)
    }
  }

  protected existsLocalsRedirector(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly redirector: RedirectorModel
  } {
    if (!locals['redirector']) {
      throw new Error(`Locals redirector absent`)
    }
  }

  protected absentLocalsLure(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    lure: EnabledLureModel | undefined
  } {
    if (locals['lure']) {
      throw new Error(`Locals lure exists`)
    }
  }

  protected existsLocalsLure(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly lure: EnabledLureModel
  } {
    if (!locals['lure']) {
      throw new Error(`Locals lure absent`)
    }
  }

  protected absentLocalsSession(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    session: SessionModel | undefined
  } {
    if (locals['session']) {
      throw new Error(`Locals session exists`)
    }
  }

  protected existsLocalsSession(locals: HttpServerLocals): asserts locals is HttpServerLocals & {
    readonly session: SessionModel
  } {
    if (!locals['session']) {
      throw new Error(`Locals session absent`)
    }
  }

  protected absentLocalsCreateMessage(
    locals: HttpServerLocals
  ): asserts locals is HttpServerLocals & {
    createMessage: CreateMessageModel | undefined
  } {
    if (locals['createMessage']) {
      throw new Error(`Locals createMessage exists`)
    }
  }

  protected existsLocalsCreateMessage(
    locals: HttpServerLocals
  ): asserts locals is HttpServerLocals & {
    readonly createMessage: CreateMessageModel
  } {
    if (!locals['createMessage']) {
      throw new Error(`Locals createMessage absent`)
    }
  }

  protected exceptionWrapper(error: unknown, handler: string): never {
    if (error instanceof HttpServerError) {
      error.context['controller'] = this.controllerName
      error.context['handler'] = handler

      throw error
    } else {
      throw new HttpServerError(`Internal error`, {
        cause: error,
        context: {
          controller: this.controllerName,
          handler
        },
        code: 'INTERNAL_ERROR'
      })
    }
  }
}
