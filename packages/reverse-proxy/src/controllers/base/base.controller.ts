import {
  CampaignModel,
  CreateMessageModel,
  EnabledLureModel,
  EnabledTargetModel,
  HttpServerError,
  HttpServerRequest,
  HttpServerRequestLocals,
  Logger,
  RedirectorModel,
  SessionModel,
  Validator,
  ValidatorAssertSchema
} from '@famir/domain'

export abstract class BaseController {
  protected readonly assertSchema: ValidatorAssertSchema

  constructor(
    validator: Validator,
    protected readonly logger: Logger,
    protected readonly controllerName: string
  ) {
    this.assertSchema = validator.assertSchema

    this.logger.debug(
      {
        module: 'reverse-proxy',
        controller: this.controllerName
      },
      `Controller initialized`
    )
  }

  protected absentLocalsCampaign(locals: HttpServerRequestLocals) {
    if (locals.campaign !== undefined) {
      throw new Error(`Locals campaign exists`)
    }
  }

  protected existsLocalsCampaign(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly campaign: CampaignModel
  } {
    if (locals.campaign === undefined) {
      throw new Error(`Locals campaign absent`)
    }
  }

  protected absentLocalsTarget(locals: HttpServerRequestLocals) {
    if (locals.target !== undefined) {
      throw new Error(`Locals target exists`)
    }
  }

  protected existsLocalsTarget(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly target: EnabledTargetModel
  } {
    if (locals.target === undefined) {
      throw new Error(`Locals target absent`)
    }
  }

  protected absentLocalsTargets(locals: HttpServerRequestLocals) {
    if (locals.targets !== undefined) {
      throw new Error(`Locals targets exists`)
    }
  }

  protected existsLocalsTargets(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly targets: EnabledTargetModel[]
  } {
    if (locals.targets === undefined) {
      throw new Error(`Locals targets absent`)
    }
  }

  protected absentLocalsRedirector(locals: HttpServerRequestLocals) {
    if (locals.redirector !== undefined) {
      throw new Error(`Locals redirector exists`)
    }
  }

  protected existsLocalsRedirector(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly redirector: RedirectorModel
  } {
    if (locals.redirector === undefined) {
      throw new Error(`Locals redirector absent`)
    }
  }

  protected absentLocalsLure(locals: HttpServerRequestLocals) {
    if (locals.lure !== undefined) {
      throw new Error(`Locals lure exists`)
    }
  }

  protected existsLocalsLure(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly lure: EnabledLureModel
  } {
    if (locals.lure === undefined) {
      throw new Error(`Locals lure absent`)
    }
  }

  protected absentLocalsSession(locals: HttpServerRequestLocals) {
    if (locals.session !== undefined) {
      throw new Error(`Locals session exists`)
    }
  }

  protected existsLocalsSession(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly session: SessionModel
  } {
    if (locals.session === undefined) {
      throw new Error(`Locals session absent`)
    }
  }

  protected absentLocalsMessage(locals: HttpServerRequestLocals) {
    if (locals.message !== undefined) {
      throw new Error(`Locals message exists`)
    }
  }

  protected existsLocalsMessage(
    locals: HttpServerRequestLocals
  ): asserts locals is HttpServerRequestLocals & {
    readonly message: CreateMessageModel
  } {
    if (locals.message === undefined) {
      throw new Error(`Locals message absent`)
    }
  }

  protected exceptionFilter(error: unknown, handler: string, request: HttpServerRequest): never {
    if (error instanceof HttpServerError) {
      error.context['module'] = 'reverse-proxy'
      error.context['controller'] = this.controllerName
      error.context['handler'] = handler
      error.context['request'] = request

      throw error
    } else {
      throw new HttpServerError(`Controller internal error`, {
        cause: error,
        context: {
          module: 'reverse-proxy',
          controller: this.controllerName,
          handler,
          request
        },
        code: 'UNKNOWN',
        status: 500
      })
    }
  }
}
