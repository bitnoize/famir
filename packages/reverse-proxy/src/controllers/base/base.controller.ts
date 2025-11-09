import {
  HttpBody,
  HttpHeaders,
  CampaignModel,
  EnabledLureModel,
  EnabledProxyModel,
  EnabledTargetModel,
  HttpServerError,
  HttpServerShare,
  Logger,
  RedirectorModel,
  SessionModel,
  Templater,
  Validator,
  ValidatorAssertSchema,
  ValidatorGuardSchema
} from '@famir/domain'
import { commonResponseHeaders } from '../../reverse-proxy.utils.js'

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

  protected absentShareCampaign(share: HttpServerShare): asserts share is HttpServerShare & {
    campaign: CampaignModel | undefined
  } {
    if (share['campaign']) {
      throw new Error(`Share campaign exists`)
    }
  }

  protected existsShareCampaign(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly campaign: CampaignModel
  } {
    if (!share['campaign']) {
      throw new Error(`Share campaign absent`)
    }
  }

  protected absentShareProxy(share: HttpServerShare): asserts share is HttpServerShare & {
    proxy: EnabledProxyModel | undefined
  } {
    if (share['proxy']) {
      throw new Error(`Share proxy exists`)
    }
  }

  protected existsShareProxy(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly proxy: EnabledProxyModel
  } {
    if (!share['proxy']) {
      throw new Error(`Share proxy absent`)
    }
  }

  protected absentShareTarget(share: HttpServerShare): asserts share is HttpServerShare & {
    target: EnabledTargetModel | undefined
  } {
    if (share['target']) {
      throw new Error(`Share target exists`)
    }
  }

  protected existsShareTarget(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly target: EnabledTargetModel
  } {
    if (!share['target']) {
      throw new Error(`Share target absent`)
    }
  }

  protected absentShareTargets(share: HttpServerShare): asserts share is HttpServerShare & {
    targets: EnabledTargetModel[] | undefined
  } {
    if (share['targets']) {
      throw new Error(`Share targets exists`)
    }
  }

  protected existsShareTargets(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly targets: EnabledTargetModel[]
  } {
    if (!share['targets']) {
      throw new Error(`Share targets absent`)
    }
  }

  protected absentShareRedirector(share: HttpServerShare): asserts share is HttpServerShare & {
    redirector: RedirectorModel | undefined
  } {
    if (share['redirector']) {
      throw new Error(`Share redirector exists`)
    }
  }

  protected existsShareRedirector(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly redirector: RedirectorModel
  } {
    if (!share['redirector']) {
      throw new Error(`Share redirector absent`)
    }
  }

  protected absentShareLure(share: HttpServerShare): asserts share is HttpServerShare & {
    lure: EnabledLureModel | undefined
  } {
    if (share['lure']) {
      throw new Error(`Share lure exists`)
    }
  }

  protected existsShareLure(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly lure: EnabledLureModel
  } {
    if (!share['lure']) {
      throw new Error(`Share lure absent`)
    }
  }

  protected absentShareSession(share: HttpServerShare): asserts share is HttpServerShare & {
    session: SessionModel | undefined
  } {
    if (share['session']) {
      throw new Error(`Share session exists`)
    }
  }

  protected existsShareSession(share: HttpServerShare): asserts share is HttpServerShare & {
    readonly session: SessionModel
  } {
    if (!share['session']) {
      throw new Error(`Share session absent`)
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
